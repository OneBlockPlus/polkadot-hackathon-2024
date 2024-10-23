import { WindowMessageStream } from "@/messaging/WindowMessageStream";
import { GetAccount } from "@/messaging/messages/payloads/account/GetAccount";
import { GetAccountResponse } from "@/messaging/messages/payloads/account/GetAccountResponse";
import type {
  InjectedAccount,
  InjectedAccounts,
  Unsubcall,
} from "@polkadot/extension-inject/types";
import { mapToPromise } from "./utils";

export default class Accounts implements InjectedAccounts {
  private messagesStream: WindowMessageStream;

  constructor(messagesStream: WindowMessageStream) {
    this.messagesStream = messagesStream;
  }
  public get(anyType?: boolean): Promise<InjectedAccount[]> {
    return mapToPromise(
      this.messagesStream.sendRequest<GetAccount, GetAccountResponse>({
        type: "get-account",
      }),
      (response) => response.accounts
    );
  }

  public subscribe(cb: (accounts: InjectedAccount[]) => unknown): Unsubcall {
    const sub = this.messagesStream
      .sendRequest<GetAccount, GetAccountResponse>({
        type: "get-account",
      })
      .subscribe((data) => {
        cb(data.accounts);
      });

    return () => {
      sub.unsubscribe();
    };
  }
}
