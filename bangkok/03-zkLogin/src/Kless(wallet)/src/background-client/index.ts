import type { Message } from "@/messaging/messages";
import { createMessage } from "@/messaging/messages";
import { PortStream } from "@/messaging/PortStream";

import {
  isMethodPayload,
  MethodPayload,
} from "@/messaging/messages/payloads/MethodPayload";
import type {
  GetPermissionRequests,
  PermissionResponse,
} from "@/messaging/messages/payloads/permissions";
import type { DisconnectApp } from "@/messaging/messages/payloads/permissions/DisconnectApp";
import type { GetTransactionRequests } from "@/messaging/messages/payloads/transactions/ui/GetTransactionRequests";
import { isGetTransactionRequestsResponse } from "@/messaging/messages/payloads/transactions/ui/GetTransactionRequestsResponse";
import type { TransactionRequestResponse } from "@/messaging/messages/payloads/transactions/ui/TransactionRequestResponse";
import { useAppStore } from "@/state/store";
import { lastValueFrom, map, take } from "rxjs";

export class BackgroundClient {
  private _portStream: PortStream | null = null;
  private _initialized = false;

  public init() {
    if (this._initialized) {
      throw new Error("[BackgroundClient] already initialized");
    }
    console.log("BackgroundClient.init");
    this._initialized = true;
    this.createPortStream();
    return Promise.all([this.sendGetTransactionRequests()]).then(
      () => undefined
    );
  }

  public sendPermissionResponse(
    id: string,
    accounts: string[],
    allowed: boolean,
    responseDate: string
  ) {
    this.sendMessage(
      createMessage<PermissionResponse>({
        id,
        type: "permission-response",
        accounts,
        allowed,
        responseDate,
      })
    );
  }

  public sendGetPermissionRequests() {
    return lastValueFrom(
      this.sendMessage(
        createMessage<GetPermissionRequests>({
          type: "get-permission-requests",
        })
      ).pipe(take(1))
    );
  }

  public sendTransactionRequestResponse(
    txID: string,
    approved: boolean,
    txResult?: any,
    txResultError?: string,
    txSigned?: any
  ) {
    this.sendMessage(
      createMessage<TransactionRequestResponse>({
        type: "transaction-request-response",
        approved,
        txID,
        txResult,
        txResultError,
        txSigned,
      })
    );
  }

  public sendGetTransactionRequests() {
    return lastValueFrom(
      this.sendMessage(
        createMessage<GetTransactionRequests>({
          type: "get-transaction-requests",
        })
      ).pipe(take(1))
    );
  }

  /**
   * Disconnect a dapp, if specificAccounts contains accounts then only those accounts will be disconnected.
   * @param origin The origin of the dapp
   * @param specificAccounts Accounts to disconnect. If not provided or it's an empty array all accounts will be disconnected
   */
  public async disconnectApp(origin: string, specificAccounts?: string[]) {
    await lastValueFrom(
      this.sendMessage(
        createMessage<DisconnectApp>({
          type: "disconnect-app",
          origin,
          specificAccounts,
        })
      ).pipe(take(1))
    );
  }

  public getStoredEntities<R>(type: any): Promise<R[]> {
    return lastValueFrom(
      this.sendMessage(
        createMessage<MethodPayload<"getStoredEntities">>({
          method: "getStoredEntities",
          type: "method-payload",
          args: { type },
        })
      ).pipe(
        take(1),
        map(({ payload }) => {
          if (!isMethodPayload(payload, "storedEntitiesResponse")) {
            throw new Error("Unknown response");
          }
          if (type !== payload.args.type) {
            throw new Error(
              `unexpected entity type response ${payload.args.type}`
            );
          }
          return payload.args.entities;
        })
      )
    );
  }

