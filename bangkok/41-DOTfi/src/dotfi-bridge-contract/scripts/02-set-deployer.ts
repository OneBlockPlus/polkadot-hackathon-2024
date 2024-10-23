import { ethers } from "ethers";
import * as dotenv from "dotenv";
import BridgeFactoryAbi from "../artifacts/contracts/BridgeFactory.sol/BridgeFactory.json"; 

dotenv.config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  const adminAddress = process.env.ADMIN_ACCOUNT;
  const contractAddress = process.env.CONTRACT_ADDRESS;
  const rpcUrl = process.env.RPC_URL;

  if (!privateKey || !adminAddress || !contractAddress || !rpcUrl) {
    throw new Error("Missing environment variables");
  }
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const bridgeFactory = new ethers.Contract(contractAddress, BridgeFactoryAbi.abi, wallet);

  try {
    console.log("Setting contract deployer role for admin:", adminAddress);
    const tx = await bridgeFactory.setContractDeployer(adminAddress);
    console.log("Transaction sent, waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("Transaction confirmed, receipt:", receipt);
    console.log("Contract deployer role set successfully.");
  } catch (error) {
    console.error("Error setting contract deployer:", error);
  }
}

main().catch((error) => {
  console.error("Error in script execution:", error);
  process.exit(1);
});
