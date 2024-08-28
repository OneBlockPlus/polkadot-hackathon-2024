// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import BN from 'bn.js';
import type { Abi } from '../substrate';

export type { BN };

export type OrFalsy<T> = T | null | undefined;

export type OrNull<T> = T | null;

export type OrUndef<T> = T | undefined;


export type SimpleSpread<L, R> = R & Pick<L, Exclude<keyof L, keyof R>>;

export interface FileState {
  data: Uint8Array;
  name: string;
  size: number;
}
