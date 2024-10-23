package database

import (
	"keyring-desktop/utils"

	"github.com/jmoiron/sqlx"
	_ "modernc.org/sqlite"
)

func AddContractAddressColumn(db *sqlx.DB, chainConfigs []utils.ChainConfig) error {
	assets := []Asset{}
	err := db.Select(&assets, "select * from assets ")
	if err != nil {
		return err
	}

	utils.Sugar.Infof("assets: %v", assets)

	tx, err := db.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	for _, asset := range assets {
		if asset.ContractAddress != "" {
			break
		}

		var chainName string
		err = tx.QueryRow("select chain_name from accounts where account_id = ?", asset.AccountId).Scan(&chainName)
		if err != nil {
			return err
		}

		for _, config := range chainConfigs {
			if config.Name == chainName {
				for _, token := range config.Tokens {
					if token.Symbol == asset.TokenSymbol {
						_, err = tx.Exec(`update assets set contract_address = ? where asset_id = ?`, token.Contract, asset.Id)
						if err != nil {
							return err
						}
						break
					}
				}

				break
			}
		}
	}

	err = tx.Commit()
	if err != nil {
		return err
	}

	return err
}
