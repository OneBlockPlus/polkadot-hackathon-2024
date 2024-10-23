import { WindowMessageStream } from "@/messaging/WindowMessageStream";
import type { Injected } from "@polkadot/extension-inject/types";
import Accounts from "./Accounts.js";
import Metadata from "./Metadata.js";
import Signer from "./Signer.js";

export default class implements Injected {
  public readonly accounts: Accounts;

  public readonly metadata: Metadata;

  public readonly signer: Signer;

  constructor(messagesStream: WindowMessageStream) {
    this.accounts = new Accounts(messagesStream);
    this.metadata = new Metadata();
    this.signer = new Signer(messagesStream);
  }
}
