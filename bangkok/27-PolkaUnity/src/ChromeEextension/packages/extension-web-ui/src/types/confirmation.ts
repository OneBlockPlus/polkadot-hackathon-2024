// Copyright 2019-2022 @subwallet/extension-web-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { ConfirmationDefinitions } from '@subwallet/extension-base/background/KoniTypes';

export type EvmSignatureSupportType = keyof Pick<ConfirmationDefinitions, 'evmSignatureRequest' | 'evmSendTransactionRequest' | 'evmWatchTransactionRequest'>;
