import { WindowMessageStream } from "@/messaging/WindowMessageStream";
import { injectExtension } from "@polkadot/extension-inject";
import Injected from "./Injected";

const messagesStream = new WindowMessageStream(
  "kless_in-page",
  "kless_content-script"
);

function inject(messagesStream: WindowMessageStream) {
  injectExtension(
    () => {
      return Promise.resolve(new Injected(messagesStream));
    },
    {
      name: "kless-wallet",
      version: "0.1.0",
    }
  );
}

inject(messagesStream);
