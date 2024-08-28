package protocol

import (
	"bytes"
	"context"
	"encoding/hex"
	"math/big"
	"time"

	"cdepin/lib/protocol/contract"
	"cdepin/logger"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/ethereum/go-ethereum/ethclient"
	"github.com/mr-tron/base58/base58"
	"github.com/pkg/errors"
)

type NodeInfo struct {
	Created   bool
	Collerate *big.Int
	TokenId   *big.Int
	PeerId    []byte
}

type Order struct {
	Value   *big.Int
	Creater common.Address
	Node    common.Address
	Term    *big.Int
}

type CacheProtoContract struct {
	Address    common.Address
	Node       common.Address
	NewOption  NewTransactionOption
	LogFilter  LogFilter
	CacheProto *contract.CacheProto
}

func (info NodeInfo) String() string {
	return string(info.PeerId)
}

func NewProtoContract(cli *ethclient.Client, hexAddr, nodeAcc string, optFunc NewTransactionOption, filter LogFilter) (*CacheProtoContract, error) {
	addr := common.HexToAddress(hexAddr)
	contract, err := contract.NewCacheProto(addr, cli)
	if err != nil {
		return nil, errors.Wrap(err, "new cache protocol evm contract error")
	}
	return &CacheProtoContract{
		Address:    addr,
		LogFilter:  filter,
		Node:       common.HexToAddress(nodeAcc),
		NewOption:  optFunc,
		CacheProto: contract,
	}, nil
}

func (pc *CacheProtoContract) CallFunc(funcName string, args ...any) (any, error) {
	return nil, nil
}

func (pc *CacheProtoContract) QueryRegisterInfo(nodeAcc common.Address) (NodeInfo, error) {
	var info NodeInfo
	info, err := pc.CacheProto.Node(&bind.CallOpts{}, nodeAcc)
	if err != nil {
		return info, errors.Wrap(err, "query node register info error")
	}
	if len(info.PeerId) == 0 || !info.Created {
		return info, errors.Wrap(errors.New("node not found."), "query node register info error")
	}
	info.PeerId = []byte(base58.Encode(info.PeerId))
	return info, nil
}

func (pc *CacheProtoContract) QueryCacheOrder(orderId [32]byte) (Order, error) {
	var order Order
	order, err := pc.CacheProto.Order(&bind.CallOpts{}, orderId)
	if err != nil {
		return order, errors.Wrap(err, "query cache order info error")
	}
	return order, nil
}

func (pc *CacheProtoContract) QueryCurrencyTerm() (*big.Int, error) {

	term, err := pc.CacheProto.GetCurrencyTerm(&bind.CallOpts{})
	if err != nil {
		return nil, errors.Wrap(err, "query currency term error")
	}
	return term, nil
}

func (pc *CacheProtoContract) CreateCacheOrder(ctx context.Context, nodeAcc common.Address, value string) (string, [32]byte, error) {

	var orderId []byte
	opts, err := pc.NewOption(ctx, value)
	if err != nil {
		return "", [32]byte{}, errors.Wrap(err, "create and payment cache order error")
	}
	tx, err := pc.CacheProto.CacheOrderPayment(opts, nodeAcc)
	if err != nil {
		return "", [32]byte{}, errors.Wrap(err, "create and payment cache order error")
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*15)
	defer cancel()
	if err = pc.LogFilter(
		ctx,
		ethereum.FilterQuery{
			Addresses: []common.Address{pc.Address},
		},
		func(l types.Log) bool {
			event, err := pc.CacheProto.ParseOrderPayment(l)
			if err != nil {
				return true
			}
			if event.NodeAcc == nodeAcc {
				orderId = event.OrderId[:]
				return false
			}
			return true
		},
	); err != nil {
		return tx.Hash().Hex(), [32]byte{}, errors.Wrap(err, "create and payment cache order error")
	}
	if orderId == nil {
		err = errors.New("order ID not obtained")
		return tx.Hash().Hex(), [32]byte{}, errors.Wrap(err, "create and payment cache order error")
	}
	return tx.Hash().Hex(), [32]byte(orderId), nil
}

func (pc *CacheProtoContract) RegisterNode(ctx context.Context, nodeAcc, tokenAcc common.Address, peerId, tokenId, value string, sign []byte) error {
	bigId, ok := big.NewInt(0).SetString(tokenId, 10)
	if !ok {
		return errors.Wrap(errors.New("bad token Id"), "register cache node error")
	}
	bPeerId, err := base58.Decode(peerId)
	if err != nil {
		return errors.Wrap(err, "register cache node error")
	}
	opts, err := pc.NewOption(ctx, value)
	if err != nil {
		return errors.Wrap(err, "register cache node error")
	}
	hash, err := pc.CacheProto.Staking(opts, nodeAcc, tokenAcc, bigId, bPeerId, sign)
	if err != nil {
		return errors.Wrap(err, "register cache node error")
	}

	logger.GetGlobalLogger().GetLogger("transaction").Debug("register node, tx hash:", hash.Hash())
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*300)
	defer cancel()
	if err = pc.LogFilter(
		ctx,
		ethereum.FilterQuery{
			Addresses: []common.Address{pc.Address},
		},
		func(l types.Log) bool {
			event, err := pc.CacheProto.ParseStaking(l)
			if err != nil {
				logger.GetGlobalLogger().GetLogger("transaction").Debug("parse staking event error", err)
				return true
			}
			return event.NodeAcc != nodeAcc
		},
	); err != nil {
		return errors.Wrap(err, "register cache node error")
	}
	return nil
}

