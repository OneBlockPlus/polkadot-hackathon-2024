// Copyright 2019-2022 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { BalanceItem } from '@subwallet/extension-base/types';
import BigN from 'bignumber.js';

import { AccountId, AccountIndex, Address } from '@polkadot/types/interfaces';

export type AccountIdIsh = AccountId | AccountIndex | Address | string | Uint8Array | null;

export type AccountInfoByChain = {
  freeBalance: string
  frozenFee: string
  reservedBalance: string
  frozenMisc: string
}

export type AccountInfoItem = {
  networkKey: string;
  tokenDecimals: number[];
  tokenSymbols: string[];
  balanceItem: BalanceItem;
}

export type Info = {
  ss58Format: number
  tokenDecimals?: number[]
  tokenSymbol: string[]
  icon: string
  name: string
}

export type BalanceSubInfo = {
  key: string;
  label: string;
  symbol: string;
  balanceValue: BigN;
  convertedBalanceValue: BigN;
}

export type AccountInfoByNetwork = {
  key: string;
  networkKey: string;
  networkDisplayName: string;
  networkPrefix: number;
  networkLogo: string;
  networkIconTheme: string;
  address: string;
  formattedAddress: string;
}

export type BalanceInfo = {
  symbol: string;
  balanceValue: BigN;
  convertedBalanceValue: BigN;
  detailBalances: BalanceSubInfo[];
  childrenBalances: BalanceSubInfo[];
  timestamp?: number;
  isLoading?: boolean;
}
