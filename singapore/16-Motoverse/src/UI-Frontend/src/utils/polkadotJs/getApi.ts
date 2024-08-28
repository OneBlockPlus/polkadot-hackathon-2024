import { ApiPromise, WsProvider } from "@polkadot/api";

export const getApi = async () => {
  const wsProvider = new WsProvider("wss://peregrine.kilt.io/");
  const api = await ApiPromise.create({ provider: wsProvider });
  console.log(api.genesisHash.toHex());
  return api;
};
