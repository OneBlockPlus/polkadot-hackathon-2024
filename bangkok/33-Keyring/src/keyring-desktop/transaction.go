package main

import (
	"context"
	"encoding/json"
	"errors"
	"keyring-desktop/crosschain"
	"keyring-desktop/crosschain/chain/bitcoin"
	"keyring-desktop/crosschain/chain/evm"
	"keyring-desktop/crosschain/factory"
	"keyring-desktop/database"
	"keyring-desktop/oracle"
	"keyring-desktop/services"
	"keyring-desktop/utils"
	"math/big"
	"strconv"
	"time"

	"github.com/ethereum/go-ethereum/common/hexutil"
	"github.com/ethereum/go-ethereum/signer/core/apitypes"
	"github.com/shopspring/decimal"
	"github.com/wailsapp/wails/v2/pkg/runtime"
)

func (a *App) SendTransaction(
	from string,
	to string,
	chainName string,
	value string,
	gasLimit string,
	data string,
	gasFee string,
	pin string,
	cardId int,
) (crosschain.TxHash, error) {
	utils.Sugar.Infof("Send transaction from %s to %s on %s", from, to, chainName)
	if pin == "" || from == "" || to == "" || chainName == "" {
		return "", errors.New("input can not be empty")
	}

	chainConfig := utils.GetChainConfig(a.chainConfigs, chainName)
	if chainConfig == nil {
		return "", errors.New("chain configuration not found")
	}

	ctx := context.Background()

	assetConfig, err := utils.ConvertAssetConfig(chainConfig, "", chainName, false)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("unsupported asset")
	}

	fromAddress := crosschain.Address(from)
	toAddress := crosschain.Address(to)

	client, _ := factory.NewClient(assetConfig)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to create a client")
	}

	input, err := client.FetchTxInput(ctx, fromAddress, toAddress)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to fetch tx input")
	}
	if gasFee != "" {
		gasInteger, err := factory.ConvertAmountStrToBlockchain(assetConfig, gasFee)
		if err != nil {
			utils.Sugar.Error(err)
			return "", errors.New("failed to convert the gas amount")
		}

		switch crosschain.Driver(assetConfig.GetDriver()) {
		case crosschain.DriverEVM:
			input.(*evm.TxInput).GasFeeCap = gasInteger
		case crosschain.DriverEVMLegacy:
			input.(*evm.TxInput).GasPrice = gasInteger
		case crosschain.DriverBitcoin:
			input.(*bitcoin.TxInput).GasPricePerByte = gasInteger
		}
	}

	utils.Sugar.Infof("input: %+v", input)

	// build tx
	builder, err := factory.NewTxBuilder(assetConfig)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to create transaction builder")
	}
	dataBytes, err := hexutil.Decode(data)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to decode payload")
	}
	valueInt := new(big.Int)
	if value != "" {
		valueInt, err = hexutil.DecodeBig(value)
	}
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to decode value")
	}
	gasUint, err := hexutil.DecodeUint64(gasLimit)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to decode gas limit")
	}
	tx, err := builder.NewSendTransaction(fromAddress, toAddress, gasUint, valueInt, dataBytes, input)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to create transaction")
	}
	sighashes, err := tx.Sighashes()
	if err != nil {
		utils.Sugar.Infof("Error: %s", err)
		return "", errors.New("failed to get transaction hash")
	}
	sighash := sighashes[0]
	utils.Sugar.Infof("transaction: %+v", tx)
	utils.Sugar.Infof("signing: %x", sighash)

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

	signature, err := keyringCard.Sign(sighash, chainConfig, pin, pairingInfo)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to sign transaction hash")
	}
	utils.Sugar.Infof("signature: %x", signature)

	// complete the tx by adding signature
	err = tx.AddSignatures(*signature)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to add signature")
	}

	// submit the tx
	txId := tx.Hash()
	utils.Sugar.Infof("Submitting tx id: %s", txId)
	err = client.SubmitTx(ctx, tx)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to submit transaction")
	}

	return txId, nil
}

