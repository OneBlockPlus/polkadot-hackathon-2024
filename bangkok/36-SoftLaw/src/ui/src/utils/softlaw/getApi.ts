import { ApiPromise, WsProvider } from "@polkadot/api";

export const getSoftlawApi = async () => {
  const wsProvider = new WsProvider("wss://testnet.soft.law/node");
  // const wsProvider = new WsProvider("ws://127.0.0.1:57935");

  const api = await ApiPromise.create({
    provider: wsProvider,
    // types: {
    //   ip_pallet: {
    //     mint_nft: {
    //       name: 'string',
    //       description: 'string',
    //       filing_date: 'string',
    //       jurisdiction: 'string',
    //     },
    //   },
    // },
  });

  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
  ]);

  console.log(`Connected to chain ${chain} using ${nodeName} v${nodeVersion}`);
  console.log("Genesis hash:", api.genesisHash.toHex());

  return api;
};
