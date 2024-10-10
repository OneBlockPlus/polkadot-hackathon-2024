import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
//import "@nomiclabs/hardhat-etherscan";

import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    // for Arbitrum Sepolia testnet
    "arbitrum-sepolia": {
      url: process.env.ARB_RPC_URL!,
      accounts: [process.env.ACCOUNT_PRIVATE_KEY!],
      gasPrice: 1000000000,
    },
  },
  etherscan: {
    apiKey: {
      "arbitrum-sepolia": process.env.ARBISCAN_API_KEY!,
    },
    customChains: [
      {
        network: "arbitrum-sepolia",
        chainId: 4202,
        urls: {
          apiURL: "https://api-testnet.arbiscan.io/api",
          browserURL: "https://testnet.arbiscan.io",
        },
      },
    ],
  },
};

export default config;