package contracts

import (
	_ "embed"
	"strings"

	"github.com/ethereum/go-ethereum/accounts/abi"
)

var (
	AbiMarketplace abi.ABI
	AbiApplication abi.ABI

	//go:embed abi/Marketplace.json
	Marketplace string
	//go:embed abi/Application.json
	Application string
)

func Init() (err error) {
	AbiMarketplace, err = abi.JSON(strings.NewReader(Marketplace))
	if err != nil {
		return
	}
	AbiApplication, err = abi.JSON(strings.NewReader(Application))
	if err != nil {
		return
	}
	return
}
