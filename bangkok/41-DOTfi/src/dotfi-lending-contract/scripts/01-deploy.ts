import { ethers } from "hardhat";
import { ContractFactory } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    const ChainIdentityFactory: ContractFactory = await ethers.getContractFactory("Lending");
    const btcToken = process.env.BTC_TOKEN;
    const usdtToken = process.env.USDT_TOKEN;
    const liquidator = process.env.LIQUIDATOR_ACCOUNT;
    const chainIdentity = await ChainIdentityFactory.deploy( btcToken, usdtToken, liquidator  , {
        gasLimit: 0x1000000
    });
    const contractAddress = await chainIdentity.getAddress();
    console.log("Contract deployed to:", contractAddress);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
