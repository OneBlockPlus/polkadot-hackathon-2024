package main

import (
	"errors"
	"keyring-desktop/database"
	"keyring-desktop/services"
	"keyring-desktop/utils"

	"github.com/jmoiron/sqlx"
)

// Reset card will clear keys, PIN, etc on card, and app data in database
func (a *App) ResetCard(cardId int, pin string) error {
	utils.Sugar.Info("Start to reset card and wallet")

	// connect to card
	keyringCard, err := services.NewKeyringCard()
	if err != nil {
		utils.Sugar.Error(err)
		return utils.ErrCardNotConnected
	}
	defer keyringCard.Release()

	// get pairing info
	pairingInfo, err := a.getPairingInfo(pin, cardId)
	if err != nil {
		utils.Sugar.Error(err)
		return errors.New("failed to get pairing info")
	}

	// reset card
	err = keyringCard.Reset(pairingInfo)
	if err != nil {
		utils.Sugar.Error(err)
		return errors.New("failed to reset card")
	}

	err = database.ClearAccounts(a.sqlite, cardId)
	if err != nil {
		utils.Sugar.Error(err)
		return errors.New("failed to clear accounts")
	}

	return nil
}

// clear data in database
func (a *App) ClearData(cardId int, pin string) error {
	utils.Sugar.Info("Start to clear data for the card")

	// connect to card
	keyringCard, err := services.NewKeyringCard()
	if err != nil {
		utils.Sugar.Error(err)
		return utils.ErrCardNotConnected
	}
	defer keyringCard.Release()

	// get pairing info
	pairingInfo, err := a.getPairingInfo(pin, cardId)
	if err != nil {
		utils.Sugar.Error(err)
		return errors.New("failed to get pairing info")
	}

	// unpair the card
	err = keyringCard.Unpair(pin, pairingInfo)
	if err != nil {
		utils.Sugar.Error(err)
		return errors.New("failed to reset card")
	}

	err = database.ClearAccounts(a.sqlite, cardId)
	if err != nil {
		utils.Sugar.Error(err)
		return errors.New("failed to clear accounts")
	}

	return nil
}

// Remove a ledger in database
func (a *App) RemoveLedger(cardId int, chainName string) error {
	utils.Sugar.Info("Start to clear data for the card")

	err := database.DeleteLedger(a.sqlite, cardId, chainName)
	if err != nil {
		utils.Sugar.Error(err)
		return errors.New("failed to clear ledger")
	}

	return nil
}

func (a *App) ResetWallet() error {
	utils.Sugar.Info("Start to reset wallet")

	err := a.sqlite.Close()
	if err != nil {
		utils.Sugar.Error(err)
		return errors.New("close database failed")
	}

	err = DeleteDb()
	if err != nil {
		utils.Sugar.Error(err)
		return errors.New("delete database failed")
	}

	DbMigrate()

	sqlDbPath, err := utils.SQLiteDatabasePath()
	if err != nil {
		utils.Sugar.Error(err)
		return errors.New("reopen database failed")
	}
	sqlDb, err := sqlx.Connect("sqlite", sqlDbPath)
	if err != nil {
		utils.Sugar.Error(err)
		return errors.New("reopen database failed")
	}
	a.sqlite = sqlDb

	return nil
}

func (a *App) GetCurrentVersion() string {
	return utils.CurrentVersion()
}

func (a *App) CheckUpdates() (SelfUpdateResponse, error) {
	shouldUpdate, latest, err := utils.CheckForUpdate()
	if err != nil {
		utils.Sugar.Error(err)

		return SelfUpdateResponse{}, errors.New("check updates failed")
	}

	res := SelfUpdateResponse{
		ShouldUpdate:   shouldUpdate,
		CurrentVersion: utils.CurrentVersion(),
		LatestVersion:  latest,
	}
	return res, nil
}

func (a *App) DoUpdate() error {
	err := utils.DoSelfUpdate(a.ctx)
	if err != nil {
		utils.Sugar.Error(err)
		return errors.New("update failed")
	}

	return nil
}