func (a *App) SignTypedData(
	chainName string,
	data string,
	pin string,
	cardId int,
) (string, error) {
	utils.Sugar.Infof("sign typed data: %s", data)
	if pin == "" || data == "" || chainName == "" {
		return "", errors.New("input can not be empty")
	}

	chainConfig := utils.GetChainConfig(a.chainConfigs, chainName)
	if chainConfig == nil {
		return "", errors.New("chain configuration not found")
	}

	var typedData apitypes.TypedData
	err := json.Unmarshal([]byte(data), &typedData)
	if err != nil {
		return "", errors.New("failed to parse typed data")
	}

	hash, _, err := apitypes.TypedDataAndHash(typedData)
	if err != nil {
		return "", errors.New("failed to hash typed data")
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

	signature, err := keyringCard.Sign(hash, chainConfig, pin, pairingInfo)
	if err != nil {
		utils.Sugar.Error(err)
		return "", errors.New("failed to sign transaction hash")
	}
	utils.Sugar.Infof("signature: %x", signature)

	return hexutil.Encode(signature.Sig), nil
}

func (a *App) GetTransactionHistory(
	chainName string,
	address string,
	limit int,
	page int,
	isRemote bool,
) (*GetTransactionHistoryResponse, error) {
	if isRemote {
		go a.fetchRemoteTxHistory(chainName, address, limit, page)
	}

	return a.fetchLocalTxHistory(chainName, address, limit, page)
}

func (a *App) fetchLocalTxHistory(
	chainName string,
	address string,
	limit int,
	page int) (*GetTransactionHistoryResponse, error) {
	txHistory, err := database.QueryTransactionHistory(a.sqlite, chainName, address, page, limit)
	if err != nil {
		utils.Sugar.Error(err)
		return nil, err
	}

	tokenTransferHistory, err := database.QueryTokenTransferHistory(a.sqlite, chainName, address, page, limit)
	if err != nil {
		utils.Sugar.Error(err)
		return nil, err
	}

	response := GetTransactionHistoryResponse{
		Chain:          chainName,
		Address:        address,
		Transactions:   txHistory,
		TokenTransfers: tokenTransferHistory,
	}

	return &response, nil
}

func (a *App) fetchRemoteTxHistory(chainName string, address string, limit int, page int) error {
	chainConfig := utils.GetChainConfig(a.chainConfigs, chainName)
	if chainConfig == nil {
		return errors.New("chain configuration not found")
	}

	if chainConfig.TxHistoryProvider == utils.BlockScout {
		err := a.fetchTxFromBlockscout(chainConfig, address)
		if err != nil {
			utils.Sugar.Error(err)
			return err
		}
	} else if chainConfig.TxHistoryProvider == utils.LbryChainQuery {
		err := a.fetchTxFromLbryChainQuery(chainConfig, address)
		if err != nil {
			utils.Sugar.Error(err)
			return err
		}
	} else {
		return errors.New("unsupported transaction history provider")
	}

	resp, err := a.fetchLocalTxHistory(chainName, address, limit, page)
	if err != nil {
		utils.Sugar.Error(err)
		return err
	}

	runtime.EventsEmit(a.ctx, "transaction-history", resp)

	return nil
}

func (a *App) fetchTxFromLbryChainQuery(chainConfig *utils.ChainConfig, address string) error {
	txHistory, err := oracle.GetTransactionsFromLbryExplorer(a.httpClient, *chainConfig, address)
	if err != nil {
		utils.Sugar.Error(err)
		return err
	}

	txItems := make([]database.DatabaseTransactionInfo, len(txHistory.Items))
	for i, tx := range txHistory.Items {
		// gasInteger, err = factory.ConvertAmountStrToBlockchain(chainConfig, tx.CreditAmount)
		credit, err := decimal.NewFromString(tx.CreditAmount)
		if err != nil {
			utils.Sugar.Error(err)
			return err
		}
		debit, err := decimal.NewFromString(tx.DebitAmount)
		if err != nil {
			utils.Sugar.Error(err)
			return err
		}

		txItems[i] = database.DatabaseTransactionInfo{
			ChainName: chainConfig.Name,
			Address:   address,
			Hash:      tx.Hash,
			Timestamp: tx.TxTime,
			Value:     credit.Sub(debit).String(),
		}
	}
	err = database.SaveTransactionHistory(a.sqlite, txItems)
	if err != nil {
		utils.Sugar.Error(err)
		return err
	}

	return nil
}

func (a *App) fetchTxFromBlockscout(chainConfig *utils.ChainConfig, address string) error {
	txs, err := oracle.GetTxHistoryFromBlockscout(a.httpClient, chainConfig, address)
	if err != nil {
		utils.Sugar.Error(err)
		return err
	}

	txItems := make([]database.DatabaseTransactionInfo, len(txs.Items))
	for i, tx := range txs.Items {
		txTime, err := time.Parse(time.RFC3339Nano, tx.Timestamp)
		if err != nil {
			utils.Sugar.Error(err)
			return err
		}
		amount := crosschain.NewAmountBlockchainFromStr(tx.Value)
		txItems[i] = database.DatabaseTransactionInfo{
			ChainName: chainConfig.Name,
			Address:   address,
			Hash:      tx.Hash,
			Timestamp: txTime.Unix(),
			Status:    tx.Status,
			From:      tx.From.Hash,
			To:        tx.To.Hash,
			Value:     amount.ToHuman(chainConfig.Decimals).String(),
			Fee:       tx.Fee.Value,
		}
	}
	err = database.SaveTransactionHistory(a.sqlite, txItems)
	if err != nil {
		utils.Sugar.Error(err)
		return err
	}

	tokenTransfers, err := oracle.GetTokenTransfersFromBlockscout(a.httpClient, *chainConfig, address)
	if err != nil {
		utils.Sugar.Error(err)
		return err
	}

	tokenTransferItems := make([]database.DatabaseTokenTransferInfo, len(tokenTransfers.Items))
	for i, transfer := range tokenTransfers.Items {
		txTime, err := time.Parse(time.RFC3339Nano, transfer.Timestamp)
		if err != nil {
			utils.Sugar.Error(err)
			return err
		}
		amount := crosschain.NewAmountBlockchainFromStr(transfer.Total.Value)
		tokenDecimal, err := strconv.Atoi(transfer.Total.Decimals)
		if err != nil {
			return err
		}
		tokenTransferItems[i] = database.DatabaseTokenTransferInfo{
			ChainName: chainConfig.Name,
			Address:   address,
			Hash:      transfer.TxHash,
			Timestamp: txTime.Unix(),
			From:      transfer.From.Hash,
			To:        transfer.To.Hash,
			Value:     amount.ToHuman(int32(tokenDecimal)).String(),
			Contract:  transfer.Token.Address,
			Symbol:    transfer.Token.Symbol,
			Type:      transfer.Token.Type,
		}
	}
	err = database.SaveTokenTransferHistory(a.sqlite, tokenTransferItems)
	if err != nil {
		utils.Sugar.Error(err)
		return err
	}

	return nil
}
