package ink

import (
	"math/big"

	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"github.com/pkg/errors"
)

// contract and methods
const (
	// token contract
	TOKEN_CONTRACT_NAME = "CacheToken"

	// methods
	METHOD_MINT_TOKEN = ".mint_token"
	METHOD_WITHDRAW   = ".withdraw"
	METHOD_TRANSFER   = ".transfer_from"
	METHOD_OWNEROF    = ".owner_of"
	METHOD_ACCOUNTID  = ".account_id"
)

type MintToken struct {
	Owner   types.AccountID
	TokenId [32]byte
}

func (c *chainClient) MintToken(value string) (string, error) {
	v, ok := big.NewInt(0).SetString(value, 10)
	if !ok {
		return "", errors.New("bad value")
	}
	return c.SubmitExtrinsic(
		TOKEN_CONTRACT_NAME+METHOD_MINT_TOKEN,
		func(events CacheEventRecords) bool {
			return len(events.CacheToken_MintToken) > 0
		},
		v,
	)
}

func (c *chainClient) Withdraw() (string, error) {
	return c.SubmitExtrinsic(
		TOKEN_CONTRACT_NAME+METHOD_WITHDRAW,
		func(events CacheEventRecords) bool {
			return true
		},
	)
}

func (c *chainClient) TransferFrom(tokenId [32]byte, to types.AccountID) (string, error) {
	return c.SubmitExtrinsic(
		TOKEN_CONTRACT_NAME+METHOD_WITHDRAW,
		func(events CacheEventRecords) bool {
			return true
		},
		tokenId, to,
	)
}

func (c *chainClient) GetOwnerOf(tokenId [32]byte, acc *([]byte)) (string, error) {
	return c.SubmitExtrinsic(
		TOKEN_CONTRACT_NAME+METHOD_WITHDRAW,
		func(events CacheEventRecords) bool {
			return len(events.CacheToken_Owner_of) > 0
		},
		tokenId,
	)
}
