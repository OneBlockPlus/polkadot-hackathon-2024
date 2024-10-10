package main

import (
	"keyring-desktop/database"
	"keyring-desktop/utils"
	"net/url"
	"os"

	"github.com/kaichaosun/dbmate/pkg/dbmate"
	_ "github.com/kaichaosun/dbmate/pkg/driver/sqlite"
)

func DbMigrate() {
	dbPath, err := utils.SQLiteDatabasePath()
	if err != nil {
		utils.Sugar.Fatal(err)
	}
	u, _ := url.Parse("sqlite:" + dbPath)
	db := dbmate.New(u)
	db.FS = migrations

	utils.Sugar.Info("Migrations:")
	migrations, err := db.FindMigrations()
	if err != nil {
		utils.Sugar.Fatal(err)
	}
	for _, m := range migrations {
		utils.Sugar.Infof("%s  %s", m.Version, m.FilePath)
	}

	utils.Sugar.Info("Applying...")
	err = db.CreateAndMigrate()
	if err != nil {
		utils.Sugar.Fatal(err)
	}
}

func (a *App) DataMigrate() {
	// TODO read it from database, so skip unused data migration
	if true {
		err := database.AddContractAddressColumn(a.sqlite, a.chainConfigs)
		if err != nil {
			utils.Sugar.Fatal(err)
		}
	}
}

func DeleteDb() error {
	dbPath, err := utils.SQLiteDatabasePath()
	if err != nil {
		return err
	}

	err = os.Remove(dbPath)
	if err != nil {
		return err
	}

	return nil
}

func (a *App) mergeTokenConfig() {
	dbTokenConfigs, err := database.QueryTokenConfigs(a.sqlite)
	if err != nil {
		utils.Sugar.Fatal(err)
	}

	for _, dbTokenConfig := range dbTokenConfigs {
		for i, chainConfig := range a.chainConfigs {
			if dbTokenConfig.ChainName == chainConfig.Name {
				exist := false
				for _, token := range chainConfig.Tokens {
					if token.Contract == dbTokenConfig.Contract {
						exist = true
						break
					}
				}

				if !exist {
					tokenConfig := utils.TokenConfig{
						Symbol:   dbTokenConfig.Symbol,
						PriceId:  dbTokenConfig.PriceId,
						Decimals: dbTokenConfig.Decimals,
						Contract: dbTokenConfig.Contract,
					}
					a.chainConfigs[i].Tokens = append(chainConfig.Tokens, tokenConfig)
				}

				break
			}
		}
	}
}
