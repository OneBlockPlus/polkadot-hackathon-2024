package oracle

import (
	"encoding/json"
	"fmt"
	"io/ioutil"
	"keyring-desktop/crosschain/chain/bitcoin"
	"keyring-desktop/utils"
	"net/http"
	"net/url"
)

type LbryTxHistoryResponse struct {
	Items []LbryTxHistoryItem `json:"data"`
}

type LbryTxHistoryItem struct {
	Hash         string `json:"hash"`
	CreditAmount string `json:"credit_amount"`
	DebitAmount  string `json:"debit_amount"`
	TxTime       int64  `json:"transaction_time"`
}

func GetTransactionsFromLbryExplorer(client *http.Client, config utils.ChainConfig, address string) (*LbryTxHistoryResponse, error) {
	query := fmt.Sprintf("SELECT T.id, T.hash, T.input_count, T.output_count, T.block_hash_id, TA.debit_amount, TA.credit_amount, B.height, B.confirmations, IFNULL(T.transaction_time, T.created_at) AS transaction_time FROM transaction T LEFT JOIN block B ON T.block_hash_id = B.hash RIGHT JOIN (SELECT transaction_id, debit_amount, credit_amount FROM transaction_address TA JOIN address A ON TA.address_id=A.id WHERE A.address=\"%s\") TA ON TA.transaction_id = T.id ORDER BY transaction_time DESC LIMIT 0,100;", address)
	url := config.TxHistoryUrl + "?query=" + bitcoin.EncodeURIComponent(url.QueryEscape(query))

	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		utils.Sugar.Error("Error creating request:", err)
		return nil, err
	}

	// Perform the request
	resp, err := client.Do(req)
	if err != nil {
		utils.Sugar.Error("Error making request:", err)
		return nil, err
	}

	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	var txHistory LbryTxHistoryResponse
	err = json.Unmarshal(body, &txHistory)
	if err != nil {
		return nil, err
	}

	return &txHistory, nil
}
