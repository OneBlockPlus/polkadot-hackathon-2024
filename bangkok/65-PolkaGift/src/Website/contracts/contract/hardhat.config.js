const config = require('../../services/json/config.json')
const dotenv =require( 'dotenv');
require( '@nomiclabs/hardhat-waffle');
require( '@nomiclabs/hardhat-ethers');
require( 'hardhat-deploy');
require("@nomiclabs/hardhat-etherscan");

dotenv.config();

module.exports = {
	//Specifing Moonbeam network for smart contract deploying
	networks: {
		moonbeam: {
			url: config.jsonRPC,
			accounts: [config.defaultPrivateKey],
			chainId: 1287,
			gasLimit: 100_000_000
		},
	},
	//Specifing Solidity compiler version
	solidity: {
		compilers: [
			{
				version: '0.8.17',
			},
		],
	},
	//Specifing Account to choose for deploying
	namedAccounts: {
		deployer: 0,
	}
};