// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { isBasePayload } from '@/messaging/messages/payloads';
import type { BasePayload, Payload } from '@/messaging/messages/payloads';

export type WalletStatusChange = {
	accounts?: { address: string; publicKey: string | null; nickname: string | null }[];
};

export interface WalletStatusChangePayload extends BasePayload, WalletStatusChange {
	type: 'wallet-status-changed';
}

export function isWalletStatusChangePayload(
	payload: Payload,
): payload is WalletStatusChangePayload {
	return isBasePayload(payload) && payload.type === 'wallet-status-changed';
}
