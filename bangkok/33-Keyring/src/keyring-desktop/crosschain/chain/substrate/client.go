package substrate

import (
	"context"
	"fmt"
	xc "keyring-desktop/crosschain"

	gsrpc "github.com/centrifuge/go-substrate-rpc-client/v4"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types/codec"
	"github.com/vedhavyas/go-subkey/v2"
)

type Client struct {
	api *gsrpc.SubstrateAPI
}

func NewClient(cfgI xc.ITask) (*Client, error) {
	// asset := cfgI.GetAssetConfig()
	cfg := cfgI.GetNativeAsset()

	api, err := gsrpc.NewSubstrateAPI(cfg.URL)
	if err != nil {
		return nil, err
	}

	hash, err := api.RPC.Chain.GetBlockHashLatest()
	if err != nil {
		return nil, err
	}

	fmt.Println("Latest block hash:", hash.Hex())

	return &Client{
		api: api,
	}, nil
}

func (client *Client) FetchBalance(ctx context.Context, address xc.Address) (xc.AmountBlockchain, error) {
	meta, err := client.api.RPC.State.GetMetadataLatest()
	if err != nil {
		return xc.AmountBlockchain{}, err
	}

	_, pubkey, err := subkey.SS58Decode(string(address))
	if err != nil {
		return xc.AmountBlockchain{}, err
	}

	key, err := types.CreateStorageKey(meta, "System", "Account", pubkey)
	if err != nil {
		return xc.AmountBlockchain{}, err
	}

	var accountInfo types.AccountInfo
	ok, err := client.api.RPC.State.GetStorageLatest(key, &accountInfo)
	if err != nil || !ok {
		return xc.AmountBlockchain{}, err
	}

	fmt.Println("Account info:", accountInfo)
	return xc.AmountBlockchain(*accountInfo.Data.Free.Int), nil
}

func (client *Client) FetchNativeBalance(ctx context.Context, address xc.Address) (xc.AmountBlockchain, error) {
	return xc.AmountBlockchain{}, nil
}

func (client *Client) GetContractMetadata(ctx context.Context) (*xc.ContractMetadata, error) {
	return nil, nil
}

func (client *Client) FetchTxInfo(ctx context.Context, txHash xc.TxHash) (xc.TxInfo, error) {
	return xc.TxInfo{}, nil
}

func (client *Client) FetchTxInput(ctx context.Context, from xc.Address, to xc.Address) (xc.TxInput, error) {
	return nil, nil
}

func (client *Client) SubmitTx(ctx context.Context, tx xc.Tx) (xc.TxHash, error) {
	ext := *tx.(Tx).ext
	encodedExt, err := codec.EncodeToHex(ext)
	if err != nil {
		fmt.Println("Error submitting extrinsic", err)
		return "", err
	}

	fmt.Printf("Ext - %s\n", encodedExt)

	hash, err := client.api.RPC.Author.SubmitDynamicExtrinsic(ext)
	if err != nil {
		fmt.Println("Error submitting extrinsic", err)
		return "", err
	}

	// go func() {
	// 	for {
	// 		select {
	// 		case st := <-sub.Chan():
	// 			extStatus, _ := st.MarshalJSON()
	// 			fmt.Printf("Status for transaction - %s\n", string(extStatus))
	// 		case err := <-sub.Err():
	// 			panic(err)
	// 		}
	// 	}
	// }()

	return xc.TxHash(hash.Hex()), nil
}
