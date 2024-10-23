import sha3  # pysha3 for keccak_256
from web3 import Web3

class MerkleTree:
    def __init__(self, data_list=None):
        self.data_list = data_list or []
        self.tree = []
        self.root = None
        if self.data_list:
            self.build_tree()

    def keccak256(self, data):
        """
        Hashes the data using Keccak256, returning bytes.
        """
        k = sha3.keccak_256()
        if isinstance(data, str):
            k.update(data.encode('utf-8'))
        elif isinstance(data, bytes):
            k.update(data)
        else:
            raise TypeError("Data must be bytes or string")
        return k.digest()  # Return raw bytes (0x-prefixed in hex format)

    def build_tree(self):
        """
        Builds the Merkle tree using Keccak256.
        """
        self.tree = []
        current_level = [self.keccak256(data) for data in self.data_list]
        self.tree.append(current_level)

        while len(current_level) > 1:
            next_level = []
            for i in range(0, len(current_level), 2):
                left = current_level[i]
                right = current_level[i + 1] if i + 1 < len(current_level) else left
                combined = left + right  # Concatenate bytes directly
                next_level.append(self.keccak256(combined))
            self.tree.append(next_level)
            current_level = next_level

        self.root = self.tree[-1][0]

    def get_root(self):
        """
        Returns the Merkle root as raw bytes.
        """
        return self.root

    def get_proof_as_bytes(self, index):
        """
        Returns the Merkle proof for a given leaf index in bytes.
        """
        proof = []
        for level in self.tree[:-1]:
            if index % 2 == 0 and index + 1 < len(level):
                sibling = level[index + 1]
            else:
                sibling = level[index - 1]
            proof.append(sibling)  # Store as raw bytes
            index //= 2
        return proof

    def verify_proof_as_bytes(self, leaf, proof, root, index):
        """
        Verifies the proof for compatibility with Solidity's verification logic.
        """
        computed_hash = leaf

        for sibling in proof:
            if index % 2 == 0:
                concatenated = computed_hash + sibling
            else:
                concatenated = sibling + computed_hash

            computed_hash = self.keccak256(concatenated)
            index //= 2

        return computed_hash == root

    def update_leaf(self, index, new_data):
        """
        Updates the leaf at the given index with new data and rebuilds the tree.
        """
        if index < 0 or index >= len(self.data_list):
            raise IndexError("Leaf index out of bounds")

        # Update the leaf in the data list with the hashed data
        self.data_list[index] = new_data

        # Rebuild the entire tree to reflect the change
        self.build_tree()
