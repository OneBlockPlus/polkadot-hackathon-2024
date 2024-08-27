from brownie import project, accounts, network, config
from web3 import Web3
import json
import os

def compile_contract(sol_file_name):
    # Load the contract source code from the file
    if not os.path.isfile(sol_file_name):
        print(f"File {sol_file_name} does not exist.")
        return None, None

    with open(sol_file_name, 'r') as file:
        contract_source_code = file.read()

    # Initialize the brownie project
    project.load('./brownie')

    # Compile the contract
    compiled_contracts = project.compile_source(contract_source_code)

    # Extract the contract ABI and bytecode
    contract_interface = None
    for key in compiled_contracts.keys():
        contract_interface = compiled_contracts[key]
        break

    if contract_interface is None:
        print("No contracts compiled.")
        return None, None

    # Get ABI and Bytecode from the first contract in the file
    abi = contract_interface.abi
    bytecode = contract_interface.bytecode
    return abi, bytecode

def deploy_contract(w3, private_key, abi, bytecode, address_param):
    account = w3.eth.account.from_key(private_key)
    contract = w3.eth.contract(abi=abi, bytecode=bytecode)

    # Build the transaction with constructor parameter
    transaction = contract.constructor(address_param).build_transaction({
        'from': account.address,
        'nonce': w3.eth.get_transaction_count(account.address),
        'gas': 6721975,
        'gasPrice': w3.to_wei('20', 'gwei')
    })

    # Sign the transaction
    signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)

    # Send the transaction
    tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)

    # Wait for the transaction receipt
    tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    return tx_receipt.contractAddress

def add_parallel_contracts(w3, private_key, abi, contracts_info, contract_address_current):
    account = w3.eth.account.from_key(private_key)
    for rpc_url, contract_address in contracts_info:
        if contract_address == contract_address_current:
            continue
        
        try:
            # Create a contract instance
            contract = w3.eth.contract(address=contract_address_current, abi=abi)
            
            # Build the transaction to call addNewParallelContract
            transaction = contract.functions.addNewParallelContract(contract_address, rpc_url).build_transaction({
                'from': account.address,
                'nonce': w3.eth.get_transaction_count(account.address),
                'gas': 6721975,
                'gasPrice': w3.to_wei('20', 'gwei')
            })

            # Sign the transaction
            signed_txn = w3.eth.account.sign_transaction(transaction, private_key=private_key)

            # Send the transaction
            tx_hash = w3.eth.send_raw_transaction(signed_txn.rawTransaction)

            # Wait for the transaction receipt
            tx_receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
            print(f"Successfully called addNewParallelContract on {contract_address} with RPC URL {rpc_url}")

        except Exception as e:
            print(f"Error calling addNewParallelContract on {contract_address} with RPC URL {rpc_url}: {e}")


def main():
    # Get the Solidity file name from user
    sol_file_name = input("Enter the Solidity file name: ").strip()

    # Get RPC URLs from user
    rpc_url_input = input("Enter RPC URLs separated by commas: ")
    rpc_urls = [url.strip() for url in rpc_url_input.split(",")]

    # Get corresponding bridge addresses from user
    bridge_addresses = []
    for i in range(len(rpc_urls)):
        address = input(f"Enter the bridge address for RPC URL {rpc_urls[i]}: ").strip()
        bridge_addresses.append(address)

    # Get the private key from the user
    private_key = input("Enter your private key: ").strip()

    # Compile the contract
    abi, bytecode = compile_contract(sol_file_name)
    if not abi or not bytecode:
        print("Failed to compile the contract.")
        return

    # Deploy the contract on each RPC URL with corresponding bridge address
    deployed_contract_addresses = {}
    for rpc_url, bridge_address in zip(rpc_urls, bridge_addresses):
        w3 = Web3(Web3.HTTPProvider(rpc_url.strip()))
        if w3.is_connected():
            print(f"Connected to {rpc_url}")
            contract_address = deploy_contract(w3, private_key, abi, bytecode, bridge_address)
            deployed_contract_addresses[rpc_url] = contract_address
            print(f"Contract deployed at {contract_address} on {rpc_url}")
        else:
            print(f"Failed to connect to {rpc_url}")

    # Save deployed contract addresses to a file
    with open("deployed_contracts.json", "w") as f:
        json.dump(deployed_contract_addresses, f, indent=4)
    print("Deployed contract addresses saved to deployed_contracts.json")

    # Prepare contracts info for calling addNewParallelContract
    contracts_info = list(deployed_contract_addresses.items())

    # Call addNewParallelContract for each contract
    for rpc_url, contract_address in contracts_info:
        w3 = Web3(Web3.HTTPProvider(rpc_url.strip()))
        if w3.is_connected():
            print(f"Calling addNewParallelContract for contract at {contract_address}")
            add_parallel_contracts(w3, private_key, abi, contracts_info, contract_address)
        else:
            print(f"Failed to connect to {rpc_url}")

if __name__ == "__main__":
    main()