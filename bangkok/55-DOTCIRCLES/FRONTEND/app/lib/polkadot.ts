import { ApiPromise, WsProvider } from "@polkadot/api";
import { cryptoWaitReady } from "@polkadot/util-crypto";

let apiInstance: ApiPromise | null = null;

export default async function getApi() {
  if (apiInstance) {
    return apiInstance;
  }

  await cryptoWaitReady();

  const wsProvider = new WsProvider(process.env.NEXT_PUBLIC_RPC);
  apiInstance = await ApiPromise.create({ provider: wsProvider });

  return apiInstance;
}
