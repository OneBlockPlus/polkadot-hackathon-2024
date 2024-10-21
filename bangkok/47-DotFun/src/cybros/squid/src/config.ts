import * as dotenv from "dotenv"
import {type DataSource} from '@subsquid/substrate-processor'

dotenv.config()

const config: {
  dataSource: DataSource
} = {
  dataSource: {
    archive: process.env.ARCHIVE_GATEWAY_ENDPOINT,
    chain: process.env.CHAIN_NODE_RPC_ENDPOINT || "http://localhost:9944",
  },
}

export default config
