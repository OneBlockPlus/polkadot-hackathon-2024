package database

import (
	"errors"
	"keyring-desktop/utils"

	"github.com/jmoiron/sqlx"
	_ "modernc.org/sqlite"
)

func SaveTokenConfig(db *sqlx.DB, chainName string, token utils.TokenConfig, forceUpdate bool) error {
	configs := []DatabaseTokenConfig{}

	err := db.Select(&configs, "select * from token_config where chain_name = ? and contract = ?", chainName, token.Contract)
	if err != nil {
		return err
	}

	if len(configs) > 0 && !forceUpdate {
		return errors.New("token config is already existed")
	}

	tx, err := db.Begin()
	if err != nil {
		return err
	}

	if len(configs) > 0 {
		_, err = tx.Exec("delete from token_config where chain_name = ? and contract = ?", chainName, token.Contract)
		if err != nil {
			return err
		}
	}

	_, err = tx.Exec(
		"insert into token_config (chain_name, symbol, price_id, decimals, contract) values (?, ?, ?, ?, ?)",
		chainName, token.Symbol, token.PriceId, token.Decimals, token.Contract,
	)
	if err != nil {
		return err
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}

func QueryChainTokenConfigs(db *sqlx.DB, chainName string) ([]DatabaseTokenConfig, error) {
	configs := []DatabaseTokenConfig{}

	err := db.Select(&configs, "select * from token_config where chain_name = ?", chainName)
	if err != nil {
		return nil, err
	}

	return configs, nil
}

func QueryTokenConfigs(db *sqlx.DB) ([]DatabaseTokenConfig, error) {
	configs := []DatabaseTokenConfig{}

	err := db.Select(&configs, "select * from token_config")
	if err != nil {
		return nil, err
	}

	return configs, nil
}

func RemoveTokenConfig(db *sqlx.DB, chainName, contract string) error {
	_, err := db.Exec(
		"delete from token_config where chain_name = ? and contract = ?", chainName, contract,
	)
	if err != nil {
		return err
	}

	return nil
}
