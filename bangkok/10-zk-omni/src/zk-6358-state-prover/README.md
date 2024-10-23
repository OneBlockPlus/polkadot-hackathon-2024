# ZK-6358-State-Prover

## Note

In this implementation, we use the `UTXO` paradigm to describe the assets users own.  

We built the State-Prover based on Plonky2 to take advantage of Poseidon-Hash function, which is a ZK-friendly hash function. As the SMTs(Sparse Merkle Tree) is used to record the global state modified by transactions, and a spending and creation of a UTXO are related to a leaf modification respectively, which bringsa 256 times hashing calculation. So this brings a great performance improvement.  

Finally, State-Proof will be recursively aggregated with [Signature-Proof]() into a [final proof](../zk-6358-final-prover/) based on SP1.  