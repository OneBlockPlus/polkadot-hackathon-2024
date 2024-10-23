import { createMessage } from "@/messaging/messages";
import type { Permission } from "@/messaging/messages/payloads/permissions";
import type {
  WalletStatusChange,
  WalletStatusChangePayload,
} from "@/messaging/messages/payloads/wallet-status-change";
import Browser from "webextension-polyfill";

import type { Connection } from "./Connection";
import { ContentScriptConnection } from "./ContentScriptConnection";
import { UiConnection } from "./UiConnection";

const appOrigin = new URL(Browser.runtime.getURL("")).origin;

export class Connections {
  #connections: Connection[] = [];

  constructor() {
    Browser.runtime.onConnect.addListener((port) => {
      try {
        let connection: Connection;
        switch (port.name) {
          case ContentScriptConnection.CHANNEL:
            connection = new ContentScriptConnection(port);
            break;
          case UiConnection.CHANNEL:
            connection = new UiConnection(port);
            break;
          default:
            throw new Error(`[Connections] Unknown connection ${port.name}`);
        }
        this.#connections.push(connection);
        connection.onDisconnect.subscribe(() => {
          const connectionIndex = this.#connections.indexOf(connection);
          if (connectionIndex >= 0) {
            this.#connections.splice(connectionIndex, 1);
          }
        });
      } catch (e) {
        console.error(e);
        // port.disconnect();
      }
    });
  }

  public notifyContentScript(
    notification:
      | { event: "permissionReply"; permission: Permission }
      | {
          event: "walletStatusChange";
          change: Omit<WalletStatusChange, "accounts">;
        }
      | {
          event: "walletStatusChange";
          origin: string;
          change: WalletStatusChange;
        }
      | {
          event: "qredoConnectResult";
          origin: string;
          allowed: boolean;
        },
    messageID?: string
  ) {
    for (const aConnection of this.#connections) {
      if (aConnection instanceof ContentScriptConnection) {
        switch (notification.event) {
          case "permissionReply":
            aConnection.permissionReply(notification.permission);
            break;
          case "walletStatusChange":
            if (
              !("origin" in notification) ||
              aConnection.origin === notification.origin
            ) {
              aConnection.send(
                createMessage<WalletStatusChangePayload>({
                  type: "wallet-status-changed",
                  ...notification.change,
                })
              );
            }
            break;
        }
      }
    }
  }
}
