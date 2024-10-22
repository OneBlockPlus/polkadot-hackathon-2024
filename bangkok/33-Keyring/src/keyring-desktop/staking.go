package main

import (
	"context"
	"errors"
	"fmt"
	"keyring-desktop/crosschain"
	"keyring-desktop/crosschain/chain/bitcoin"
	"keyring-desktop/crosschain/chain/evm"
	"keyring-desktop/crosschain/chain/substrate"
	"keyring-desktop/crosschain/factory"
	"keyring-desktop/database"
	"keyring-desktop/services"
	"keyring-desktop/utils"
	"strconv"
	"time"
)

func (a *App) Staking(
	asset string,
	contract string,
	chainName string,
	from string,
	pool string,
	amount string,
	gas string,
	pin string,
	cardId int,
) (crosschain.TxHash, error) {
	utils.Sugar.Infof("Transfer %s %s %s from %s to %s on %s network", amount, asset, contract, from, pool, chainName)
	if from == "" || amount == "" || pin == "" {
		return "", errors.New("input can not be empty")
	}

	chainConfig := utils.GetChainConfig(a.chainConfigs, chainName)
	if chainConfig == nil {
		return "", errors.New("chain configuration not found")
	}

	ctx := context.Background()

	assetConfig, err := utils.ConvertAssetConfig(chainConfig, contract, chainName, false)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("unsupported asset")
	}

	fromAddress := crosschain.Address(from)
	toAddress := crosschain.Address(fmt.Sprintf("%d", pool))
	amountInteger, err := factory.ConvertAmountStrToBlockchain(assetConfig, amount)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to convert the input amount")
	}

	client, _ := factory.NewClient(assetConfig)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to create a client")
	}

	input, err := client.FetchTxInput(ctx, fromAddress, toAddress)
	utils.Sugar.Infof("input: %+v", input)
	if gas != "" {
		gasInteger, err := factory.ConvertAmountStrToBlockchain(assetConfig, gas)
		if err != nil {
			utils.Sugar.Error(err)
			return "", errors.New("failed to convert the gas amount")
		}

		switch crosschain.Driver(assetConfig.GetDriver()) {
		case crosschain.DriverEVM:
			input.(*evm.TxInput).GasFeeCap = gasInteger
			tipCap := input.(*evm.TxInput).GasFeeCap.Sub(&input.(*evm.TxInput).BaseFee)
			if tipCap.Cmp(&input.(*evm.TxInput).GasTipCap) > 0 {
				input.(*evm.TxInput).GasTipCap = tipCap
			}
		case crosschain.DriverEVMLegacy:
			input.(*evm.TxInput).GasPrice = gasInteger
		case crosschain.DriverBitcoin:
			input.(*bitcoin.TxInput).GasPricePerByte = gasInteger
		}
	}
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to fetch tx input")
	}

	// connect to card
	keyringCard, err := services.NewKeyringCard()
	if err != nil {
		utils.Sugar.Error(err)
		return "", utils.ErrCardNotConnected
	}
	defer keyringCard.Release()

	// get pairing info
	pairingInfo, err := a.getPairingInfo(pin, cardId)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to get pairing info")
	}

	if inputWithPublicKey, ok := input.(crosschain.TxInputWithPublicKey); ok {
		pubkeyRaw, err := keyringCard.ChainAddress(pin, pairingInfo, chainConfig)
		if err != nil {
			utils.Sugar.Error(err)
			return "", errors.New("failed to get public key")
		}
		_, publicKey, err := factory.GetAddressFromPublicKey(assetConfig, pubkeyRaw)
		if err != nil {
			utils.Sugar.Error(err)
			return "", errors.New("failed to parse public key")
		}
		inputWithPublicKey.SetPublicKey(publicKey)
	}
	utils.Sugar.Infof("input: %+v", input)

	// build tx
	builder, err := factory.NewTxBuilder(assetConfig)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to create transaction builder")
	}
	parsedPool, err := strconv.ParseUint(pool, 10, 32)
	if err != nil {
		return "", err
	}
	tx, err := builder.(substrate.Builder).NewStaking(fromAddress, uint32(parsedPool), amountInteger, input)
	if err != nil {
		utils.Sugar.Error(err)
		return "", fmt.Errorf("failed to create transaction: %s", err)
	}
	// utils.Sugar.Infof("tx: %s", tx)
	utils.Sugar.Infof("transaction: %+v", tx)
	sighashes, err := tx.Sighashes()
	if err != nil {
		utils.Sugar.Error("Error: %s", err)
		return "", errors.New("failed to get transaction hash")
	}
	signatures := make([]crosschain.TxSignature, len(sighashes))
	for i, sighash := range sighashes {
		utils.Sugar.Infof("signing: %x", sighash)
		signature, err := keyringCard.Sign(sighash, chainConfig, pin, pairingInfo)
		if err != nil {
			utils.Sugar.Error(err)
			return "", errors.New("failed to sign transaction hash")
		}
		utils.Sugar.Infof("signature: %x", signature)
		signatures[i] = *signature
	}

	// complete the tx by adding signature
	err = tx.AddSignatures(signatures...)
	if err != nil {
		utils.Sugar.Error("falied to add signature", err)
		return "", errors.New("failed to add signature")
	}

	// submit the tx
	txId, err := client.SubmitTx(ctx, tx)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to submit transaction")
	}

	txValue := amount
	if contract != "" {
		txValue = "0"
	}
	txInfo := database.DatabaseTransactionInfo{
		ChainName: chainName,
		Address:   from,
		Hash:      string(txId),
		Timestamp: time.Now().Unix(),
		From:      from,
		To:        fmt.Sprintf("%d", pool),
		Value:     txValue,
	}
	_ = database.SaveTransactionHistory(a.sqlite, []database.DatabaseTransactionInfo{txInfo})

	return txId, nil
}
