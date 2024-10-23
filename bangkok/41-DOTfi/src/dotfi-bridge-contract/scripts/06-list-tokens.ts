import { ethers } from "ethers";
import * as dotenv from "dotenv";
import BridgeFactoryAbi from "../artifacts/contracts/BridgeFactory.sol/BridgeFactory.json";
import ERC20Abi from "../artifacts/@openzeppelin/contracts/token/ERC20/ERC20.sol/ERC20.json";

dotenv.config();

async function main() {
  const privateKey = process.env.PRIVATE_KEY as string;
  const contractAddress = process.env.CONTRACT_ADDRESS as string;
  const rpcUrl = process.env.RPC_URL as string;

  if (!privateKey || !contractAddress || !rpcUrl) {
    throw new Error("Missing environment variables");
  }

  const provider = new ethers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);

  const bridgeFactory = new ethers.Contract(contractAddress, BridgeFactoryAbi.abi, wallet);

  try {
    console.log("Fetching number of deployed token contracts...");

    const tokenCount = await bridgeFactory.getDeployedTokens();

    if (tokenCount === 0) {
      console.log("No tokens deployed yet.");
    } else {
      console.log(`Total deployed tokens: ${tokenCount}`);
      console.log("Fetching token details...");

      for (let i = 0; i < tokenCount; i++) {
        const tokenAddress = await bridgeFactory.deployedTokens(i);
        const tokenContract = new ethers.Contract(tokenAddress, ERC20Abi.abi, wallet);
        const tokenName = await tokenContract.name();
        const tokenSymbol = await tokenContract.symbol();
        console.log(`${i + 1}. Token Address: ${tokenAddress}, Name: ${tokenName}, Symbol: ${tokenSymbol}`);
      }
    }
  } catch (error) {
    console.error("Error fetching deployed tokens:", error);
  }
}

main().catch((error) => {
  console.error("Error in script execution:", error);
  process.exit(1);
});
