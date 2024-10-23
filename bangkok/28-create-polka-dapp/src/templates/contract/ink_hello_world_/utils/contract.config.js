export default {
  networks: {
    local: {
      url: "ws://127.0.0.1:9944",
    },
    rococoContracts: {
      url: "wss://rococo-contracts-rpc.polkadot.io",
    },
    shibuya: {
      url: "wss://shibuya-rpc.dwellir.com",
    },
    westend: {
      url: "wss://westend-rpc.polkadot.io",
      storageDepositLimit: null,
    },
    paseoPeople: {
      url: "wss://people-paseo.rpc.amforc.com",
    },
  },
  defaultNetwork: "local",
};
