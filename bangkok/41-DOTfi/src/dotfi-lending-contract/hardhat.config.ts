import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const { PRIVATE_KEY, RPC_URL } = process.env;

const config: HardhatUserConfig = {
  //defaultNetwork: 'dotfi',
  solidity: "0.8.27",
  // networks: {
  //   dotfi: {
  //     url: RPC_URL,
  //     accounts: [`0x${PRIVATE_KEY}`]
  //   }
  // }
};

export default config;
