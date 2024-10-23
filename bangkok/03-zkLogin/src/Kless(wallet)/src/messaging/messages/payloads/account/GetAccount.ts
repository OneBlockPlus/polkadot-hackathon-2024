// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { isBasePayload } from '@/messaging/messages/payloads';
import type { BasePayload, Payload } from '@/messaging/messages/payloads';

export interface GetAccount extends BasePayload {
	type: 'get-account';
}

export function isGetAccount(payload: Payload): payload is GetAccount {
	return isBasePayload(payload) && payload.type === 'get-account';
}
