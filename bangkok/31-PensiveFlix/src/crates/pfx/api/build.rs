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

    builder = builder.type_attribute(
        ".pflix_rpc",
        "#[derive(::serde::Serialize, ::serde::Deserialize)]",
    );
    for name in [
        "AttestationReport",
        "InitRuntimeResponse",
        "Attestation",
        "NetworkConfig",
    ] {
        builder = builder.type_attribute(name, "#[derive(::scale_info::TypeInfo)]");
    }
    builder = builder.field_attribute("InitRuntimeResponse.attestation", "#[serde(skip, default)]");
    for field in [
        "HttpFetch.body",
        "HttpFetch.headers",
    ] {
        builder = builder.field_attribute(field, "#[serde(default)]");
    }
    builder
        .compile(&["pflix_rpc.proto"], &["proto"])
        .unwrap();

    tonic_build::compile_protos("proto/greeting.proto").unwrap();
}
