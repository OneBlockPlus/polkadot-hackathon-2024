package evm

import (
	"errors"
	"math/big"

	xc "keyring-desktop/crosschain"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/shopspring/decimal"
	"golang.org/x/crypto/sha3"
)

// TxBuilder for EVM
type TxBuilder struct {
	Asset       xc.AssetConfig
	NativeAsset xc.AssetConfig
	Legacy      bool
}

var _ xc.TxBuilder = &TxBuilder{}

// NewTxBuilder creates a new EVM TxBuilder
func NewTxBuilder(asset xc.ITask) (xc.TxBuilder, error) {
	return TxBuilder{
		Asset:       *asset.GetAssetConfig(),
		NativeAsset: *asset.GetNativeAsset(),
		Legacy:      false,
	}, nil
}

// NewTxBuilder creates a new EVM TxBuilder for legacy tx
func NewLegacyTxBuilder(asset xc.ITask) (xc.TxBuilder, error) {
	return TxBuilder{
		Asset:  *asset.GetAssetConfig(),
		Legacy: true,
	}, nil
}

// NewTransfer creates a new transfer for an Asset, either native or token
func (txBuilder TxBuilder) NewTransfer(from xc.Address, to xc.Address, amount xc.AmountBlockchain, input xc.TxInput) (xc.Tx, error) {
	if txBuilder.Asset.Type == xc.AssetTypeToken {
		return txBuilder.NewTokenTransfer(from, to, amount, input)
	}
	return txBuilder.NewNativeTransfer(from, to, amount, input)
}

func (txBuilder TxBuilder) NewSendTransaction(from xc.Address, to xc.Address, gas uint64, value *big.Int, data []byte, input xc.TxInput) (xc.Tx, error) {
	txInput := input.(*TxInput)

	txInput.GasLimit = gas

	return txBuilder.buildEvmTxWithPayload(to, value, data, txInput)
}

func (txBuilder TxBuilder) NewTeleport(from xc.Address, to xc.Address, amount xc.AmountBlockchain, input xc.TxInput) (xc.Tx, error) {
	return nil, errors.New("not implemented")
}

// NewNativeTransfer creates a new transfer for a native asset
func (txBuilder TxBuilder) NewNativeTransfer(from xc.Address, to xc.Address, amount xc.AmountBlockchain, input xc.TxInput) (xc.Tx, error) {
	txInput := input.(*TxInput)

	txInput.GasLimit = 90_000
	if txBuilder.NativeAsset.GasLimit > 0 {
		txInput.GasLimit = txBuilder.NativeAsset.GasLimit
	}

	return txBuilder.buildEvmTxWithPayload(to, amount.Int(), []byte{}, txInput)
}

// NewTokenTransfer creates a new transfer for a token asset
func (txBuilder TxBuilder) NewTokenTransfer(from xc.Address, to xc.Address, amount xc.AmountBlockchain, input xc.TxInput) (xc.Tx, error) {
	txInput := input.(*TxInput)

	txInput.GasLimit = 350_000
	if txBuilder.Asset.NativeAsset == xc.OasisROSE {
		txInput.GasLimit = 500_000
	}

	if txBuilder.NativeAsset.TokenGasLimit > 0 {
		txInput.GasLimit = txBuilder.NativeAsset.TokenGasLimit
	}

	zero := xc.NewAmountBlockchainFromUint64(0)
	contract := xc.Address(txBuilder.Asset.Contract)
	payload, err := txBuilder.buildERC20Payload(to, amount)
	if err != nil {
		return nil, err
	}
	return txBuilder.buildEvmTxWithPayload(contract, zero.Int(), payload, txInput)
}

func (txBuilder TxBuilder) buildERC20Payload(to xc.Address, amount xc.AmountBlockchain) ([]byte, error) {
	transferFnSignature := []byte("transfer(address,uint256)")
	hash := sha3.NewLegacyKeccak256()
	hash.Write(transferFnSignature)
	methodID := hash.Sum(nil)[:4]
	// fmt.Println(hexutil.Encode(methodID)) // 0xa9059cbb

	toAddress, err := HexToAddress(to)
	if err != nil {
		return nil, err
	}
	paddedAddress := common.LeftPadBytes(toAddress.Bytes(), 32)
	// fmt.Println(hexutil.Encode(paddedAddress)) // 0x0000000000000000000000004592d8f8d7b001e72cb26a73e4fa1806a51ac79d

	paddedAmount := common.LeftPadBytes(amount.Int().Bytes(), 32)
	// fmt.Println(hexutil.Encode(paddedAmount)) // 0x00000000000000000000000000000000000000000000003635c9adc5dea00000

	var data []byte
	data = append(data, methodID...)
	data = append(data, paddedAddress...)
	data = append(data, paddedAmount...)

	return data, nil
}

func (txBuilder TxBuilder) buildEvmTxWithPayload(to xc.Address, value *big.Int, data []byte, input *TxInput) (xc.Tx, error) {
	address, err := HexToAddress(to)
	if err != nil {
		return nil, err
	}
	chainID := new(big.Int).SetInt64(txBuilder.Asset.ChainID)

	if txBuilder.Legacy {
		return &Tx{
			EthTx: types.NewTransaction(
				input.Nonce,
				address,
				value,
				input.GasLimit,
				input.GasPrice.Int(),
				data,
			),
			Signer: types.LatestSignerForChainID(chainID),
		}, nil
	}

	// Check max fee is not exceeded
	maxFeeStr := txBuilder.Asset.MaxFee
	if maxFeeStr == "" {
		maxFeeStr = "0.05"
	}
	maxFeeDecimal, err := decimal.NewFromString(maxFeeStr)
	if err != nil {
		return nil, errors.New("the max fee is not a valid decimal")
	}
	maxFeeAllowed := xc.AmountHumanReadable(maxFeeDecimal).ToBlockchain(txBuilder.NativeAsset.Decimals)
	gasLimitAmount := xc.NewAmountBlockchainFromUint64(input.GasLimit)
	finalFee := (&input.GasFeeCap).Mul(&gasLimitAmount)
	zero := xc.NewAmountBlockchainFromUint64(0)
	if finalFee.Cmp(&zero) < 0 {
		return nil, errors.New("the transaction fee is negative")
	}
	if finalFee.Cmp(&maxFeeAllowed) > 0 {
		return nil, errors.New("the transaction fee exceeds the max fee allowed")
	}

	return &Tx{
		EthTx: types.NewTx(&types.DynamicFeeTx{
			ChainID:   chainID,
			Nonce:     input.Nonce,
			GasTipCap: input.GasTipCap.Int(),
			GasFeeCap: input.GasFeeCap.Int(),
			Gas:       input.GasLimit,
			To:        &address,
			Value:     value,
			Data:      data,
		}),
		Signer: types.LatestSignerForChainID(chainID),
	}, nil
}
