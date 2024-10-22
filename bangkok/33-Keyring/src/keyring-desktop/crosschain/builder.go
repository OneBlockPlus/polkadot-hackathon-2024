package crosschain

import "math/big"

// TxBuilder is a Builder that can transfer assets
type TxBuilder interface {
	NewTransfer(from Address, to Address, amount AmountBlockchain, input TxInput) (Tx, error)
	NewTeleport(from Address, to Address, amount AmountBlockchain, input TxInput, chain int64) (Tx, error)
	NewSendTransaction(from Address, to Address, gas uint64, value *big.Int, data []byte, input TxInput) (Tx, error)
}

// TxTokenBuilder is a Builder that can transfer token assets, in addition to native assets
type TxTokenBuilder interface {
	TxBuilder
	NewNativeTransfer(from Address, to Address, amount AmountBlockchain, input TxInput) (Tx, error)
	NewTokenTransfer(from Address, to Address, amount AmountBlockchain, input TxInput) (Tx, error)
}

// TxXTransferBuilder is a Builder that can mutate an asset into another asset
type TxXTransferBuilder interface {
	TxBuilder
	NewTask(from Address, to Address, amount AmountBlockchain, input TxInput) (Tx, error)
}
