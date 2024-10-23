pragma circom 2.0.0;

include "./poseidon255.circom";

template GetMerkleRoot(k){
// k is depth of tree

    signal input leaf;
    signal input paths2_root[k];
    signal input paths2_root_pos[k];

    signal output out;

    // hash of first two entries in tx Merkle proof
    component merkle_root[k];
    merkle_root[0] = Poseidon255(2);
    merkle_root[0].in[0] <== leaf - paths2_root_pos[0]* (leaf - paths2_root[0]); 
    merkle_root[0].in[1] <== paths2_root[0] - paths2_root_pos[0]* (paths2_root[0] - leaf);

    log("paths2_root[0] - paths2_root_pos[0]* (paths2_root[0] - leaf)", paths2_root[0], paths2_root_pos[0], paths2_root[0], leaf);
    log("merkle_root 0", 0, merkle_root[0].in[0],  merkle_root[0].in[1], merkle_root[0].out);

    // hash of all other entries in tx Merkle proof
    for (var v = 1; v < k; v++){
        merkle_root[v] = Poseidon255(2);
        merkle_root[v].in[0] <==  merkle_root[v-1].out - paths2_root_pos[v]* (merkle_root[v-1].out - paths2_root[v]);
        merkle_root[v].in[1]<== paths2_root[v] - paths2_root_pos[v]* (paths2_root[v] - merkle_root[v-1].out);

        log("merkle_root v", v, merkle_root[v].in[0],  merkle_root[v].in[1], merkle_root[v].out);
        
    }

    // output computed Merkle root
    out <== merkle_root[k-1].out;

}
