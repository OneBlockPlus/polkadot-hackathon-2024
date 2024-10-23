import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox';
import 'hardhat-contract-sizer';
import '@openzeppelin/hardhat-upgrades';

/** @type import('hardhat/config').HardhatUserConfig */
const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
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
  contractSizer: {
    runOnCompile: false,
  }
};

export default config;
