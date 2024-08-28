fn main() -> Result<(), Box<dyn std::error::Error>> {
    let protos = ["proto/command_v1.proto", "proto/tunnel_v1.proto"];
    tonic_build::configure()
        .protoc_arg("--experimental_allow_proto3_optional")
        .compile(&protos, &["proto"])?;
    Ok(())
}
