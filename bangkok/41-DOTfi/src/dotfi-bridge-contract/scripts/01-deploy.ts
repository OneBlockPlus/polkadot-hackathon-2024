import { ethers } from "hardhat";
import { ContractFactory } from "ethers";
import * as dotenv from "dotenv";
dotenv.config();

async function main() {
    const ChainIdentityFactory: ContractFactory = await ethers.getContractFactory("BridgeFactory");
    const adminAccount = process.env.ADMIN_ACCOUNT;
    const chainIdentity = await ChainIdentityFactory.deploy( adminAccount , {
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
