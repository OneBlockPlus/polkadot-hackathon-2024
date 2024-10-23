use extended_vnft_app::Program;
use sails_client_gen::ClientGenerator;
use std::{env, path::PathBuf};

fn main() {
    sails_rs::build_wasm();
    let idl_file_path =
        PathBuf::from(env::var("CARGO_MANIFEST_DIR").unwrap()).join("extended_vnft.idl");
    // Generate IDL file for the app
    sails_idl_gen::generate_idl_to_file::<Program>(&idl_file_path).unwrap();

    // Generate client code from IDL file
    ClientGenerator::from_idl_path(&idl_file_path)
        .generate_to(PathBuf::from(env::var("OUT_DIR").unwrap()).join("extended_vnft_client.rs"))
        .unwrap();
}
