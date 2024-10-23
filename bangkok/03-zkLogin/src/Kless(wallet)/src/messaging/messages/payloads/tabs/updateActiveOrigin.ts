// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { isBasePayload } from '@/messaging/messages/payloads';
import type { BasePayload, Payload } from '@/messaging/messages/payloads';

export interface UpdateActiveOrigin extends BasePayload {
	type: 'update-active-origin';
	origin: string | null;
	favIcon: string | null;
}

export function isUpdateActiveOrigin(payload: Payload): payload is UpdateActiveOrigin {
	return isBasePayload(payload) && payload.type === 'update-active-origin';
}