  public unlockAccountSourceOrAccount(
    inputs: MethodPayload<"unlockAccountSourceOrAccount">["args"]
  ) {
    return lastValueFrom(
      this.sendMessage(
        createMessage<MethodPayload<"unlockAccountSourceOrAccount">>({
          type: "method-payload",
          method: "unlockAccountSourceOrAccount",
          args: inputs,
        })
      ).pipe(take(1))
    );
  }

  public lockAccountSourceOrAccount({
    id,
  }: MethodPayload<"lockAccountSourceOrAccount">["args"]) {
    return lastValueFrom(
      this.sendMessage(
        createMessage<MethodPayload<"lockAccountSourceOrAccount">>({
          type: "method-payload",
          method: "lockAccountSourceOrAccount",
          args: { id },
        })
      ).pipe(take(1))
    );
  }

  public getAccountSourceEntropy(
    args: MethodPayload<"getAccountSourceEntropy">["args"]
  ) {
    return lastValueFrom(
      this.sendMessage(
        createMessage<MethodPayload<"getAccountSourceEntropy">>({
          type: "method-payload",
          method: "getAccountSourceEntropy",
          args,
        })
      ).pipe(
        take(1),
        map(({ payload }) => {
          if (isMethodPayload(payload, "getAccountSourceEntropyResponse")) {
            return payload.args;
          }
          throw new Error("Unexpected response type");
        })
      )
    );
  }

  public getAutoLockMinutes() {
    return lastValueFrom(
      this.sendMessage(
        createMessage<MethodPayload<"getAutoLockMinutes">>({
          type: "method-payload",
          method: "getAutoLockMinutes",
          args: {},
        })
      ).pipe(
        take(1),
        map(({ payload }) => {
          if (isMethodPayload(payload, "getAutoLockMinutesResponse")) {
            return payload.args.minutes;
          }
          throw new Error("Unexpected response type");
        })
      )
    );
  }

  public setAutoLockMinutes(args: MethodPayload<"setAutoLockMinutes">["args"]) {
    return lastValueFrom(
      this.sendMessage(
        createMessage<MethodPayload<"setAutoLockMinutes">>({
          type: "method-payload",
          method: "setAutoLockMinutes",
          args,
        })
      ).pipe(take(1))
    );
  }

  public notifyUserActive() {
    return lastValueFrom(
      this.sendMessage(
        createMessage<MethodPayload<"notifyUserActive">>({
          type: "method-payload",
          method: "notifyUserActive",
          args: {},
        })
      ).pipe(take(1))
    );
  }

  public removeAccount(args: MethodPayload<"removeAccount">["args"]) {
    return lastValueFrom(
      this.sendMessage(
        createMessage<MethodPayload<"removeAccount">>({
          type: "method-payload",
          method: "removeAccount",
          args,
        })
      ).pipe(take(1))
    );
  }

  public acknowledgeZkLoginWarning(
    args: MethodPayload<"acknowledgeZkLoginWarning">["args"]
  ) {
    return lastValueFrom(
      this.sendMessage(
        createMessage<MethodPayload<"acknowledgeZkLoginWarning">>({
          type: "method-payload",
          method: "acknowledgeZkLoginWarning",
          args,
        })
      ).pipe(take(1))
    );
  }

  private handleIncomingMessage(msg: Message) {
    if (!this._initialized) {
      throw new Error(
        "BackgroundClient is not initialized to handle incoming messages"
      );
    }
    const { payload } = msg;
    if (isGetTransactionRequestsResponse(payload)) {
      useAppStore.setState({ txRequests: payload.txRequests });
    }
  }

  private createPortStream() {
    this._portStream = PortStream.connectToBackgroundService(
      "kless_ui<->background"
    );
    this._portStream.onDisconnect.subscribe(() => {
      this.createPortStream();
    });
    this._portStream.onMessage.subscribe((msg) =>
      this.handleIncomingMessage(msg)
    );
  }

  private sendMessage(msg: Message) {
    if (this._portStream?.connected) {
      return this._portStream.sendMessage(msg);
    } else {
      throw new Error(
        "Failed to send message to background service. Port not connected."
      );
    }
  }
}
