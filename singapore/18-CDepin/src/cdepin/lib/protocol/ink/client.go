/*
   Copyright 2022 CESS (Cumulus Encrypted Storage System) authors

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

package ink

import (
	"sync"
	"sync/atomic"
	"time"

	gsrpc "github.com/centrifuge/go-substrate-rpc-client/v4"
	"github.com/centrifuge/go-substrate-rpc-client/v4/signature"
	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"github.com/pkg/errors"
)

type IChain interface {
	// Getpublickey returns its own public key
	GetPublicKey() []byte
	// GetSyncStatus returns whether the block is being synchronized
	GetSyncStatus() (bool, error)
	// GetCessAccount is used to get the account in cess chain format
	GetCessAccount() (string, error)
	// GetIncomePublicKey returns its stash account public key
	GetIncomeAccount() string

	Staking(nodeAcc, tokenAcc types.AccountID, tokenId [32]byte, peerId, sign []byte, value string) (string, error)
	CacheOrderPayment(nodeAcc types.AccountID, value string) (string, error)
	OrderClaim(orderId []byte) (string, error)
	CalimReward() (string, error)
	Exit() (string, error)
	IsTokenOwner(acc types.AccountID, tokenId [32]byte) (string, error)

	MintToken(value string) (string, error)
	Withdraw() (string, error)
	TransferFrom(tokenId [32]byte, to types.AccountID) (string, error)
	GetOwnerOf(tokenId [32]byte, acc *([]byte)) (string, error)
}

var cli IChain

type Config struct {
	RpcAddr     string
	AccountSeed string
	AccountID   string
}

type chainClient struct {
	lock            *sync.Mutex
	api             *gsrpc.SubstrateAPI
	chainState      *atomic.Bool
	metadata        *types.Metadata
	runtimeVersion  *types.RuntimeVersion
	keyEvents       types.StorageKey
	genesisHash     types.Hash
	keyring         signature.KeyringPair
	rpcAddr         string
	IncomeAcc       string
	timeForBlockOut time.Duration
}

var TimeOut_WaitBlock = time.Duration(time.Second * 15)

func GetChainCli() IChain {
	return cli
}

func InitChainClient(conf Config) error {
	var err error
	cli, err = NewChainClient(
		conf.RpcAddr,
		conf.AccountSeed,
		conf.AccountID,
		TimeOut_WaitBlock,
	)
	if err != nil {
		return errors.Wrap(err, "init chain client error")
	}
	return nil
}

func NewChainClient(rpcAddr, secret, incomeAcc string, t time.Duration) (IChain, error) {
	var (
		err error
		cli = &chainClient{}
	)
	cli.api, err = gsrpc.NewSubstrateAPI(rpcAddr)
	if err != nil {
		return nil, err
	}
	cli.metadata, err = cli.api.RPC.State.GetMetadataLatest()
	if err != nil {
		return nil, err
	}
	cli.genesisHash, err = cli.api.RPC.Chain.GetBlockHash(0)
	if err != nil {
		return nil, err
	}
	cli.runtimeVersion, err = cli.api.RPC.State.GetRuntimeVersionLatest()
	if err != nil {
		return nil, err
	}
	cli.keyEvents, err = types.CreateStorageKey(
		cli.metadata,
		_SYSTEM,
		_SYSTEM_EVENTS,
		nil,
	)
	if err != nil {
		return nil, err
	}
	if secret != "" {
		cli.keyring, err = signature.KeyringPairFromSecret(secret, 0)
		if err != nil {
			return nil, err
		}
	}
	cli.lock = new(sync.Mutex)
	cli.chainState = &atomic.Bool{}
	cli.chainState.Store(true)
	cli.timeForBlockOut = t
	cli.rpcAddr = rpcAddr
	cli.IncomeAcc = incomeAcc
	return cli, nil
}

func (c *chainClient) IsChainClientOk() bool {
	err := healthchek(c.api)
	if err != nil {
		c.api = nil
		cli, err := reconnectChainClient(c.rpcAddr)
		if err != nil {
			return false
		}
		c.api = cli
		return true
	}
	return true
}

func (c *chainClient) SetChainState(state bool) {
	c.chainState.Store(state)
}

func (c *chainClient) GetChainState() bool {
	return c.chainState.Load()
}

func (c *chainClient) NewAccountId(pubkey []byte) types.AccountID {
	acc, err := types.NewAccountID(pubkey)
	if err != nil {
		return types.AccountID{}
	}
	return *acc
}

func reconnectChainClient(rpcAddr string) (*gsrpc.SubstrateAPI, error) {
	return gsrpc.NewSubstrateAPI(rpcAddr)
}

func healthchek(a *gsrpc.SubstrateAPI) error {
	defer func() {
		recover()
	}()
	_, err := a.RPC.System.Health()
	return err
}
