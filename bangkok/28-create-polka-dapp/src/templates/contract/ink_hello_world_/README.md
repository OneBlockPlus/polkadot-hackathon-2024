# ink! Contract Deployment Guide with create-polka-dapp contract utils functionalities

This guide walks you through the process of building, deploying, and interacting with an ink! smart contract on a Substrate-based blockchain.

## Prerequisites

Before you begin, ensure you have the following installed:

1. Rust and Cargo (https://www.rust-lang.org/tools/install)
2. cargo-contract CLI (https://github.com/paritytech/cargo-contract)
3. substrate-contracts-node (https://github.com/paritytech/substrate-contracts-node)
4. Node.js and npm (https://nodejs.org/)

## Step 1: Install NPM Packages

1. Run `npm install` to get utility functionalities for contract processes like deployment and interaction.

## Step 2: Build the Contract

1. Navigate to your contract's directory.
2. Run the following command to build your contract:

   ```
   cargo contract build --release
   ```

   This will generate three files in the `target/ink` directory:

   - `your_contract.wasm`: The WebAssembly binary of your contract.
   - `your_contract.json`: The metadata file describing your contract's interface.
   - `your_contract.contract`: A combination of the above two files.

## Step 3: Start a Substrate Node (Optional)

1. Open a new terminal window.
2. Start the Substrate node:

   ```
   substrate-contracts-node --dev
   ```

   This will start a local Substrate node with the contracts pallet enabled.

## Step 4: Deploy the Contract

1. Ensure you have set up your environment variables:

   - Copy the `.env_example` file to `.env`
   - Replace `your_seed_phrase_here` with your actual deployer account's seed phrase

2. Open a terminal in your contract's directory.

3. Run the deployment script with the following command:

   ```
   npm run deploy -- --network=<network_name> --contract=<contract_name> [--arg1=<value1> --arg2=<value2> ...]
   ```

   Replace `<network_name>` with the desired network (e.g., local, rococo, shibuya) and `<contract_name>` with your contract's name.

   Optional: Add constructor arguments using `--argN=<valueN>` format.

   Example:

   ```
   npm run deploy -- --network=local --contract=ink_hello_world --arg1="Custom hello message"
   ```

4. The script will build the contract, deploy it to the specified network, and output the deployed contract's address.

5. Make sure to save the contract address for future interactions.

Note: Ensure your deployer account has sufficient funds for the deployment transaction.

## Step 5: Interact with the Contract

1. To interact with your deployed contract, use the following command:

   ```
   npm run interact -- --network=<network_name> --contract=<contract_name> --address=<contract_address> --function=<function_name> [--arg1=<value1> --arg2=<value2> ...]
   ```

   Replace the placeholders with your specific values.

2. For read-only functions (queries), use:

   ```
   npm run interact -- --network=local --contract=ink_hello_world --address=<contract_address> --function=get_message
   ```

3. For state-changing functions, use:

   ```
   npm run interact -- --network=local --contract=ink_hello_world --address=<contract_address> --function=set_message --arg1="New message"
   ```

You can also create Scripts using the utlity function `interact`

You can modify these scripts or create new ones based on your contract's functions.

To use these scripts in your own code:

1. Import the `interact` function:

   ```javascript
   import { interact } from "../utils/interact.js";
   ```

2. Call contract functions:
   ```javascript
   const result = await interact(
     "local",
     "ink_hello_world",
     CONTRACT_ADDRESS,
     "function_name",
     ...args
   );
   ```

Replace `"local"` with your desired network, `"ink_hello_world"` with your contract name, `CONTRACT_ADDRESS` with your deployed contract address, `"function_name"` with the function you want to call, and `...args` with any arguments the function requires.

## Additional Notes

- Always use the `--release` flag when building contracts for production to optimize the WASM output.
- Keep track of your contract's address after deployment for future interactions.
- Ensure you have enough funds in your account for deployment and interaction costs.

## Interacting with the Contract from the Frontend

To interact with this contract from your frontend:

1. After deploying your contract, you'll need to export the contract's ABI (Application Binary Interface).
2. In your frontend project, create a new file (e.g., `contractABI.json`) and paste the exported ABI into this file.
3. Import this ABI in your frontend code where you want to interact with the contract.
4. Use the ABI along with the contract's address to create a contract instance and call its functions.

Refer to the commented example in your frontend's `App.tsx` (or similar main component file) for a basic structure of how to interact with a contract.

Scaffolded with [CREATE-POLKA-DAPP](https://www.npmjs.com/package/create-polka-dapp)
