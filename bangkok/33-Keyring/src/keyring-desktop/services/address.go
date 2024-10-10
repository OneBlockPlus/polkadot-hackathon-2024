package services

import (
	"keyring-desktop/utils"

	keycard "github.com/status-im/keycard-go"
	"github.com/status-im/keycard-go/types"
)

// keycard-select
// keycard-set-secrets 123456 123456789012 KeycardDefaultPairing
// keycard-pair
// keycard-open-secure-channel
// keycard-verify-pin {{ session_pin }}
// keycard-derive-key
// keycard-sign "hello"
// keycard-unpair {{ session_pairing_index }}
func (i *KeyringCard) ChainAddress(pin string, pairingInfo *types.PairingInfo, config *utils.ChainConfig) ([]byte, error) {
	cmdSet := keycard.NewCommandSet(i.c)

	utils.Sugar.Infof("select keycard applet")
	err := cmdSet.Select()
	if err != nil {
		utils.Sugar.Infof("Error: %s", err)
		return nil, err
	}

	if !cmdSet.ApplicationInfo.Installed {
		utils.Sugar.Infof("installation is not done, error: %s", errCardNotInstalled)
		return nil, errCardNotInstalled
	}

	if !cmdSet.ApplicationInfo.Initialized {
		utils.Sugar.Error(errCardNotInitialized)
		return nil, errCardNotInitialized
	}

	utils.Sugar.Info("set pairing info")
	cmdSet.PairingInfo = pairingInfo
	if cmdSet.PairingInfo == nil {
		utils.Sugar.Infof("cannot open secure channel without setting pairing info")
		return nil, errNoPairingInfo
	}

	utils.Sugar.Infof("open keycard secure channel")
	if err := cmdSet.OpenSecureChannel(); err != nil {
		utils.Sugar.Infof("open keycard secure channel failed, error: %s", err)
		return nil, err
	}

	utils.Sugar.Infof("verify PIN")
	if err := cmdSet.VerifyPIN(pin); err != nil {
		utils.Sugar.Infof("verify PIN failed, error: %s", err)
		return nil, err
	}

	utils.Sugar.Infof("derive key")
	if err := cmdSet.DeriveKey(config.Path); err != nil {
		utils.Sugar.Infof("derive key failed, error: %s", err)
		return nil, err
	}

	utils.Sugar.Infof("sign hello")
	// data := crypto.Keccak256([]byte("hello"))

	if config.Driver == "substrate" {
		sig, err := cmdSet.Ed25519Sign([]byte("hello"))
		utils.Sugar.Infof("sign: %x", sig)
		if err != nil {
			utils.Sugar.Infof("ed25519 sign failed, error: %s", err)
			return nil, err
		}
		return sig.PubKey, nil
	}

	sig, err := cmdSet.Sign([]byte("hello"))
	if err != nil {
		utils.Sugar.Infof("sign failed, error: %s", err)
		return nil, err
	}

	return sig.PubKey(), nil
}
