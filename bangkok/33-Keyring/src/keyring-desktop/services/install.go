package services

import (
	"keyring-desktop/utils"
	"os"

	"github.com/status-im/keycard-go/globalplatform"
)

func (i *KeyringCard) Install(capFile *os.File) error {
	cmdSet := globalplatform.NewCommandSet(i.c)

	utils.Sugar.Info("select default root path")
	err := cmdSet.Select()
	if err != nil {
		return err
	}

	utils.Sugar.Info("open secure channel")
	if err = cmdSet.OpenSecureChannel(); err != nil {
		return err
	}

	utils.Sugar.Info("delete old applet if present")
	if err = cmdSet.DeleteKeycardInstancesAndPackage(); err != nil {
		return err
	}

	utils.Sugar.Info("load package")
	callback := func(index, total int) {
		utils.Sugar.Infow("loading applet", "index", index, "total", total)
	}
	if err = cmdSet.LoadKeycardPackage(capFile, callback); err != nil {
		return err
	}

	utils.Sugar.Info("install applet")
	if err = cmdSet.InstallKeycardApplet(); err != nil {
		return err
	}

	return nil
}
