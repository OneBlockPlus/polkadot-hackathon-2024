import { ethers } from "ethers";
import * as dotenv from "dotenv";
import BridgeFactoryAbi from "../artifacts/contracts/BridgeFactory.sol/BridgeFactory.json"; // Assuming the ABI is in this location

dotenv.config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY;
  const contractAddress = process.env.CONTRACT_ADDRESS; 
  const dbtcTokenAddress = process.env.TOKEN_ADDRESS;
  const authorizedAddress = process.env.AUTHORIZED_ADDRESS;
  const rpcUrl = process.env.RPC_URL;

  if (!privateKey || !contractAddress || !dbtcTokenAddress || !authorizedAddress || !rpcUrl) {
    throw new Error("Missing environment variables");
  }
  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const bridgeFactory = new ethers.Contract(contractAddress, BridgeFactoryAbi.abi, wallet);

  try {
    console.log(`Authorizing ${authorizedAddress} to transfer dBTC token...`);

    const tx = await bridgeFactory.authorizeAddress(dbtcTokenAddress, authorizedAddress, true);
    console.log("Transaction sent, waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("Transaction confirmed, receipt:", receipt);
    console.log(`Address ${authorizedAddress} is now authorized to transfer the dBTC token.`);
  } catch (error) {
    console.error("Error authorizing address:", error);
  }
}

main().catch((error) => {
  console.error("Error in script execution:", error);
  process.exit(1);
});
