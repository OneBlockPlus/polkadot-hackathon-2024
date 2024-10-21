import { ApiPromise, WsProvider, Keyring } from "@polkadot/api";
import { CodePromise } from "@polkadot/api-contract";
import fs from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import config from "./contract.config.js";

dotenv.config();

const deploy = async (networkName, contractName, initArgs = []) => {
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
  const contractWasmPath = path.join(
    process.cwd(),
    "target",
    "ink",
    `${contractName}.wasm`
  );

  if (
    !fs.existsSync(contractMetadataPath) ||
    !fs.existsSync(contractWasmPath)
  ) {
    console.error(`Error: Contract files for '${contractName}' not found.`);
    console.error(
      "Make sure you've built the contract using 'cargo contract build --release'"
    );
    console.error("or check if the contract name is correct.");
    process.exit(1);
  }

  const metadataRaw = await fs.promises.readFile(contractMetadataPath, "utf8");
  const contractMetadata = JSON.parse(metadataRaw);

  const contractConstructor = contractMetadata.spec.constructors[0];
  const expectedArgs = contractConstructor.args;

  if (initArgs.length !== expectedArgs.length) {
    console.error(
      `Error: Expected ${expectedArgs.length} constructor arguments, but received ${initArgs.length}.`
    );
    console.error("Expected arguments:");
    expectedArgs.forEach((arg, index) => {
      console.error(
        `  ${index + 1}. ${arg.name} (${arg.type.displayName || arg.type.type})`
      );
    });
    process.exit(1);
  }

  const contractWasm = fs.readFileSync(path.join(contractWasmPath));

  const code = new CodePromise(api, contractMetadata, contractWasm);

  // maximum gas to be consumed for the instantiation. if limit is too small the instantiation will fail.
  const gasLimit = api.registry.createType("WeightV2", {
    refTime: 100000n * 1000000n,
    proofSize: 100000n * 1000000n,
  });

  const storageDepositLimit = network.storageDepositLimit
    ? BigInt(network.storageDepositLimit)
    : null;

  const tx = code.tx.new({ gasLimit, storageDepositLimit }, initArgs[0]);

  const unsub = await tx.signAndSend(deployer, async ({ contract, status }) => {
    if (status.isInBlock) {
      console.log("In block");
    }
    if (status.isFinalized) {
      console.log("Finalized");
      console.log(
        `Network: ${networkName} \nContract: ${contractName} \nDeployed at: ${contract.address.toString()}`
      );
      unsub();
      console.log("Deployment completed successfully.");
      process.exit(0);
    }
  });
};

const networkArg = process.argv[2]?.replace("--network=", "");
const contractArg = process.argv[3]?.replace("--contract=", "");

const initArgs = process.argv.slice(4).map((arg) => {
  if (arg.startsWith("--")) {
    const [, value] = arg.slice(2).split("=");
    return value;
  }
  return arg;
});

deploy(networkArg, contractArg, initArgs);
