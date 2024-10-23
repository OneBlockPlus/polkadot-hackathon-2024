// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import Transactions from "@/background/Transactions";
import type { Message } from "@/messaging/messages";
import { createMessage } from "@/messaging/messages";
import { type ErrorPayload } from "@/messaging/messages/payloads";
import {
  type MethodPayload,
  type UIAccessibleEntityType,
} from "@/messaging/messages/payloads/MethodPayload";
import type {
  Permission,
  PermissionRequests,
} from "@/messaging/messages/payloads/permissions";
import type { ApprovalRequest } from "@/messaging/messages/payloads/transactions/ApprovalRequest";
import { isGetTransactionRequests } from "@/messaging/messages/payloads/transactions/ui/GetTransactionRequests";
import type { GetTransactionRequestsResponse } from "@/messaging/messages/payloads/transactions/ui/GetTransactionRequestsResponse";
import { isTransactionRequestResponse } from "@/messaging/messages/payloads/transactions/ui/TransactionRequestResponse";
import type { PortChannelName } from "@/messaging/PortChannelName";
import { BehaviorSubject } from "rxjs";
import type { Runtime } from "webextension-polyfill";

import { Connection } from "./Connection";

export class UiConnection extends Connection {
  public static readonly CHANNEL: PortChannelName = "kless_ui<->background";
  private uiAppInitialized: BehaviorSubject<boolean> = new BehaviorSubject(
    false
  );

  constructor(port: Runtime.Port) {
    super(port);
  }

  public async notifyEntitiesUpdated(entitiesType: UIAccessibleEntityType) {
    this.send(
      createMessage<MethodPayload<"entitiesUpdated">>({
        type: "method-payload",
        method: "entitiesUpdated",
        args: {
          type: entitiesType,
        },
      })
    );
  }

  protected async handleMessage(msg: Message) {
		console.log('UiConnection.handleMessage', msg);
    const { payload, id } = msg;
    try {
      if (isTransactionRequestResponse(payload)) {
        Transactions.handleMessage(payload);
      } else if (isGetTransactionRequests(payload)) {
        this.sendTransactionRequests(
          Object.values(await Transactions.getTransactionRequests()),
          id
        );
      } else {
        throw new Error(
          `Unhandled message ${msg.id}. (${JSON.stringify(
            "error" in payload
              ? `${payload.code}-${payload.message}`
              : payload.type
          )})`
        );
      }
    } catch (e) {
      this.send(
        createMessage<ErrorPayload>(
          {
            error: true,
            code: -1,
            message: (e as Error).message,
          },
          id
        )
      );
    }
  }

  private sendPermissions(permissions: Permission[], requestID: string) {
    this.send(
      createMessage<PermissionRequests>(
        {
          type: "permission-request",
          permissions,
        },
        requestID
      )
    );
  }

  private sendTransactionRequests(
    txRequests: ApprovalRequest[],
    requestID: string
  ) {
    this.send(
      createMessage<GetTransactionRequestsResponse>(
        {
          type: "get-transaction-requests-response",
          txRequests,
        },
        requestID
      )
    );
  }
}
