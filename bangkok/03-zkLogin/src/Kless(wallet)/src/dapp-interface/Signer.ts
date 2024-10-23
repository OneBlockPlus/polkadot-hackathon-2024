// Copyright 2019-2024 @polkadot/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import { createMessage } from "@/messaging/messages";
import { WindowMessageStream } from "@/messaging/WindowMessageStream";
import type {
  Signer as SignerInterface,
  SignerResult,
} from "@polkadot/api/types";
import type { SignerPayloadJSON } from "@polkadot/types/types";
import { mapToPromise } from "./utils";

// External to class, this.# is not private enough (yet)
let nextId = 0;

export default class Signer implements SignerInterface {
  private messagesStream: WindowMessageStream;

  constructor(messagesStream: WindowMessageStream) {
    this.messagesStream = messagesStream;
  }

  public async signPayload(payload: SignerPayloadJSON): Promise<SignerResult> {
    console.log("signPayload", payload);
    const id = ++nextId;
    return mapToPromise(
      this.messagesStream.sendRequest({
        type: "sign-transaction-request",
        transaction: payload,
      }),
      (response) => {
        console.log("signPayload response", response);

        const error = new Error("signPayload response");
        //@ts-ignore
        error.id = id;
        error.message = "signPayload response";
        //@ts-ignore
        error.result = response.result;

        throw error;
      }
    );
  }

  public async signRaw(): Promise<SignerResult> {
    throw new Error("Unsupported signRaw");
  }
}
