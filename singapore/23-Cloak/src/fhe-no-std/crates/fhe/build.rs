use core::result::Result;

fn main() -> Result<(), &'static str> {
    // Generate the proto files.
    // prost_build::compile_protos(&["src/proto/bfv.proto"], &["src/proto"])?;
    Ok(())
}
