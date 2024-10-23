// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { isBasePayload } from '@/messaging/messages/payloads';
import type { BasePayload, Payload } from '@/messaging/messages/payloads';

export interface DisconnectApp extends BasePayload {
	type: 'disconnect-app';
	origin: string;
	specificAccounts?: string[];
}

export function isDisconnectApp(payload: Payload): payload is DisconnectApp {
	return isBasePayload(payload) && payload.type === 'disconnect-app';
}
