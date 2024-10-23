import { ethers } from "ethers";
import * as dotenv from "dotenv";
import BridgeFactoryAbi from "../artifacts/contracts/BridgeFactory.sol/BridgeFactory.json"; // Assuming the ABI is in this location

dotenv.config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY as string;
  const contractAddress = process.env.CONTRACT_ADDRESS as string;
  const dbtcTokenAddress = process.env.TOKEN_ADDRESS as string;
  const destinationAddress = process.env.DESTINATION_ADDRESS as string; 
  const rpcUrl = process.env.RPC_URL as string;

  if (!privateKey || !contractAddress || !dbtcTokenAddress || !destinationAddress || !rpcUrl) {
    throw new Error("Missing environment variables");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const bridgeFactory = new ethers.Contract(contractAddress, BridgeFactoryAbi.abi, wallet);

  try {
    console.log(`Transferring 10 dBTC tokens to ${destinationAddress}...`);

    const tx = await bridgeFactory.transferTokenFromBridge(dbtcTokenAddress, destinationAddress, ethers.parseUnits("10", 18));
    console.log("Transaction sent, waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("Transaction confirmed, receipt:", receipt);
    console.log(`Transferred 10 dBTC tokens to ${destinationAddress}.`);
  } catch (error) {
    console.error("Error transferring tokens:", error);
  }
}

main().catch((error) => {
  console.error("Error in script execution:", error);
  process.exit(1);
});
