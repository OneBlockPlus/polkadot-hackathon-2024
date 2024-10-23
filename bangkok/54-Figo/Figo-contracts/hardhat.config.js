/** @type import('hardhat/config').HardhatUserConfig */
require('dotenv').config();
require('@nomiclabs/hardhat-ethers');

module.exports = {
    solidity: {
        version: '0.8.24',
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
        },
    },
    defaultNetwork: 'moonbase',
    networks: {
        moonbase: {
            url: 'https://rpc.api.moonbase.moonbeam.network', // MoonBase RPC URL
            chainId: 1287,
            accounts: [`0x${process.env.PRIVATE_KEY}`], // Private key for deploying (use environment variables)
        },
    },
};
