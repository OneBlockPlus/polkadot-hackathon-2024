pragma circom 2.0.0;

include "./get_merkle_root.circom";
include "./poseidon255.circom";
include "../circomlib/circuits/bitify.circom";

template Withdraw(k){
	// public input
	signal input root;
	signal input nullifierHash;

	// private input
	signal input secret;
	
	signal input paths2_root[k];
  signal input paths2_root_pos[k];

	// root constrain
	component leaf = Poseidon255(2);
	leaf.in[0] <== secret;
	leaf.in[1] <== 0;
	log( "component leaf secret, and output", secret, leaf.out);


    component computed_root = GetMerkleRoot(k);
    computed_root.leaf <== leaf.out;

    for (var w = 0; w < k; w++){
        computed_root.paths2_root[w] <== paths2_root[w];

        computed_root.paths2_root_pos[w] <== paths2_root_pos[w];
    }
		log( "root is", root);
		log( "computed_root.out is", computed_root.out);
    root === computed_root.out;

	// nullifier constrain
	component cmt_index = Bits2Num(k);
	for (var i =0 ;i < k ; i++){
		cmt_index.in[i] <== paths2_root_pos[i];
	}

	component nullifier = Poseidon255(2);
	nullifier.in[0] <== cmt_index.out;
	nullifier.in[1] <== secret;

  log( "nullifier.out is", nullifier.out);
	nullifierHash === nullifier.out;
	
}

component main {public [root,nullifierHash]} = Withdraw(8);