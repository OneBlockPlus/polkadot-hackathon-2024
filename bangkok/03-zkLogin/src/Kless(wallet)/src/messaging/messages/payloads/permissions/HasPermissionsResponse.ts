// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { isBasePayload } from '@/messaging/messages/payloads';
import type { BasePayload, Payload } from '@/messaging/messages/payloads';

export interface HasPermissionsResponse extends BasePayload {
	type: 'has-permissions-response';
	result: boolean;
}

export function isHasPermissionResponse(payload: Payload): payload is HasPermissionsResponse {
	return isBasePayload(payload) && payload.type === 'has-permissions-response';
}
