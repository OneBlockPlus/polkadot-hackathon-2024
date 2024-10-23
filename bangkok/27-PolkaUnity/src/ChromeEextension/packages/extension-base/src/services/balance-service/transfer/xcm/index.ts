// Copyright 2019-2022 @subwallet/extension-base
// SPDX-License-Identifier: Apache-2.0

import { _ChainAsset, _ChainInfo } from '@subwallet/chain-list/types';
import { _isSnowBridgeXcm } from '@subwallet/extension-base/core/substrate/xcm-parser';
import { getExtrinsicByPolkadotXcmPallet } from '@subwallet/extension-base/services/balance-service/transfer/xcm/polkadotXcm';
import { getSnowBridgeEvmTransfer } from '@subwallet/extension-base/services/balance-service/transfer/xcm/snowBridge';
import { getExtrinsicByXcmPalletPallet } from '@subwallet/extension-base/services/balance-service/transfer/xcm/xcmPallet';
import { getExtrinsicByXtokensPallet } from '@subwallet/extension-base/services/balance-service/transfer/xcm/xTokens';
import { _XCM_CHAIN_GROUP } from '@subwallet/extension-base/services/chain-service/constants';
import { _EvmApi, _SubstrateApi } from '@subwallet/extension-base/services/chain-service/types';
import { _isChainEvmCompatible, _isNativeToken } from '@subwallet/extension-base/services/chain-service/utils';
import BigN from 'bignumber.js';
import { TransactionConfig } from 'web3-core';

import { SubmittableExtrinsic } from '@polkadot/api/types';
import { u8aToHex } from '@polkadot/util';
import { addressToEvm, isEthereumAddress } from '@polkadot/util-crypto';

type CreateXcmExtrinsicProps = {
  originTokenInfo: _ChainAsset;
  destinationTokenInfo: _ChainAsset;
  recipient: string;
  sendingValue: string;

  substrateApi: _SubstrateApi;
  chainInfoMap: Record<string, _ChainInfo>;
}

type CreateSnowBridgeExtrinsicProps = Omit<CreateXcmExtrinsicProps, 'substrateApi'> & {
  evmApi: _EvmApi;
  sender: string
}

export const createSnowBridgeExtrinsic = async ({ chainInfoMap,
  destinationTokenInfo,
  evmApi,
  originTokenInfo,
  recipient,
  sender,
  sendingValue }: CreateSnowBridgeExtrinsicProps): Promise<TransactionConfig> => {
  const originChainInfo = chainInfoMap[originTokenInfo.originChain];
  const destinationChainInfo = chainInfoMap[destinationTokenInfo.originChain];

  if (!_isSnowBridgeXcm(originChainInfo, destinationChainInfo)) {
    throw new Error('This is not a valid SnowBridge transfer');
  }

  return getSnowBridgeEvmTransfer(originTokenInfo, originChainInfo, destinationChainInfo, sender, recipient, sendingValue, evmApi);
};

export const createXcmExtrinsic = async ({ chainInfoMap,
  destinationTokenInfo,
  originTokenInfo,
  recipient,
  sendingValue,
  substrateApi }: CreateXcmExtrinsicProps): Promise<SubmittableExtrinsic<'promise'>> => {
  const originChainInfo = chainInfoMap[originTokenInfo.originChain];
  const destinationChainInfo = chainInfoMap[destinationTokenInfo.originChain];

  const chainApi = await substrateApi.isReady;
  const api = chainApi.api;

  const polkadotXcmSpecialCases = _XCM_CHAIN_GROUP.polkadotXcmSpecialCases.includes(originChainInfo.slug) && _isNativeToken(originTokenInfo);

  if (_XCM_CHAIN_GROUP.polkadotXcm.includes(originTokenInfo.originChain) || polkadotXcmSpecialCases) {
    return getExtrinsicByPolkadotXcmPallet(originTokenInfo, originChainInfo, destinationChainInfo, recipient, sendingValue, api);
  }

  if (_XCM_CHAIN_GROUP.xcmPallet.includes(originTokenInfo.originChain)) {
    return getExtrinsicByXcmPalletPallet(originTokenInfo, originChainInfo, destinationChainInfo, recipient, sendingValue, api);
  }

  return getExtrinsicByXtokensPallet(originTokenInfo, originChainInfo, destinationChainInfo, recipient, sendingValue, api);
};

export const getXcmMockTxFee = async (substrateApi: _SubstrateApi, chainInfoMap: Record<string, _ChainInfo>, originTokenInfo: _ChainAsset, destinationTokenInfo: _ChainAsset): Promise<BigN> => {
  try {
    const destChainInfo = chainInfoMap[destinationTokenInfo.originChain];
    const originChainInfo = chainInfoMap[originTokenInfo.originChain];
    const address = '5DRewsYzhJqZXU3SRaWy1FSt5iDr875ao91aw5fjrJmDG4Ap'; // todo: move this

    // mock receiving account from sender
    const recipient = !isEthereumAddress(address) && _isChainEvmCompatible(destChainInfo) && !_isChainEvmCompatible(originChainInfo)
      ? u8aToHex(addressToEvm(address))
      : address
    ;

    const mockTx = await createXcmExtrinsic({
      chainInfoMap,
      destinationTokenInfo,
      originTokenInfo,
      recipient: recipient,
      sendingValue: '1000000000000000000',
      substrateApi
    });
    const paymentInfo = await mockTx.paymentInfo(address);

    return new BigN(paymentInfo?.partialFee?.toString() || '0');
  } catch (e) {
    console.error('error mocking xcm tx fee', e);

    return new BigN(0);
  }
};
