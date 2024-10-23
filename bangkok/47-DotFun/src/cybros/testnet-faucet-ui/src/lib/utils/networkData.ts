import { base } from "$app/paths";
import { PUBLIC_FAUCET_URL } from "$env/static/public";

export interface ChainData {
  name: string;
  id: number;
}

function faucetUrl(defaultUrl: string): string {
  if (PUBLIC_FAUCET_URL !== "") {
    return PUBLIC_FAUCET_URL;
  }

  return defaultUrl;
}

export interface NetworkData {
  networkName: string;
  currency: string;
  chains: ChainData[];
  endpoint: string;
  explorer: string | null;
}

export const Cybros: NetworkData = {
  networkName: "Cybros",
  currency: "CBT",
  chains: [
    { name: "Dev (the Origin)", id: -1 },
  ],
  endpoint: faucetUrl("https://faucet-api.cybros.network/drip/web"),
  explorer: "https://scan.cybros.network",
};

export const Networks: { network: NetworkData; url: string }[] = [
  { network: Cybros, url: (base as string) || "/" },
];

export function getChainName(network: NetworkData, id: number): string | null {
  const index = network.chains.findIndex((ch) => ch.id === id);
  if (index < 0) {
    return null;
  }
  return network.chains[index].name;
}
