package database

type Card struct {
	Id          int `db:"card_id"`
	Name        string
	Selected    bool
	Puk         string
	PairingCode string `db:"pairing_code"`
	PairingKey  string `db:"pairing_key"`
	PairingIdx  string `db:"pairing_index"`
}

type Account struct {
	Id              int    `db:"account_id"`
	CardId          int    `db:"card_id"`
	ChainName       string `db:"chain_name"`
	Address         string `db:"address"`
	SelectedAccount bool   `db:"selected_account"`
}

type Asset struct {
	Id              int     `db:"asset_id"`
	AccountId       int     `db:"account_id"`
	TokenSymbol     string  `db:"token_symbol"`
	ContractAddress string  `db:"contract_address"`
	Balance         string  `db:"balance"`
	Price           float32 `db:"price"`
}

type DatabaseTokenConfig struct {
	Id        int    `db:"config_id"`
	ChainName string `db:"chain_name"`
	Symbol    string `db:"symbol"`
	PriceId   string `db:"price_id"`
	Decimals  uint8  `db:"decimals"`
	Contract  string `db:"contract"`
}

type DatabaseTransactionInfo struct {
	ChainName string `db:"chain_name" json:"chainName"`
	Address   string `db:"address" json:"address"`
	Hash      string `db:"hash" json:"hash"`
	Timestamp int64  `db:"timestamp" json:"timestamp"`
	Status    string `db:"status" json:"status"`
	From      string `db:"from_addr" json:"from"`
	To        string `db:"to_addr" json:"to"`
	Value     string `db:"value" json:"value"`
	Fee       string `db:"fee" json:"fee"`
}

type DatabaseTokenTransferInfo struct {
	ChainName string `db:"chain_name" json:"chainName"`
	Address   string `db:"address" json:"address"`
	Hash      string `db:"hash" json:"hash"`
	Timestamp int64  `db:"timestamp" json:"timestamp"`
	From      string `db:"from_addr" json:"from"`
	To        string `db:"to_addr" json:"to"`
	Value     string `db:"value" json:"value"`
	Contract  string `db:"contract" json:"contract"`
	Symbol    string `db:"symbol" json:"symbol"`
	Type      string `db:"type" json:"type"`
}
