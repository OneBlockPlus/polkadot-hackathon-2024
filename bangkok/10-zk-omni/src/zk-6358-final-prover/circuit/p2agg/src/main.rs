#![no_main]

use p2agg::p2;
sp1_zkvm::entrypoint!(main);

fn main() {
    p2::verify_p2_proof::verify_plonky2_proof();
}