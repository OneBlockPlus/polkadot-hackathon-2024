package bitcoin

import (
	"bytes"
	"context"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io/ioutil"
	xc "keyring-desktop/crosschain"
	"net/http"
	"net/url"
	"strings"

	"github.com/rapid7/go-get-proxied/proxy"
	"github.com/shopspring/decimal"
	log "github.com/sirupsen/logrus"
)

type LbryClient struct {
	http            *http.Client
	Asset           *xc.AssetConfig
	opts            ClientOptions
	EstimateGasFunc xc.EstimateGasFunc
}

type ChainQueryBalance struct {
	Success bool          `json:"success"`
	Error   string        `json:"error,omitempty"`
	Data    []BalanceData `json:"data"`
}

type BalanceData struct {
	Balance string `json:"balance"`
}

type ChainQueryOutputs struct {
	Success bool         `json:"success"`
	Error   string       `json:"error,omitempty"`
	Data    []OutputData `json:"data"`
}

type OutputData struct {
	TransactionHash string `json:"transaction_hash"`
	ScriptPubKeyHex string `json:"script_pub_key_hex"`
	Vout            uint32 `json:"vout"`
	Type            string `json:"type"`
	Value           string `json:"value"`
}

func NewLbryClient(cfgI xc.ITask) (*LbryClient, error) {
	asset := cfgI.GetAssetConfig()
	cfg := cfgI.GetNativeAsset()
	opts := DefaultClientOptions()

	httpClient := &http.Client{}
	p := proxy.NewProvider("").GetProxy("https", "")
	if p != nil {
		transport := &http.Transport{
			Proxy: http.ProxyURL(p.URL()),
		}
		httpClient = &http.Client{
			Transport: transport,
		}
	}
	httpClient.Timeout = opts.Timeout

	params, err := GetParams(cfg)
	if err != nil {
		return nil, err
	}

	opts.Chaincfg = params
	opts.Host = cfg.URL
	opts.Password = cfg.Auth

	return &LbryClient{
		http:  httpClient,
		Asset: asset,
		opts:  opts,
	}, nil
}

func (client *LbryClient) FetchBalance(ctx context.Context, address xc.Address) (xc.AmountBlockchain, error) {
	amount := xc.NewAmountBlockchainFromUint64(0)

	query := "select balance from address where address = '" + string(address) + "';"
	url := "https://chainquery.lbry.com/api/sql" + "?query=" + url.QueryEscape(query)
	response, err := client.http.Get(url)
	if err != nil {
		return amount, err
	}

	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		log.Error(err)
		return amount, err
	}

	var balanceInfo ChainQueryBalance
	err = json.Unmarshal(body, &balanceInfo)
	if err != nil {
		log.Error(err)
		return amount, err
	}

	if balanceInfo.Success {
		if len(balanceInfo.Data) == 0 {
			return amount, nil
		}
		balance := balanceInfo.Data[0].Balance
		balNum, err := decimal.NewFromString(balance)
		if err != nil {
			log.Error(err)
			return amount, err
		}
		amount = xc.AmountHumanReadable(balNum).ToBlockchain(client.Asset.Decimals)
		return amount, nil
	}

	return amount, errors.New("balance is not available")
}

func (client *LbryClient) FetchNativeBalance(ctx context.Context, address xc.Address) (xc.AmountBlockchain, error) {
	return client.FetchBalance(ctx, address)
}

func (client *LbryClient) GetContractMetadata(ctx context.Context) (*xc.ContractMetadata, error) {
	return nil, errors.New("not supported")
}

func (client *LbryClient) FetchUnspentOutputs(ctx context.Context, address xc.Address) ([]Output, error) {
	// query := "select o.transaction_hash, o.vout, o.value, o.script_pub_key_hex, o.type from address a inner join transaction_address ta on a.id = ta.address_id inner join output o on o.transaction_id = ta.transaction_id and o.is_spent = 0 and o.type not in (\"nonstandard\",'nulldata') and o.address_list = '[\"" + string(address) + "'] where a.address = '" + string(address) + "';"
	query := fmt.Sprintf("select o.transaction_hash, o.vout, o.value, o.script_pub_key_hex, o.type from address a inner join transaction_address ta on a.id = ta.address_id inner join output o on o.transaction_id = ta.transaction_id and o.is_spent = 0 and o.type not in (\"nonstandard\",\"nulldata\") and o.address_list = '[\"%s\"]' where a.address = \"%s\";", address, address)
	url := "https://chainquery.lbry.com/api/sql" + "?query=" + EncodeURIComponent(url.QueryEscape(query))
	response, _ := client.http.Get(url)

	fmt.Println("url: ", string(url))
	fmt.Println("query: ", string(query))

	body, err := ioutil.ReadAll(response.Body)
	if err != nil {
		log.Error(err)
		return []Output{}, err
	}

	var outputsInfo ChainQueryOutputs
	err = json.Unmarshal(body, &outputsInfo)
	if err != nil {
		log.Error(err)
		return []Output{}, err
	}

	if outputsInfo.Success {
		outputs := make([]Output, len(outputsInfo.Data))
		for i, output := range outputsInfo.Data {
			amountDecimal, err := decimal.NewFromString(output.Value)
			if err != nil {
				log.Error(err)
				return []Output{}, err
			}
			amount := xc.AmountHumanReadable(amountDecimal).ToBlockchain(client.Asset.Decimals)
			pubkeyScript, err := hex.DecodeString(output.ScriptPubKeyHex)
			if err != nil {
				return []Output{}, err
			}
			hash, err := hex.DecodeString(output.TransactionHash)
			if err != nil {
				return []Output{}, err
			}
			// reverse
			for i, j := 0, len(hash)-1; i < j; i, j = i+1, j-1 {
				hash[i], hash[j] = hash[j], hash[i]
			}
			outputs[i] = Output{
				Outpoint: Outpoint{
					Hash:  hash,
					Index: output.Vout,
				},
				Value:        amount,
				PubKeyScript: pubkeyScript,
			}
		}

		return outputs, nil
	}

	return []Output{}, nil
}

