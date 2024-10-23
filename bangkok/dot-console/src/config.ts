import {
  hydration,
  kusama,
  kusama_asset_hub,
  kusama_people,
  paseo,
  polkadot,
  polkadot_asset_hub,
  polkadot_collectives,
  polkadot_people,
  tinkernet,
  westend,
  westend_asset_hub,
  westend_collectives,
  westend_people,
} from "@polkadot-api/descriptors";
import { defineConfig } from "@reactive-dot/core";
import { InjectedWalletAggregator } from "@reactive-dot/core/wallets.js";
import { LedgerWallet } from "@reactive-dot/wallet-ledger";
import { WalletConnect } from "@reactive-dot/wallet-walletconnect";
import { withPolkadotSdkCompat } from "polkadot-api/polkadot-sdk-compat";
import { getSmProvider } from "polkadot-api/sm-provider";
import { startFromWorker } from "polkadot-api/smoldot/from-worker";
import { getWsProvider } from "polkadot-api/ws-provider/web";

const smoldot = startFromWorker(
  new Worker(new URL("polkadot-api/smoldot/worker", import.meta.url), {
    type: "module",
  }),
);

export const config = defineConfig({
  chains: {
    polkadot: {
      descriptor: polkadot,
      provider: () => getWsProvider("wss://polkadot-rpc.publicnode.com"),
    },
    polkadot_asset_hub: {
      descriptor: polkadot_asset_hub,
      provider: () => getWsProvider("wss://polkadot-asset-hub-rpc.polkadot.io"),
    },
    polkadot_collectives: {
      descriptor: polkadot_collectives,
      provider: () =>
        getWsProvider("wss://polkadot-collectives-rpc.polkadot.io"),
    },
    polkadot_people: {
      descriptor: polkadot_people,
      provider: () => getWsProvider("wss://polkadot-people-rpc.polkadot.io"),
    },
    hydration: {
      descriptor: hydration,
      provider: () =>
        withPolkadotSdkCompat(getWsProvider("wss://rpc.hydradx.cloud")),
    },
    kusama: {
      descriptor: kusama,
      provider: () => getWsProvider("wss://kusama-rpc.publicnode.com"),
    },
    kusama_asset_hub: {
      descriptor: kusama_asset_hub,
      provider: () => getWsProvider("wss://kusama-asset-hub-rpc.polkadot.io"),
    },
    kusama_people: {
      descriptor: kusama_people,
      provider: () => getWsProvider("wss://kusama-people-rpc.polkadot.io"),
    },
    tinkernet: {
      descriptor: tinkernet,
      provider: () =>
        withPolkadotSdkCompat(getWsProvider("wss://tinkernet-rpc.dwellir.com")),
    },
    paseo: {
      descriptor: paseo,
      // TODO: paseo node still hasn't been updated, hence still need to use Smoldot
      provider: getSmProvider(
        import("polkadot-api/chains/paseo").then(({ chainSpec }) =>
          smoldot.addChain({ chainSpec }),
        ),
      ),
    },
    westend: {
      descriptor: westend,
      provider: () => getWsProvider("wss://westend-rpc.polkadot.io"),
    },
    westend_asset_hub: {
      descriptor: westend_asset_hub,
      provider: () => getWsProvider("wss://westend-asset-hub-rpc.polkadot.io"),
    },
    westend_people: {
      descriptor: westend_people,
      provider: () => getWsProvider("wss://westend-people-rpc.polkadot.io"),
    },
    westend_collectives: {
      descriptor: westend_collectives,
      provider: () =>
        getWsProvider("wss://westend-collectives-rpc.polkadot.io"),
    },
  },
  wallets: [
    new InjectedWalletAggregator(),
    new LedgerWallet(),
    new WalletConnect({
      projectId: import.meta.env.VITE_APP_WALLET_CONNECT_PROJECT_ID,
      providerOptions: {
        metadata: {
          name: "ĐÓTConsole",
          description: "Substrate development console.",
          url: globalThis.origin,
          icons: ["/logo.png"],
        },
      },
      chainIds: [
        "polkadot:91b171bb158e2d3848fa23a9f1c25182", // Polkadot
      ],
      optionalChainIds: [
        "polkadot:91b171bb158e2d3848fa23a9f1c25182", // Polkadot
        "polkadot:b0a8d493285c2df73290dfb7e61f870f", // Kusama
        "polkadot:77afd6190f1554ad45fd0d31aee62aac", // Paseo
        "polkadot:e143f23803ac50e8f6f8e62695d1ce9e", // Westend
      ],
    }),
  ],
});
