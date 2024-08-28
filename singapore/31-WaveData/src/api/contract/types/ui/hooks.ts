// Copyright 2022 @paritytech/contracts-ui authors & contributors
// SPDX-License-Identifier: GPL-3.0-only

import { ContractPromise, VoidFn } from '../substrate';
import { BN, FileState } from './util';

export type InputMode = 'estimation' | 'custom';



export type UseToggle = [boolean, () => void, (value: boolean) => void];


export interface UIContract extends Pick<ContractPromise, 'abi' | 'tx'> {
  name: string;
  displayName: string;
  date: string;
  id: number | undefined;
  type: 'added' | 'instantiated';
  codeHash: string;
  address: string;
}
