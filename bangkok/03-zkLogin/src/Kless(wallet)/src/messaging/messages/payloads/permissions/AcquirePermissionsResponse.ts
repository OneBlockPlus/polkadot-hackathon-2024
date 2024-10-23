// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { isBasePayload } from '@/messaging/messages/payloads';
import type { BasePayload, Payload } from '@/messaging/messages/payloads';

export interface AcquirePermissionsResponse extends BasePayload {
	type: 'acquire-permissions-response';
	result: boolean;
}

export function isAcquirePermissionsResponse(
	payload: Payload,
): payload is AcquirePermissionsResponse {
	return isBasePayload(payload) && payload.type === 'acquire-permissions-response';
}
