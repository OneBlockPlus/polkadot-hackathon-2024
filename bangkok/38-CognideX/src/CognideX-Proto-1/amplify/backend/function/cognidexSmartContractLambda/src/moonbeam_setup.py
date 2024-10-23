from web3 import Web3
import json
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Contract Addresses
# DecentralizedDataMarketplace: 0x7aE15C79b2c9dbb5cF779280ABf89301b582dB77
# CGDXToken: 0xb75ad8E35c0a031817bAb43ffD4816657B2F4001

def setup():
    try:
        # Set up the connection to Moonbase Alpha
        rpc_url = "https://rpc.api.moonbase.moonbeam.network"
        web3 = Web3(Web3.HTTPProvider(rpc_url))

        # Check if the connection is successful
        if web3.is_connected():
            print("Connected to Moonbase Alpha")
        else:
            raise ConnectionError("Failed to connect to Moonbase Alpha")

        # Set the contract address
        contract_address = "0x7aE15C79b2c9dbb5cF779280ABf89301b582dB77"

        # Load the ABI from the JSON file
        with open("abi/DecentralizedDataMarketplace.json") as f:
            token_abi = json.load(f)['abi']

        # Initialize the contract
        contract = web3.eth.contract(address=contract_address, abi=token_abi)

        # Retrieve the private key from the environment variables
        private_key = os.getenv("PRIVATE_KEY")
        if not private_key:
            raise ValueError("PRIVATE_KEY not found in environment variables")

        # Get the account address from the private key
        account_address = web3.eth.account.from_key(private_key).address
        
        # Check owner in the contract
        owner_address = contract.functions.owner().call()
        print(f"Contract Owner: {owner_address}")

        # Return the setup data
        return {
            "web3": web3,
            "contract": contract,
            "private_key": private_key,
            "account_address": account_address,
        }

    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading ABI file: {e}")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
    
    
def setup_token():
    try:
        # Set up the connection to Moonbase Alpha
        rpc_url = "https://rpc.api.moonbase.moonbeam.network"
        web3 = Web3(Web3.HTTPProvider(rpc_url))

        # Check if the connection is successful
        if web3.is_connected():
            print("Connected to Moonbase Alpha")
        else:
            raise ConnectionError("Failed to connect to Moonbase Alpha")

        # Set the contract address
        contract_address = "0xb75ad8E35c0a031817bAb43ffD4816657B2F4001"
        
        # Load the ABI from the JSON file
        with open("abi/CGDXToken.json") as f:
            token_abi = json.load(f)['abi']

        # Initialize the contract
        contract = web3.eth.contract(address=contract_address, abi=token_abi)
        
        # Retrieve the private key from the environment variables
        private_key = os.getenv("PRIVATE_KEY")
        if not private_key:
            raise ValueError("PRIVATE_KEY not found in environment variables")

        # Get the account address from the private key
        account_address = web3.eth.account.from_key(private_key).address
        
        # Return the setup data
        return {
            "web3": web3,
            "contract": contract,
            "private_key": private_key,
            "account_address": account_address,
            }

    except (FileNotFoundError, json.JSONDecodeError) as e:
        print(f"Error loading ABI file: {e}")
        return None
    except Exception as e:
        print(f"An error occurred: {e}")
        return None
