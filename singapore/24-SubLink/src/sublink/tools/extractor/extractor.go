package extractor

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"net/http"
	"os"

	scale "github.com/itering/scale.go"
	"github.com/itering/scale.go/utiles"
	"github.com/joho/godotenv"
	"github.com/mr-tron/base58"
)

type Extractor struct {
	targetChain string
	domainName  string
	pathName    string
	urlFile     string
}

type metadataBody struct {
	Jsonrpc string `json:"jsonrpc"`
	Result  string `json:"result"`
	Id      string `json:"id"`
}

func Init() Extractor {
	err := godotenv.Load("./.env")
	if err != nil {
		panic("Error loading .env file")
	}

	targetChain := os.Getenv("TARGET_CHAIN_RPC")
	domainName := os.Getenv("DOMAIN_NAME")
	pathName := os.Getenv("PATH_URL")
	urlFile := os.Getenv("URL_FILE")

	fmt.Printf("targetChain: %s\n", targetChain)
	fmt.Printf("domainName: %s\n", domainName)
	fmt.Printf("pathName: %s\n", pathName)

	return Extractor{
		targetChain,
		domainName,
		pathName,
		urlFile,
	}
}

func (e Extractor) GetMetadata() ([]byte, error) {
	client := http.Client{}
	postData := map[string]string{"id": "1", "jsonrpc": "2.0", "method": "state_getMetadata"}
	jsonData, err := json.Marshal(postData)
	if err != nil {
		return nil, err
	}

	request, err := http.NewRequest(http.MethodPost, e.targetChain, bytes.NewBuffer(jsonData))
	if err != nil {
		return nil, err
	}

	request.Header.Set("Content-Type", "application/json")

	getResp, err := client.Do(request)
	if err != nil {
		return nil, err
	}

	defer getResp.Body.Close()

	getBody, err := ioutil.ReadAll(getResp.Body)
	if err != nil {
		return nil, err
	}

	return getBody, nil
}

func (e Extractor) ParseMetadata(getBody []byte) (scale.MetadataDecoder, error) {
	var body struct {
		Jsonrpc string `json:"jsonrpc"`
		Result  string `json:"result"`
		Id      string `json:"id"`
	}

	err := json.Unmarshal(getBody, &body)
	if err != nil {
		return scale.MetadataDecoder{}, err
	}

	// fmt.Println("Json Unmarshal:", []byte(body.Result))
	decoder := scale.MetadataDecoder{}
	decoder.Init(utiles.HexToBytes(body.Result))
	decoder.Process()

	return decoder, nil
}

func (e Extractor) GenerateLink(decoder scale.MetadataDecoder) error {
	file, err := os.Create(e.urlFile)
	if err != nil {
		fmt.Printf("Failed to create file: %v\n", err)
		return err
	}
	defer file.Close()

	for i, pallet_info := range decoder.Metadata.Metadata.Modules {
		fmt.Printf("{%d}: %v\n", i, pallet_info.Name)
		for j, extrinsic := range pallet_info.Calls {
			fmt.Printf("\textrinsic{%d}: %v{ \n", j, extrinsic.Name)
			url := fmt.Sprintf("https://%s/%s/%s/%s/", e.domainName, e.pathName, pallet_info.Name, extrinsic.Name)
			encoder_str := "{"
			for k, param := range extrinsic.Args {
				fmt.Printf("\t\tparam{%d} - %v: %v \n", k, param.Name, param.Type)
				encoder_str = fmt.Sprintf("%s\"%v\":\"%v\",", encoder_str, param.Name, param.Type)
			}
			encoder_str = encoder_str[0:len(encoder_str)-1] + "}"
			chk := base58.Encode([]byte(encoder_str))
			url = fmt.Sprintf("%s?param=%s", url, chk)

			_, err = file.WriteString(url)
			if err != nil {
				fmt.Printf("Failed to write to file: %v\n", err)
				return err
			}

			_, err = file.WriteString("\n")
			if err != nil {
				fmt.Printf("Failed to write to file: %v\n", err)
				return err
			}

			fmt.Println("\t\n}")
		}
	}

	return nil
}

func (e Extractor) Extractor() {
	body, err := e.GetMetadata()
	if err != nil {
		log.Fatal(err)
		panic("Extract failed: GetMetadata")
	}

	decoder, err := e.ParseMetadata(body)
	if err != nil {
		log.Fatal(err)
		panic("Extract failed: ParseMetadata")
	}

	err = e.GenerateLink(decoder)
	if err != nil {
		log.Fatal(err)
		panic("Extract failed: GenerateLink")
	}

	fmt.Println("Extract success!")
}
