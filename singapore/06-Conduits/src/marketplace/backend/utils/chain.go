package utils

import (
	"dephy-conduits/config"
	"dephy-conduits/constants"
)

func GetChainRPC(chainId uint64) string {
	if chainId == constants.BASE_SEPOLIA {
		return config.Config.Contracts.BASE_SEPOLIA.RPC
	} else {
		return ""
	}
}
