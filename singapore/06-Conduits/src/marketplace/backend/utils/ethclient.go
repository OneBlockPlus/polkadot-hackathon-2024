package utils

import (
	"github.com/ethereum/go-ethereum/ethclient"
)

var (
	ethClients map[uint64]*ethclient.Client
)

func GetEthClient(chainId uint64) (*ethclient.Client, error) {
	rpcUrl := GetChainRPC(chainId)

	if ethClients == nil {
		ethClients = make(map[uint64]*ethclient.Client)
	}

	if client, ok := ethClients[chainId]; ok {
		return client, nil
	}

	operation := func() error {
		ethClient, err := ethclient.Dial(rpcUrl)
		if err != nil {
			return err
		}
		ethClients[chainId] = ethClient
		return nil
	}

	err := RetryOperation(operation)
    if err != nil {
        return nil, err
    }

    return ethClients[chainId], nil
}