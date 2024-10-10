import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
require("dotenv").config();
const config: HardhatUserConfig = {
  solidity: "0.8.27",
  networks: {
    moonbase: {
      url: "https://rpc.api.moonbase.moonbeam.network",
      chainId: 1287,
      accounts: [process.env.PRIVATE_KEY || ""],
    },
  },
};

export default config;
