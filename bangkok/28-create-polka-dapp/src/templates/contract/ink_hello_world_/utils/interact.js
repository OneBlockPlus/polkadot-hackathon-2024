import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { ContractPromise } from "@polkadot/api-contract";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import config from "./contract.config.js";

dotenv.config();

export const interact = async (
  networkName,
  contractName,
  contractAddress,
  functionName,
  ...args
) => {
  if (!networkName) {
    console.error(
      "Error: Network name is required. Use --network=<network_name>"
    );
    process.exit(1);
  }

  if (!contractName) {
    console.error(
      "Error: Contract name is required. Use --contract=<contract_name>"
    );
    process.exit(1);
  }

  const network =
    config.networks[networkName] || config.networks[config.defaultNetwork];

  if (!network) {
    console.error(
      `Error: Network '${networkName}' not found in contract.config.js`
    );
    process.exit(1);
  }

  const provider = new WsProvider(network.url);
  const api = await ApiPromise.create({ provider });

  const keyring = new Keyring({
    type: "sr25519",
    ss58Format: api.runtimeChain.registry.chainSS58,
  });
  const deployer = keyring.addFromUri(process.env.DEPLOYER_SEED_PHRASE, {
    name: "deployer",
  });

  const contractMetadataPath = path.join(
    process.cwd(),
    "target",
    "ink",
    `${contractName}.json`
  );

  if (!fs.existsSync(contractMetadataPath)) {
    console.error(`Error: Contract files for '${contractName}' not found.`);
    console.error(
      "Make sure you've built the contract using 'cargo contract build --release'"
    );
    console.error("or check if the contract name is correct.");
    process.exit(1);
  }

  const metadataRaw = await fs.promises.readFile(contractMetadataPath, "utf8");
  const contractMetadata = JSON.parse(metadataRaw);

  const contract = new ContractPromise(api, contractMetadata, contractAddress);

  // Call the function
  if (contract.query[functionName]) {
    // Read-only function
    const { result, output } = await contract.query[functionName](
      deployer.address,
      {},
      ...args
    );
    console.log(output);
    console.log(`Result: ${output?.toHuman() || output}`);
    process.exit(0);
  } else if (contract.tx[functionName]) {
    // State-changing function
    const tx = await contract.tx[functionName]({}, ...args);
    await tx.signAndSend(deployer, (result) => {
      if (result.status.isInBlock || result.status.isFinalized) {
        console.log(`Transaction included in block ${result.status.asInBlock}`);
      }
    });
    process.exit(0);
  } else {
    console.error(`Function ${functionName} not found on contract`);
    process.exit(1);
  }
};

// Parse command line arguments
const networkName = process.argv[2]?.replace("--network=", "");
const contractName = process.argv[3]?.replace("--contract=", "");
const contractAddress = process.argv[4]?.replace("--address=", "");
const functionName = process.argv[5]?.replace("--function=", "");
const functionArgs = process.argv.slice(6).map((arg) => {
  if (arg.startsWith("--")) {
    const [, value] = arg.slice(2).split("=");
    return value;
  }
  return arg;
});

interact(
  networkName,
  contractName,
  contractAddress,
  functionName,
  ...functionArgs
);
