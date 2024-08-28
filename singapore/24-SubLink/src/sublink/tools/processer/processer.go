package processer

import (
	"bufio"
	"encoding/json"
	"fmt"
	"net/url"
	"os"

	"github.com/joho/godotenv"
	"github.com/mr-tron/base58"
)

type Processer struct {
	urlFile  string
	bodyFile string
}

func Init() Processer {
	err := godotenv.Load("./.env")
	if err != nil {
		panic("Error loading .env file")
	}

	urlFile := os.Getenv("URL_FILE")
	bodyFile := os.Getenv("BODY_FILE")

	return Processer{
		urlFile,
		bodyFile,
	}
}

func (p Processer) ProcesseAll() {
	inputfile, err := os.Open(p.urlFile)
	if err != nil {
		fmt.Println("Error opening file:", err)
		return
	}
	defer inputfile.Close()

	scanner := bufio.NewScanner(inputfile)
	output := make(map[string]string)

	for scanner.Scan() {
		single_url := scanner.Text()
		parsedURL, err := url.ParseRequestURI(single_url)
		if err != nil {
			fmt.Printf("Error parsing URL: %v\n", err)
			return
		}

		value := parsedURL.Query()
		paramjson, err := base58.Decode(value["param"][0])
		if err != nil {
			fmt.Printf("Failed to base58 decode: %v\n", err)
			return
		}

		var jsonObj map[string]string
		json.Unmarshal(paramjson, &jsonObj)

		body := "<div class=\"centerdiv\"> <img class=\"simage\" src=\"/pic/logo.png\" alt=\"sublink\" />"
		body += "<p class=\"sublink-processer\"> Sublink Processer </p>"

		for key, _ := range jsonObj {
			body += "<div class=\"element-left\">"
			body += "<p class=\"param-name\">" + key + "</p>"
			body += fmt.Sprintf("<input class=\"text-field\" type=\"text\" id=%s name=%s />", key, key)
			body += "</div>"
		}

		body += "</div>"

		fmt.Println(body)

		output[parsedURL.Path] = body
	}

	json, err := json.Marshal(output)
	if err != nil {
		panic("ProcesseAll Marshal")
	}

	file, err := os.Create(p.bodyFile)
	if err != nil {
		panic("ProcesseAll Marshal")
	}
	defer file.Close()

	file.Write(json)
}
