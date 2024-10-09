package services

import (
	"keyring-desktop/utils"

	keycard "github.com/status-im/keycard-go"
	"github.com/status-im/keycard-go/types"
)

func selectAndOpen(cmdSet *keycard.CommandSet, pairingInfo *types.PairingInfo) error {
	err := selectAndCheck(cmdSet)
	if err != nil {
		utils.Sugar.Infof("select and check failed, error: %s", err)
		return err
	}

	utils.Sugar.Info("set pairing info")
	cmdSet.PairingInfo = pairingInfo
	if cmdSet.PairingInfo == nil {
		utils.Sugar.Infof("cannot open secure channel without setting pairing info")
		return errNoPairingInfo
	}

	utils.Sugar.Infof("open keycard secure channel")
	if err := cmdSet.OpenSecureChannel(); err != nil {
		utils.Sugar.Infof("open keycard secure channel failed, error: %s", err)
		return err
	}

	return nil
}

func selectAndCheck(cmdSet *keycard.CommandSet) error {
	err := cmdSet.Select()
	if err != nil {
		utils.Sugar.Infof("select failed, error: %s", err)
		return err
	}

	if !cmdSet.ApplicationInfo.Installed {
		utils.Sugar.Infof("installation is not done, error: %s", errCardNotInstalled)
		return errCardNotInstalled
	}

	if !cmdSet.ApplicationInfo.Initialized {
		utils.Sugar.Error(errCardNotInitialized)
		return errCardNotInitialized
	}

	return nil
}
