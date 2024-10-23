/** @type import('hardhat/config').HardhatUserConfig */
import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-foundry";
import { HardhatUserConfig } from 'hardhat/config';
import '@openzeppelin/hardhat-upgrades';

/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.26',
    settings: {
      viaIR: true,
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        '*': {
          '*': ['storageLayout'],
        },
      },
    },
  },
  networks: {
    local: {
      url: 'http://127.0.0.1:8545'
    },
    live: {
      url: 'https://koi-rpc.darwinia.network',
      accounts: ["0x4f2e19d24a9ce589f460ed0f96a65ee5fe2cc6be31226e0dfa02df2dfa5b4efb"]
    }
  },
};

export default config;
