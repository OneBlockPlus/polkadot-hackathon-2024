package utils

import (
	"context"

	"keyring-desktop/crosschain"

	"keyring-desktop/crosschain/factory"
)

func GetAssetBalance(ctx context.Context, config *ChainConfig, contract string, chain string, address string) (*crosschain.AmountHumanReadable, error) {
	token, err := ConvertAssetConfig(config, contract, chain, false)
	if err != nil {
		return nil, err
	}
	client, err := factory.NewClient(token)
	if err != nil {
		return nil, err
	}
	addressRes := crosschain.Address(address)
	Sugar.Info("addressRes: ", addressRes)
	balance, err := client.(crosschain.ClientBalance).FetchBalance(ctx, addressRes)
	Sugar.Info("balance: ", balance)
	if err != nil {
		return nil, err
	}
	humanBalance, err := factory.ConvertAmountToHuman(token, balance)
	if err != nil {
		return nil, err
	}

	return &humanBalance, nil
}

func GetContract(ctx context.Context, config *ChainConfig, contract string, chain string) (*crosschain.ContractMetadata, error) {
	token, err := ConvertAssetConfig(config, contract, chain, true)
	if err != nil {
		return nil, err
	}
	client, err := factory.NewClient(token)
	if err != nil {
		return nil, err
	}
	metadata, err := client.(crosschain.ClientBalance).GetContractMetadata(ctx)
	if err != nil {
		return nil, err
	}
	return metadata, nil
}
