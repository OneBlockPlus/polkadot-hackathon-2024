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
const scanFromLatest = process.env.SCAN_FROM_LATEST ?? "1"
const saveValidator = process.env.SAVE_VALIDATOR ?? "true"

const env = {
  "NODE_ENV": "production",
  "LOG_LEVEL": "info",
  "WS_ENDPOINT": subWsRpcEndpoint,
  "MONGO_URL": mongoConnectionString,
  "MONGO_DB_NAME": "statescan-meta",
  "CHAIN": chain,
  "SCAN_STEP": scanStep,
  "SCAN_FROM_LATEST": scanFromLatest,
  "SAVE_VALIDATOR": saveValidator,
}

module.exports = {
  apps : [
    {
      name: "blockmeta",
      script: "./src/index.js",
      watch: false,
      env
    },
  ],
};
