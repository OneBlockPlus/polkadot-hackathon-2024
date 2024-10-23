// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { isBasePayload } from '@/messaging/messages/payloads';
import type { BasePayload, Payload } from '@/messaging/messages/payloads';

export interface PermissionResponse extends BasePayload {
	type: 'permission-response';
	id: string;
	accounts: string[];
	allowed: boolean;
	responseDate: string;
}

export function isPermissionResponse(payload: Payload): payload is PermissionResponse {
	return isBasePayload(payload) && payload.type === 'permission-response';
}