func (pc *CacheProtoContract) ClaimOrder(ctx context.Context, orderId [32]byte) error {
	opts, err := pc.NewOption(ctx, "")
	if err != nil {
		return errors.Wrap(err, "claim order error")
	}
	_, err = pc.CacheProto.Claim(opts)
	if err != nil {
		return errors.Wrap(err, "claim order error")
	}
	return nil
}

func (pc *CacheProtoContract) ClaimWorkReward(ctx context.Context, nodeAcc common.Address) (string, error) {

	var reward string = "0"
	opts, err := pc.NewOption(ctx, "")
	if err != nil {
		return reward, errors.Wrap(err, "claim work reward error")
	}
	_, err = pc.CacheProto.Claim(opts)
	if err != nil {
		return reward, errors.Wrap(err, "claim work reward error")
	}

	ctx, cancel := context.WithTimeout(context.Background(), time.Second*15)
	defer cancel()

	if err = pc.LogFilter(
		ctx,
		ethereum.FilterQuery{
			Addresses: []common.Address{pc.Address},
		},
		func(l types.Log) bool {
			event, err := pc.CacheProto.ParseClaim(l)
			if err != nil {
				return true
			}
			if event.NodeAcc == nodeAcc {
				reward = event.Reward.String()
				return false
			}
			return true
		},
	); err != nil {
		return reward, errors.Wrap(err, "claim work reward error")
	}
	return reward, nil
}

func (pc *CacheProtoContract) ClaimWorkRewardServer(ctx context.Context, nodeAcc common.Address) error {

	_, err := pc.QueryRegisterInfo(nodeAcc)
	if err != nil {
		return err
	}
	var term int64 = 1
	ticker := time.NewTicker(time.Hour * 12)
	for {
		select {
		case <-ctx.Done():
			return nil
		case <-ticker.C:
			t, err := pc.QueryCurrencyTerm()
			if err != nil {
				continue
			}
			if t.Int64() <= term {
				continue
			}
			term += 1
			tx, err := pc.ClaimWorkReward(ctx, nodeAcc)
			if err != nil {
				//TODO: print log
				logger.GetGlobalLogger().GetLogger("transaction").Errorf("claim work reward in term %d error %v \n", term, err)
			} else {
				//TODO: print log
				logger.GetGlobalLogger().GetLogger("transaction").Infof("claim work reward in term %d success: %s \n", term, tx)
			}
		}
	}
}

func (pc *CacheProtoContract) ExitNetwork(ctx context.Context, nodeAcc common.Address) error {

	opts, err := pc.NewOption(ctx, "")
	if err != nil {
		return errors.Wrap(err, "node exit network error")
	}
	_, err = pc.CacheProto.Exit(opts)
	if err != nil {
		return errors.Wrap(err, "node exit network error")
	}
	ctx, cancel := context.WithTimeout(context.Background(), time.Second*15)
	defer cancel()
	if err = pc.LogFilter(
		ctx,
		ethereum.FilterQuery{
			Addresses: []common.Address{pc.Address},
		},
		func(l types.Log) bool {
			event, err := pc.CacheProto.ParseClaim(l)
			if err != nil {
				return true
			}
			if event.NodeAcc == nodeAcc {
				return false
			}
			return true
		},
	); err != nil {
		return errors.Wrap(err, "node exit network error")
	}
	return nil
}

func (pc *CacheProtoContract) CreateCreditOrder(ctx context.Context, key, nodeId, value string) (string, string, error) {
	bPeerId, err := base58.Decode(nodeId)
	if err != nil {
		return "", "", errors.Wrap(err, "create credit order")
	}
	info, err := pc.QueryRegisterInfo(common.HexToAddress(key))
	if err != nil {
		return "", "", errors.Wrap(err, "create credit order")
	}
	if !bytes.Equal(info.PeerId, bPeerId) {
		err = errors.New("peer ID does not match the registered one")
		return "", "", errors.Wrap(err, "create credit order")
	}
	tx, orderId, err := pc.CreateCacheOrder(ctx, common.HexToAddress(key), value)
	if err != nil {
		return "", "", errors.Wrap(err, "create credit order")
	}
	return tx, hex.EncodeToString(orderId[:]), nil
}

func (pc *CacheProtoContract) CheckCreditOrder(ctx context.Context, pubkey, data, sign []byte) (string, error) {

	if crypto.VerifySignature(
		pubkey,
		crypto.Keccak256Hash(data).Bytes(), sign,
	) {
		return "", errors.Wrap(errors.New("bad signature"), "check credit order error")
	}
	order, err := pc.QueryCacheOrder([32]byte(data))
	if err != nil {
		return "", errors.Wrap(err, "check credit order error")
	}
	if order.Node != pc.Node {
		return "", errors.Wrap(err, "check credit order error")
	}
	term, err := pc.QueryCurrencyTerm()
	if err != nil {
		return "", errors.Wrap(err, "check credit order error")
	}
	if term.Cmp(order.Term.Add(order.Term, big.NewInt(4))) == 1 {
		return "", errors.Wrap(err, "check credit order error")
	}
	err = pc.ClaimOrder(ctx, [32]byte(data))
	if err != nil {
		return "", errors.Wrap(err, "check credit order error")
	}
	return order.Value.String(), nil
}
