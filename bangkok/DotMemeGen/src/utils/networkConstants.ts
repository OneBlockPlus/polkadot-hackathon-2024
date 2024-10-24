import { ChainProps } from "../types";

export const network = {
  POLKADOT: "polkadot",
  KUSAMA: "kusama",
};

export const tokenSymbol = {
  DOT: "DOT",
  KSM: "KSM",
};

export const chainProperties: { [key: string]: ChainProps } = {
  [network.POLKADOT]: {
    blockTime: 6000,
    category: "polkadot",
    chainId: 0,
    parachain: "1000",
    palletInstance: "50",
    rpcEndpoint: "wss://polkadot.api.onfinality.io/public-ws",
    ss58Format: 0,
    tokenDecimals: 10,
    tokenSymbol: tokenSymbol.DOT,
    externalLinks: "https://polkadot.api.subscan.io",
    rpcEndpoints: [
      {
        label: "via Parity (recommended)",
        key: "wss://rpc.polkadot.io",
      },
      {
        label: "via On-finality",
        key: "wss://polkadot.api.onfinality.io/public-ws",
      },
      {
        label: "via Dwellir",
        key: "wss://polkadot-rpc.dwellir.com",
      },
      {
        label: "via Pinknode",
        key: "wss://public-rpc.pinknode.io/polkadot",
      },
      {
        label: "via IBP-GeoDNS1",
        key: "wss://rpc.ibp.network/polkadot",
      },
      {
        label: "via IBP-GeoDNS2",
        key: "wss://rpc.dotters.network/polkadot",
      },
      {
        label: "via RadiumBlock",
        key: "wss://polkadot.public.curie.radiumblock.co/ws",
      },
      {
        label: "via LuckyFriday",
        key: "wss://rpc-polkadot.luckyfriday.io",
      },
    ],
  },
  [network.KUSAMA]: {
    blockTime: 6000,
    category: "kusama",
    chainId: 0,
    parachain: "1000",
    palletInstance: "50",
    rpcEndpoint: "wss://kusama-rpc.polkadot.io",
    ss58Format: 2,
    tokenDecimals: 12,
    tokenSymbol: tokenSymbol.KSM,
    externalLinks: "https://kusama.api.subscan.io",
    rpcEndpoints: [
      {
        label: "via On-finality",
        key: "wss://kusama.api.onfinality.io/public-ws",
      },
      {
        label: "via Dwellir",
        key: "wss://kusama-rpc.dwellir.com",
      },
      {
        label: "via Parity",
        key: "wss://kusama-rpc.polkadot.io",
      },
      {
        label: "via IBP-GeoDNS1",
        key: "wss://rpc.ibp.network/kusama",
      },
      {
        label: "via IBP-GeoDNS2",
        key: "wss://rpc.dotters.network/kusama",
      },
      {
        label: "via RadiumBlock",
        key: "wss://kusama.public.curie.radiumblock.co/ws",
      },
      {
        label: "via LuckyFriday",
        key: "wss://rpc-kusama.luckyfriday.io",
      },
    ],
  },
};

export const chainLinks = {
  [network.POLKADOT]: {
    blockExplorer: "https://polkadot.api.subscan.io/",
    discord: "https://discord.gg/polkadot",
    github: "https://github.com/paritytech/polkadot",
    homepage: "https://polkadot.network/",
    reddit: "https://www.reddit.com/r/polkadot",
    telegram: "https://t.me/PolkadotOfficial",
    twitter: "https://twitter.com/Polkadot",
    youtube: "https://www.youtube.com/channel/UCB7PbjuZLEba_znc7mEGNgw",
  },
  [network.KUSAMA]: {
    blockExplorer: "https://kusama.api.subscan.io/",
    discord: "https://discord.gg/9AWjTf8wSk",
    github: "https://github.com/paritytech/polkadot",
    homepage: "https://kusama.network/",
    reddit: "https://www.reddit.com/r/Kusama/",
    telegram: "https://t.me/kusamanetworkofficial",
    twitter: "https://twitter.com/kusamanetwork",
    youtube: "https://www.youtube.com/channel/UCq4MRrQhdoIR0b44GxcCPxw",
  },
};
