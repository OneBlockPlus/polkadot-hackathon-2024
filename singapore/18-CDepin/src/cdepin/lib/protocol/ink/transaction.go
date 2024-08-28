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
	"encoding/hex"
	"strings"
	"time"

	"github.com/centrifuge/go-substrate-rpc-client/v4/types"
	"github.com/pkg/errors"
)

type CacheEventRecords struct {
	types.EventRecords
	CacheToken_Owner_of        types.AccountID
	CacheToken_MintToken       []MintToken
	CacheProtocol_NodeInfo     []NodeInfo
	CacheProtocol_OrderInfo    []OrderInfo
	CacheProtocol_Staking      []Staking
	CacheProtocol_OrderPayment []OrderPayment
	CacheProtocol_Claim        []Claim
	CacheProtocol_Exit         []Exit
}

func (c *chainClient) SubmitExtrinsic(method string,
	callback func(events CacheEventRecords) bool, args ...any) (string, error) {

	defer func() { recover() }()
	var (
		txhash string
		ext    types.Extrinsic
	)

	c.lock.Lock()
	defer c.lock.Unlock()

	if !c.IsChainClientOk() {
		c.SetChainState(false)
		return txhash, errors.Wrap(ERR_RPC_CONNECTION, "submit extrinsic error")
	}
	c.SetChainState(true)
	if call, err := types.NewCall(c.metadata, method, args...); err != nil {
		return txhash, errors.Wrap(err, "submit extrinsic error")
	} else {

		ext = types.NewExtrinsic(call)
	}

	accInfo, err := c.GetAccountInfo()
	if err != nil {
		return txhash, errors.Wrap(err, "submit extrinsic error")
	}
	o := types.SignatureOptions{
		BlockHash:          c.genesisHash,
		Era:                types.ExtrinsicEra{IsMortalEra: false},
		GenesisHash:        c.genesisHash,
		Nonce:              types.NewUCompactFromUInt(uint64(accInfo.Nonce)),
		SpecVersion:        c.runtimeVersion.SpecVersion,
		Tip:                types.NewUCompactFromUInt(0),
		TransactionVersion: c.runtimeVersion.TransactionVersion,
	}

	// Sign the transaction
	if err = ext.Sign(c.keyring, o); err != nil {
		return txhash, errors.Wrap(err, "submit extrinsic error")
	}
	// Do the transfer and track the actual status

	sub, err := c.api.RPC.Author.SubmitAndWatchExtrinsic(ext)
	if err != nil {
		if !strings.Contains(err.Error(), "Priority is too low") {
			return txhash, errors.Wrap(err, "submit extrinsic error")
		}
		for i := 0; i < 20; i++ {
			o.Nonce = types.NewUCompactFromUInt(uint64(accInfo.Nonce + types.NewU32(1)))
			// Sign the transaction
			if err = ext.Sign(c.keyring, o); err != nil {
				return txhash, errors.Wrap(err, "submit extrinsic error")
			}
			sub, err = c.api.RPC.Author.SubmitAndWatchExtrinsic(ext)
			if err == nil {
				break
			}
		}
		if err != nil {
			return txhash, errors.Wrap(err, "submit extrinsic error")
		}
	}
	defer sub.Unsubscribe()
	timeout := time.After(c.timeForBlockOut)
	for {
		select {
		case status := <-sub.Chan():
			if status.IsInBlock {
				events := CacheEventRecords{}

				txhash = hex.EncodeToString(status.AsInBlock[:])
				h, err := c.api.RPC.State.GetStorageRaw(c.keyEvents, status.AsInBlock)
				if err != nil {
					return txhash, errors.Wrap(err, "submit extrinsic error")
				}
				types.EventRecordsRaw(*h).DecodeEventRecords(c.metadata, &events)

				if callback(events) {
					return txhash, nil
				}
				return txhash, errors.Wrap(ERR_TX_FAILED, "submit extrinsic error")
			}
		case err = <-sub.Err():
			return txhash, errors.Wrap(err, "submit extrinsic error")
		case <-timeout:
			return txhash, errors.Wrap(ERR_RPC_TIMEOUT, "submit extrinsic error")
		}
	}
}
