pragma circom 2.0.0;

include "circomlib/circuits/sha256/sha256.circom";

template TaskVerifier {
    // Inputs
    signal input id;                 // Public numeric ID
    signal input expected_hash[8];   // Public expected SHA256 hash
    signal input secret_string[64];         // Private string input (padded to 64 bytes)

    // Output
    signal output is_valid;                 // Output: 1 if valid, 0 otherwise

    // Instantiate SHA256 component
    component sha256 = Sha256(64);

    // Wire the secret string to the SHA256 input
    for (var i = 0; i < 64; i++) {
        sha256.in[i] <== secret_string[i];
    }

    // Check if the computed hash matches the expected public hash
    var hash_match = 1;
    for (var j = 0; j < 8; j++) {
        hash_match <== hash_match * (sha256.out[j] === expected_hash[j]);
    }

    // Constraint: Ensure the public ID is within a valid range
    is_valid <== hash_match * (id >= 1) * (id <= 9999);
}

component main = TaskVerifier();
