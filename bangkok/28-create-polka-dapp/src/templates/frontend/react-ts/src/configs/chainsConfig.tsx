import { ApiPromise, WsProvider } from "@polkadot/api";

export interface ChainConfig {
  name: string;
  rpcUrl: string;
  wsUrl: string;
  logo: string;
  contractAddress?: string;
}

export const chainsConfig: ChainConfig[] = [
  {
    name: "Polkadot",
    rpcUrl: "https://rpc.polkadot.io",
    wsUrl: "wss://rpc.polkadot.io",
    logo: "/images/polkadot-logo.svg",
  },
  {
    name: "Kusama",
    rpcUrl: "https://kusama-rpc.polkadot.io",
    wsUrl: "wss://kusama-rpc.polkadot.io",
    logo: "/images/kusama-logo.svg",
  },
  {
    name: "Westend",
    rpcUrl: "https://westend-rpc.polkadot.network",
    wsUrl: "wss://westend-rpc.polkadot.io",
    logo: "/images/polkadot-logo.svg",
  },
  // Add more chains as needed
];

export const getApiForChain = async (
  chainConfig: ChainConfig
): Promise<ApiPromise> => {
  const provider = new WsProvider(chainConfig.wsUrl);
  return await ApiPromise.create({ provider });
};
