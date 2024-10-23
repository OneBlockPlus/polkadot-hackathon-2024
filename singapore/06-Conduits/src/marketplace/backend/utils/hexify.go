package utils

import (
	"github.com/ethereum/go-ethereum/common"
)

func ToChecksumAddress(address string) string {
	if address == "" {
		return ""
	}
	return common.HexToAddress(address).Hex()
}