func (client *LbryClient) EstimateGas(ctx context.Context) (xc.AmountBlockchain, error) {
	defaultGasFeePerByte := xc.NewAmountBlockchainFromUint64(30) // TODO make it configurable by user

	// feeRes := btcjson.EstimateSmartFeeResult{}

	// estimate using last 1 blocks
	// numBlocks := 3
	// if err := client.send(ctx, &feeRes, "estimatesmartfee", numBlocks); err != nil {
	// 	return defaultGasFeePerByte, fmt.Errorf("estimating smart fee: %v", err)
	// }

	// if feeRes.Errors != nil && len(feeRes.Errors) > 0 {
	// 	return defaultGasFeePerByte, fmt.Errorf("estimating smart fee: %v", feeRes.Errors[0])
	// }

	// amountDecimal := decimal.NewFromFloat(*feeRes.FeeRate)
	// amount := xc.AmountHumanReadable(amountDecimal).ToBlockchain(client.Asset.Decimals)
	// fmt.Println("satsPerByte: ", amountDecimal)

	return defaultGasFeePerByte, nil
}

func (client *LbryClient) RegisterEstimateGasCallback(estimateGas xc.EstimateGasFunc) {
	client.EstimateGasFunc = estimateGas
}

func (client *LbryClient) FetchTxInput(ctx context.Context, from xc.Address, to xc.Address) (xc.TxInput, error) {
	input := NewTxInput()
	unspentOutputs, err := client.FetchUnspentOutputs(ctx, from)
	if err != nil {
		return nil, err
	}
	input.UnspentOutputs = unspentOutputs

	gasPerByte, err := client.EstimateGas(ctx)
	if err != nil {
		return nil, err
	}
	input.GasPricePerByte = gasPerByte

	fmt.Println("unspentOutputs: ", unspentOutputs)
	fmt.Println("gasPerByte: ", gasPerByte)

	return input, nil
}

func (client *LbryClient) FetchTxInfo(ctx context.Context, txHash xc.TxHash) (xc.TxInfo, error) {
	panic("implement me")
}

func (client *LbryClient) SubmitTx(ctx context.Context, tx xc.Tx) (xc.TxHash, error) {
	txId := tx.Hash()
	serial, err := tx.Serialize()
	if err != nil {
		return "", fmt.Errorf("bad tx: %v", err)
	}
	resp := ""
	if err := client.send(ctx, &resp, "sendrawtransaction", hex.EncodeToString(serial)); err != nil {
		return "", fmt.Errorf("bad \"sendrawtransaction\": %v", err)
	}
	return txId, nil
}

func (client *LbryClient) send(ctx context.Context, resp interface{}, method string, params ...interface{}) error {
	// Encode the request.
	data, err := encodeRequest(method, params)
	fmt.Println("data: ", string(data))
	if err != nil {
		return err
	}

	// Create request and add basic authentication headers. The context is
	// not attached to the request, and instead we all each attempt to run
	// for the timeout duration, and we keep attempting until success, or
	// the context is done.
	req, err := http.NewRequest("POST", client.opts.Host, bytes.NewBuffer(data))
	if err != nil {
		return fmt.Errorf("building http request: %v", err)
	}
	req.Header.Set("Content-Type", "application/json")
	req.SetBasicAuth(client.opts.User, client.opts.Password)
	if client.opts.AuthHeader != "" {
		req.Header.Set(client.opts.AuthHeader, client.opts.AuthHeaderValue)
	}

	// Send the request and decode the response.
	res, err := client.http.Do(req)
	if err != nil {
		return fmt.Errorf("sending http request: %v", err)
	}
	defer res.Body.Close()
	if res.StatusCode == 401 {
		return fmt.Errorf("http response: %v", res.Status)
	}
	if err := decodeResponse(resp, res.Body); err != nil {
		return fmt.Errorf("decoding http response: %v", err)
	}
	return nil
}

func EncodeURIComponent(input string) string {
	tmp1 := strings.ReplaceAll(input, "+", "%20")
	tmp2 := strings.ReplaceAll(tmp1, "%28", "(")
	tmp3 := strings.ReplaceAll(tmp2, "%29", ")")
	return tmp3
}
