package services

import (
	"keyring-desktop/utils"

	keycard "github.com/status-im/keycard-go"
	"github.com/status-im/keycard-go/types"
)

func (i *KeyringCard) Reset(pairingInfo *types.PairingInfo) error {
	cmdSet := keycard.NewCommandSet(i.c)

	err := selectAndOpen(cmdSet, pairingInfo)
	if err != nil {
		utils.Sugar.Errorf("select and open channel failed, error: %s", err)
		return err
	}

	utils.Sugar.Info("reset applets")
	if err = cmdSet.FactoryReset(); err != nil {
		return err
	}

	return nil
}
