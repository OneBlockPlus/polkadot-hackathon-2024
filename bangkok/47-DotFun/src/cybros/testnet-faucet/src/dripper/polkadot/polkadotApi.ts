import "@polkadot/api-augment";
import { ApiPromise } from "@polkadot/api";
import { HttpProvider, WsProvider } from "@polkadot/rpc-provider";

import { config } from "../../config";
import { getNetworkData } from "../../networkData";

const networkName = config.Get("NETWORK");
const networkData = getNetworkData(networkName);

const provider = ((): HttpProvider | WsProvider => {
  const rpcEndpoint = networkData.rpcEndpoint;
  if (rpcEndpoint.startsWith("wss://") || rpcEndpoint.startsWith("ws://")) {
    return new WsProvider(rpcEndpoint);
  } else if (rpcEndpoint.startsWith("https://") || rpcEndpoint.startsWith("http://")) {
    return new HttpProvider(rpcEndpoint);
  } else {
    throw new Error(
      `⭕ RPC endpoint is invalid. Check the CUSTOM_NETWORK_RPC_ENDPOINT variable if you're using custom network.`
    );
  }
})();

const polkadotApi = new ApiPromise({ provider });

export default polkadotApi;
