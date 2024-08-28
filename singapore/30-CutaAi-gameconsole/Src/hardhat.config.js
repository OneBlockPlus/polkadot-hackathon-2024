
require('@nomicfoundation/hardhat-ethers');
require('@nomiclabs/hardhat-etherscan');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.6.12",  // Add this for ^0.6.0 compatibility
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,  // Adjust this value as needed
          },
        },
      },
      {
        version: "0.6.0",  // Add this for >=0.6.0 <0.7.0 compatibility
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,  // Adjust this value as needed
          },
        }
      },
    ],

  },
  networks: {
    moonbase: {
      url: 'https://rpc.api.moonbase.moonbeam.network',
      chainId: 1287,
      accounts: ['KEY']
    }
  },
  etherscan: {
    apiKey: {
      moonbaseAlpha: "KEY"  // 根据需要替换为对应网络的 API 密钥
    }
  },
};