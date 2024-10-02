from web3 import Web3

def sercet(address):
    w3 = Web3()

    checksummed_address = w3.to_checksum_address(address)
    first_hash = Web3.solidity_keccak(['address'], [checksummed_address])
    second_hash = Web3.keccak(first_hash)
    return first_hash, second_hash

# Simulate the calculation of the "password" in the transaction
# Because the data in the blockchain is open and transparent
# So the password is used to query the connection status after connecting to the wallet on the front end
# If the connection is successful, fill in _preimage and hashLock in the call v222
address = '0x5B38Da6a701c568545dCfcB03FcB875f56beddC4'
first_hash, second_hash = sercet(address)
print(f"Address: {address}")
print(f"_preimage: {first_hash.hex()}")
print(f"_hashLock: {second_hash.hex()}")
