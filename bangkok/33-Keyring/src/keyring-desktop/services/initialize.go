package services

import (
	"keyring-desktop/utils"

	"github.com/cosmos/go-bip39"
	keycard "github.com/status-im/keycard-go"
	"github.com/status-im/keycard-go/types"
)

type GenerateKeyResponse struct {
	Mnemonic    string
	PairingInfo *types.PairingInfo
}

func (i *KeyringCard) IsInitialized() (bool, error) {
	cmdSet := keycard.NewCommandSet(i.c)

	utils.Sugar.Info("select keycard applet")
	err := cmdSet.Select()
	if err != nil {
		return false, err
	}

	if !cmdSet.ApplicationInfo.Installed {
		return false, errCardNotInstalled
	}

	return cmdSet.ApplicationInfo.Initialized, nil
}

// keycard-select
// keycard-set-secrets 123456 123456789012 KeycardDefaultPairing
// keycard-init
func (i *KeyringCard) Init(pin string, puk string, code string) error {
	cmdSet := keycard.NewCommandSet(i.c)

	utils.Sugar.Info("select keycard applet")
	err := cmdSet.Select()
	if err != nil {
		return err
	}

	if !cmdSet.ApplicationInfo.Installed {
		return errCardNotInstalled
	}

	utils.Sugar.Infow("is initialized", "Initialized", cmdSet.ApplicationInfo.Initialized)
	secrets := keycard.NewSecrets(pin, puk, code)
	utils.Sugar.Infow("is initialized", "Initialized", cmdSet.ApplicationInfo.Initialized)
	utils.Sugar.Info("init")
	if cmdSet.ApplicationInfo.Initialized {
		return errCardAlreadyInitialized
	}
	err = cmdSet.Init(secrets)
	if err != nil {
		return err
	}

	return nil
}

// keycard-select
// keycard-set-secrets 123456 123456789012 KeycardDefaultPairing
// keycard-pair
// keycard-open-secure-channel
//
// keycard-generate-mnemonic {{ words_count }} # happen in app
// keycard-load-seed {{ seed }}
//
// keycard-verify-pin {{ session_pin }}
// keycard-unpair {{ session_pairing_index }}
func (i *KeyringCard) GenerateKey(pin string, puk string, code string, checksumSize int) (*GenerateKeyResponse, error) {
	cmdSet := keycard.NewCommandSet(i.c)

	err := selectAndCheck(cmdSet)
	if err != nil {
		return nil, err
	}

	secrets := keycard.NewSecrets(pin, puk, code)

	utils.Sugar.Info("pairing")
	err = cmdSet.Pair(secrets.PairingPass())
	if err != nil {
		return nil, err
	}

	if cmdSet.PairingInfo == nil {
		return nil, errNoPairingInfo
	}

	utils.Sugar.Infof("open keycard secure channel")
	if err := cmdSet.OpenSecureChannel(); err != nil {
		return nil, err
	}

	utils.Sugar.Infof("verify PIN")
	if err := cmdSet.VerifyPIN(pin); err != nil {
		return nil, err
	}

	utils.Sugar.Info("load key from seed")
	entropy, _ := bip39.NewEntropy(32 * checksumSize)
	mnemonic, _ := bip39.NewMnemonic(entropy)
	seed := bip39.NewSeed(mnemonic, "")

	_, err = cmdSet.LoadSeed(seed)
	if err != nil {
		return nil, err
	}

	response := &GenerateKeyResponse{
		Mnemonic:    mnemonic,
		PairingInfo: cmdSet.PairingInfo,
	}

	return response, nil
}

func (i *KeyringCard) LoadMnemonic(pin string, puk string, code string, mnemonic string) (*GenerateKeyResponse, error) {
	cmdSet := keycard.NewCommandSet(i.c)

	err := selectAndCheck(cmdSet)
	if err != nil {
		return nil, err
	}

	secrets := keycard.NewSecrets(pin, puk, code)

	utils.Sugar.Info("pairing")
	err = cmdSet.Pair(secrets.PairingPass())
	if err != nil {
		return nil, err
	}

	if cmdSet.PairingInfo == nil {
		return nil, errNoPairingInfo
	}

	utils.Sugar.Infof("open keycard secure channel")
	if err := cmdSet.OpenSecureChannel(); err != nil {
		return nil, err
	}

	utils.Sugar.Infof("verify PIN")
	if err := cmdSet.VerifyPIN(pin); err != nil {
		return nil, err
	}

	utils.Sugar.Info("load key from seed")
	seed := bip39.NewSeed(mnemonic, "")

	_, err = cmdSet.LoadSeed(seed)
	if err != nil {
		return nil, err
	}

	response := &GenerateKeyResponse{
		Mnemonic:    mnemonic,
		PairingInfo: cmdSet.PairingInfo,
	}

	return response, nil
}
