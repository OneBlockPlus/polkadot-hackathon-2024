const mongoConnectionString = String(process.env.MONGO_CONNECTION_STRING ?? "")
const subWsRpcEndpoint = String(process.env.SUB_WS_RPC_ENDPOINT ?? "")
const chain = String(process.env.SUB_CHAIN_NAME ?? "")

if (mongoConnectionString === "") {
  throw new Error("ENV `MONGO_CONNECTION_STRING` must provide!")
}
if (subWsRpcEndpoint === "") {
  throw new Error("ENV `SUB_WS_RPC_ENDPOINT` must provide!")
}
if (chain === "") {
  throw new Error("ENV `SUB_CHAIN_NAME` must provide!")
}

const scanStep = process.env.SCAN_STEP ?? "100"
const useMeta = process.env.USE_META ?? "0"

const env = {
  "NODE_ENV": "production",
  "LOG_LEVEL": "info",
  "SCAN_STEP": scanStep,
  "WS_ENDPOINT": subWsRpcEndpoint,
  "CHAIN": chain,
  "FOLLOW_BLOCK_SCAN": "true",
  "USE_META": useMeta,
  "MONGO_META_URL": mongoConnectionString,
  "MONGO_DB_META_NAME": "statescan-meta",
  "MONGO_ACCOUNT_SCAN_URL": mongoConnectionString,
  "MONGO_ACCOUNT_SCAN_NAME": "statescan-account",
  "MONGO_ASSET_SCAN_URL": mongoConnectionString,
  "MONGO_ASSET_SCAN_NAME": "statescan-asset",
  "MONGO_BLOCK_SCAN_URL": mongoConnectionString,
  "MONGO_BLOCK_SCAN_NAME": "statescan-block",
  "MONGO_RUNTIME_SCAN_URL": mongoConnectionString,
  "MONGO_RUNTIME_SCAN_NAME": "statescan-runtime",
}

module.exports = {
  apps : [
    {
      name: "account-scan",
      script: "./backend/packages/account-scan/src/index.js",
      watch: false,
      env
    },
    {
      name: "asset-scan",
      script: "./backend/packages/asset-scan/src/index.js",
      watch: false,
      env
    },
    {
      name: "block-scan",
      script: "./backend/packages/block-scan/src/index.js",
      watch: false,
      env
    },
    {
      name: "runtime-scan",
      script: "./backend/packages/runtime-scan/src/index.js",
      watch: false,
      env
    },
    {
      name: "server",
      script: "./backend/packages/server/src/index.js",
      watch: false,
      env: {
        ...env,
        "ACHAINABLE_PROFILE_URL": "",
        "ACHAINABLE_AUTHORIZATION_KEY": "",
        "PORT": "5010",
      }
    },
  ],
};
