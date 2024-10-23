// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { PortStream } from '@/messaging/PortStream';
import { WindowMessageStream } from '@/messaging/WindowMessageStream';
import type { Message } from '@/messaging/messages';
import { take } from 'rxjs';

function createPort(windowMsgStream: WindowMessageStream, currentMsg?: Message) {
	const port = PortStream.connectToBackgroundService('kless_content<->background');
	if (currentMsg) {
		port.sendMessage(currentMsg);
	}
	port.onMessage.subscribe((msg) => {
		windowMsgStream.send(msg);
	});
	const windowMsgSub = windowMsgStream.messages.subscribe((msg) => {
		port.sendMessage(msg);
	});
	port.onDisconnect.subscribe((port) => {
		windowMsgSub.unsubscribe();
		createPort(windowMsgStream);
	});
}

export function setupMessagesProxy() {
	const windowMsgStream = new WindowMessageStream('kless_content-script', 'kless_in-page');
	windowMsgStream.messages.pipe(take(1)).subscribe((msg) => {
		createPort(windowMsgStream, msg);
	});
}
