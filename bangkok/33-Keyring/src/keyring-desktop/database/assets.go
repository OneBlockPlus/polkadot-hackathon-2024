package database

import (
	"github.com/jmoiron/sqlx"
	_ "modernc.org/sqlite"
)

func SaveAsset(db *sqlx.DB, cardId int, chain, address, tokenSymbol, contract string) error {
	var accountId int
	err := db.Get(&accountId, "select account_id from accounts where card_id = ? and chain_name = ? and address = ?", cardId, chain, address)
	if err != nil {
		return err
	}

	_, err = db.Exec(
		"insert into assets (account_id, token_symbol, contract_address) values (?, ?, ?)",
		accountId, tokenSymbol, contract,
	)
	if err != nil {
		return err
	}

	return nil
}

func QueryAssets(db *sqlx.DB, cardId int, chain, address string) ([]Asset, error) {
	var accountId int
	err := db.Get(&accountId, "select account_id from accounts where card_id = ? and chain_name = ? and address = ?", cardId, chain, address)
	if err != nil {
		return nil, err
	}

	assets := []Asset{}

	err = db.Select(&assets, "select * from assets where account_id = ?", accountId)
	if err != nil {
		return nil, err
	}

	return assets, nil
}

func UpdateAssetPrice(db *sqlx.DB, assetId int, balance string, price float32) error {
	_, err := db.Exec(
		"update assets set balance = ?, price = ? where asset_id = ?",
		balance, price, assetId,
	)
	if err != nil {
		return err
	}

	return nil
}

func SaveAssetPrice(db *sqlx.DB, cardId int, chain, address, tokenSymbol, contract, balance string, price float32) error {
	var accountId int
	err := db.Get(&accountId, "select account_id from accounts where card_id = ? and chain_name = ? and address = ?", cardId, chain, address)
	if err != nil {
		return err
	}

	_, err = db.Exec(
		"insert into assets (account_id, token_symbol, contract_address, balance, price) values (?, ?, ?, ?, ?)",
		accountId, tokenSymbol, contract, balance, price,
	)
	if err != nil {
		return err
	}

	return nil
}

func RemoveAsset(db *sqlx.DB, cardId int, chain, address, asset, contract string) error {
	var accountId int
	err := db.Get(&accountId, "select account_id from accounts where card_id = ? and chain_name = ? and address = ?", cardId, chain, address)
	if err != nil {
		return err
	}

	_, err = db.Exec(
		"delete from assets where account_id = ? and token_symbol = ?",
		accountId, asset,
	)
	if err != nil {
		return err
	}

	return nil
}
