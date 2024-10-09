package substrate

import (
	"fmt"
	xc "keyring-desktop/crosschain"

	"github.com/status-im/keycard-go/hexutils"
	"github.com/vedhavyas/go-subkey/v2"
)

// AddressBuilder for EVM
type AddressBuilder struct {
	addressPrefix uint16
}

// NewAddressBuilder creates a new EVM AddressBuilder
func NewAddressBuilder(asset xc.ITask) (xc.AddressBuilder, error) {
	return AddressBuilder{
		addressPrefix: uint16(asset.GetAssetConfig().AddressPrefix),
	}, nil
}

// GetAddressFromPublicKey returns an Address given a public key
func (ab AddressBuilder) GetAddressFromPublicKey(publicKeyBytes []byte) (xc.Address, []byte, error) {
	fmt.Println("GetAddressFromPublicKey for substrate:", hexutils.BytesToHex(publicKeyBytes), len(publicKeyBytes))
	fmt.Println("publicKeyBytes for substrate:", hexutils.BytesToHex(publicKeyBytes), len(publicKeyBytes), ab.addressPrefix)

	address := subkey.SS58Encode(publicKeyBytes, ab.addressPrefix)
	return xc.Address(address), publicKeyBytes, nil
}

// GetAllPossibleAddressesFromPublicKey returns all PossubleAddress(es) given a public key
func (ab AddressBuilder) GetAllPossibleAddressesFromPublicKey(publicKeyBytes []byte) ([]xc.PossibleAddress, error) {
	address, pubkey, err := ab.GetAddressFromPublicKey(publicKeyBytes)
	return []xc.PossibleAddress{
		{
			Address:   address,
			Type:      xc.AddressTypeDefault,
			PublicKey: pubkey,
		},
	}, err
}
