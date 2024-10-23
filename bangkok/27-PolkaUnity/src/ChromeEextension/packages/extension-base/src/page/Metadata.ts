// Copyright 2019-2022 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InjectedMetadata, InjectedMetadataKnown, MetadataDef } from '@subwallet/extension-inject/types';
import type { SendRequest } from './types';

import { RequestAddPspToken } from '@subwallet/extension-base/background/KoniTypes';

// External to class, this.# is not private enough (yet)
let sendRequest: SendRequest;

export default class Metadata implements InjectedMetadata {
  constructor (_sendRequest: SendRequest) {
    sendRequest = _sendRequest;
  }

  public get (): Promise<InjectedMetadataKnown[]> {
    return sendRequest('pub(metadata.list)');
  }

  public provide (definition: MetadataDef): Promise<boolean> {
    return sendRequest('pub(metadata.provide)', definition);
  }

  public addToken (request: RequestAddPspToken): Promise<boolean> {
    return sendRequest('pub(token.add)', request);
  }
}
