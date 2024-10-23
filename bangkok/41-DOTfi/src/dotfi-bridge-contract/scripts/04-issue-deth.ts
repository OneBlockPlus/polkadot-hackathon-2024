import { ethers } from "ethers";
import * as dotenv from "dotenv";
import BridgeFactoryAbi from "../artifacts/contracts/BridgeFactory.sol/BridgeFactory.json"; // Assuming you have the ABI generated here

dotenv.config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY as string;
  const adminAddress = process.env.ADMIN_ACCOUNT as string;
  const contractAddress = process.env.CONTRACT_ADDRESS as string;
  const rpcUrl = process.env.RPC_URL as string;

  if (!privateKey || !adminAddress || !contractAddress || !rpcUrl) {
    throw new Error("Missing environment variables");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const bridgeFactory = new ethers.Contract(contractAddress, BridgeFactoryAbi.abi, wallet);

  const tokenName = "DOTfi Ethereum";
  const tokenSymbol = "dETH";
  const tokenDecimals = 18;
  const maxSupplyValue = 10000000000;
  const maxSupply = ethers.parseUnits(maxSupplyValue.toString(), tokenDecimals);

  try {
    console.log(`Issuing new token ${tokenName} with max supply of ${maxSupplyValue}`);
    const tx = await bridgeFactory.deployToken(tokenName, tokenSymbol, tokenDecimals, maxSupply);
    console.log("Transaction sent, waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("Transaction confirmed, receipt:", receipt);
  } catch (error) {
    console.error("Error issuing token:", error);
  }
}

main().catch((error) => {
  console.error("Error in script execution:", error);
  process.exit(1);
});
