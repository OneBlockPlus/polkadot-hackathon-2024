import type { Message } from "@/messaging/messages";
import { createMessage } from "@/messaging/messages";
import { type ErrorPayload } from "@/messaging/messages/payloads";
import { isGetAccount } from "@/messaging/messages/payloads/account/GetAccount";
import type { GetAccountResponse } from "@/messaging/messages/payloads/account/GetAccountResponse";
import {
  type AcquirePermissionsResponse,
  type Permission,
} from "@/messaging/messages/payloads/permissions";
import type { PortChannelName } from "@/messaging/PortChannelName";
import type { Runtime } from "webextension-polyfill";

import { Connection } from "./Connection";
import { getDB } from "../db";
import {
  ExecuteTransactionResponse,
  isSignTransactionRequest,
  SignTransactionResponse,
} from "@/messaging/messages/payloads/transactions";
import { getAccounts } from "@/lib/getAccounts";
import { signTransaction } from "@/lib/signTransaction";
import Transactions from "../Transactions";

export class ContentScriptConnection extends Connection {
  public static readonly CHANNEL: PortChannelName =
    "kless_content<->background";
  public readonly origin: string;
  public readonly pagelink?: string | undefined;
  public readonly originFavIcon: string | undefined;

  constructor(port: Runtime.Port) {
    super(port);
    this.origin = this.getOrigin(port);
    this.pagelink = this.getAppUrl(port);
    this.originFavIcon = port.sender?.tab?.favIconUrl;
  }

  protected async handleMessage(msg: Message) {
    const { payload } = msg;
    console.log("ContentScriptConnection.handleMessage", msg);
    try {
      if (isGetAccount(payload)) {
        const acounts = await getAccounts();

        await this.sendAccounts(
          acounts.map((item) => ({
            address: item.address,
            genesisHash: "",
            name: item.nickname,
            type: "sr25519",
          })),
          msg.id
        );
      } else if (isSignTransactionRequest(payload)) {
        const db = await getDB();
        const account = await db.accounts.get({
          address: payload.transaction.address,
        });
        const isLocked =
          Number(payload.transaction.blockNumber) > Number(account?.epoch);

          console.log(Number(payload.transaction.blockNumber), Number(account?.epoch))
        if (isLocked) {
          console.log('Account is locked')
          throw new Error("Account is locked");
        }

        const result = await Transactions.executeOrSignTransaction(
          { tx: payload.transaction },
          this
        );
        this.send(
          createMessage<ExecuteTransactionResponse>(
            {
              type: "execute-transaction-response",
              result: result,
            },
            msg.id
          )
        );
      } else {
        throw new Error(`Unknown message, ${JSON.stringify(msg.payload)}`);
      }
    } catch (e) {
      console.error(e);
      this.sendError(
        {
          error: true,
          code: -1,
          message: (e as Error).message,
        },
        msg.id
      );
    }
  }

  public permissionReply(permission: Permission, msgID?: string) {
    if (permission.origin !== this.origin) {
      return;
    }
    const requestMsgID = msgID || permission.requestMsgID;
    if (permission.allowed) {
      this.send(
        createMessage<AcquirePermissionsResponse>(
          {
            type: "acquire-permissions-response",
            result: !!permission.allowed,
          },
          requestMsgID
        )
      );
    } else {
      this.sendError(
        {
          error: true,
          message: "Permission rejected",
          code: -1,
        },
        requestMsgID
      );
    }
  }

  private getOrigin(port: Runtime.Port) {
    //@ts-ignore
    if (port.sender?.origin) {
      //@ts-ignore
      return port.sender.origin;
    }
    if (port.sender?.url) {
      return new URL(port.sender.url).origin;
    }
    throw new Error("[ContentScriptConnection] port doesn't include an origin");
  }

  // optional field for the app link.
  private getAppUrl(port: Runtime.Port) {
    if (port.sender?.url) {
      return new URL(port.sender.url).href;
    }
    return undefined;
  }

  private sendError<Error extends ErrorPayload>(
    error: Error,
    responseForID?: string
  ) {
    this.send(createMessage(error, responseForID));
  }

  private async sendAccounts(accounts: any[], responseForID?: string) {
    this.send(
      createMessage<GetAccountResponse>(
        {
          type: "get-account-response",
          accounts: accounts,
        },
        responseForID
      )
    );
  }
}
