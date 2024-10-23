fn main() {
    let mut builder = tonic_build::configure()
        .out_dir("./src/proto_generated")
        .disable_package_emission()
        .build_server(true)
        .build_client(false);

    #[cfg(feature = "pflix-client")]
    {
        builder = builder.build_client(true);
    }

    builder = builder.type_attribute(".pflix_rpc", "#[derive(::serde::Serialize, ::serde::Deserialize)]");
    for name in ["AttestationReport", "InitRuntimeResponse", "Attestation"] {
        builder = builder.type_attribute(name, "#[derive(::scale_info::TypeInfo)]");
    }
    builder = builder.field_attribute("InitRuntimeResponse.attestation", "#[serde(skip, default)]");
    builder.compile_protos(&["pflix_rpc.proto"], &["proto"]).unwrap();
}
