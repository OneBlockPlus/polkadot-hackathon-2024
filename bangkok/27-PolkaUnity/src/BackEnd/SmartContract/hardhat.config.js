/** @type import('hardhat/config').HardhatUserConfig */
require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-web3");

const fs = require("fs");
const path = require('path')

const data = fs.readFileSync(path.resolve(__dirname, './keyring.json'), 'UTF-8').toString()
let config = JSON.parse(data)


module.exports = {
  solidity: "0.8.24",

  cessdev: {
    url: 'https://testnet-rpc.cess.cloud/ws/', // 输入您的RPC URL
    chainId: 11330, // (hex: 0x504),
    accounts: [config['private_key']],
  },
};
