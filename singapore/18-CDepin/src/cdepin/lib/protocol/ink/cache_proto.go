package ink

import (
	"math/big"

	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"github.com/pkg/errors"
)

const (
	PROTO_CONTRACT_NAME = "CacheProtocol"

	METHOD_STAKING             = ".staking"
	METHOD_IS_TOKEN_OWNER      = ".is_token_owner"
	METHOD_CACHE_ORDER_PAYMENT = ".cache_order_payment"
	METHOD_ORDER_CLAIM         = ".order_claim"
	METHOD_CLAIM_REWARD        = ".claim"
	METHOD_EXIT                = ".exit"
)

type NodeInfo struct {
	Created   bool
	Collerate *big.Int
	TokenId   [32]byte
	PeerId    []byte
}

type OrderInfo struct {
	Value   *big.Int
	Creater types.AccountID
	Node    types.AccountID
	Term    *big.Int
}

type Staking struct {
	NodeAcc types.AccountID
	TokenId [32]byte
}

type OrderPayment struct {
	OrderId []byte
	NodeAcc types.AccountID
}

type Claim struct {
	NodeAcc types.AccountID
	Reward  *big.Int
}

type Exit struct {
	NodeAcc types.AccountID
}

func (c *chainClient) Staking(nodeAcc, tokenAcc types.AccountID, tokenId [32]byte, peerId, sign []byte, value string) (string, error) {
	v, ok := big.NewInt(0).SetString(value, 10)
	if !ok {
		return "", errors.New("bad value")
	}
	return c.SubmitExtrinsic(
		PROTO_CONTRACT_NAME+METHOD_STAKING,
		func(events CacheEventRecords) bool {
			return len(events.CacheToken_MintToken) > 0
		},
		nodeAcc, tokenAcc, tokenId, peerId, sign, v,
	)
}

func (c *chainClient) CacheOrderPayment(nodeAcc types.AccountID, value string) (string, error) {
	v, ok := big.NewInt(0).SetString(value, 10)
	if !ok {
		return "", errors.New("bad value")
	}
	return c.SubmitExtrinsic(
		PROTO_CONTRACT_NAME+METHOD_CACHE_ORDER_PAYMENT,
		func(events CacheEventRecords) bool {
			return len(events.CacheProtocol_Staking) > 0
		},
		nodeAcc, v,
	)
}

func (c *chainClient) OrderClaim(orderId []byte) (string, error) {

	return c.SubmitExtrinsic(
		PROTO_CONTRACT_NAME+METHOD_ORDER_CLAIM,
		func(events CacheEventRecords) bool {
			return len(events.CacheProtocol_OrderInfo) > 0
		},
		orderId,
	)
}

func (c *chainClient) CalimReward() (string, error) {

	return c.SubmitExtrinsic(
		PROTO_CONTRACT_NAME+METHOD_CLAIM_REWARD,
		func(events CacheEventRecords) bool {
			return len(events.CacheProtocol_Claim) > 0
		},
	)
}

func (c *chainClient) Exit() (string, error) {

	return c.SubmitExtrinsic(
		PROTO_CONTRACT_NAME+METHOD_EXIT,
		func(events CacheEventRecords) bool {
			return len(events.CacheProtocol_Exit) > 0
		},
	)
}

func (c *chainClient) IsTokenOwner(acc types.AccountID, tokenId [32]byte) (string, error) {

	return c.SubmitExtrinsic(
		PROTO_CONTRACT_NAME+METHOD_IS_TOKEN_OWNER,
		func(events CacheEventRecords) bool {
			return len(events.CacheProtocol_NodeInfo) > 0
		},
		acc, tokenId,
	)
}
