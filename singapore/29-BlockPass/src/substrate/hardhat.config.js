require('@nomicfoundation/hardhat-toolbox');
require('@nomicfoundation/hardhat-ignition-ethers');

const privateKey = process.env.PRIVATE_KEY;
const moonscanAPIKey = process.env.MOONSCAN_API_KEY;

module.exports = {
  solidity: '0.8.24',
  networks: {
    moonbase: {
      url: 'https://rpc.api.moonbase.moonbeam.network',
      chainId: 1287, // 0x507 in hex
      accounts: [privateKey],
    },
    dev: {
      url: 'http://127.0.0.1:9944',
      chainId: 1281, // 0x501 in hex
      accounts: [
        '0x5fb92d6e98884f76de468fa3f6278f8807c48bebc13595d45af5bdc4da702133', // Alice's PK
        '0x8075991ce870b93a8870eca0c0f91913d12f47948ca0fd25b49c6fa7cdbeee8b', // Bob's PK
      ],
    },
    moonbeam: {
      url: 'https://rpc.api.moonbeam.network', // Or insert your own RPC URL here
      chainId: 1284, // 0x504 in hex
      accounts: [privateKey],
    },
  },
  etherscan: {
    apiKey: {
      moonbaseAlpha: moonscanAPIKey, // Moonbase Moonscan API Key
      moonbeam: moonscanAPIKey, // Moonbeam Moonscan API Key
    },
  },
};