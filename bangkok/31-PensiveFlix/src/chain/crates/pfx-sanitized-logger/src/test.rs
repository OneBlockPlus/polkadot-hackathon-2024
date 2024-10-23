use super::*;

#[test]
fn whitelist_works() {
    let allowed: Vec<_> = include_str!("all-log-targets.txt")
        .split('\n')
        .filter(|t| target_allowed(t))
        .collect();
    assert_eq!(
        allowed,
        [
            "pfx",
            "pfx::benchmark",
            "pfx::light_validation",
            "pfx::light_validation::justification::communication",
            "pfx::crpc_service",
            "pfx::storage::storage_ext",
            "pfx::system",
            "pfx::system::gk",
            "pfx::system::master_key",
            "pfx_api::storage_sync",
            "pfx_mq",
            "pfx_node_runtime",
            "crpc_measuring",
            "pflix",
            "pflix::api_server",
            "pflix::ias",
            "pflix::pal_gramine",
            "pflix::runtime",
            "rocket::launch",
            "rocket::launch_",
            "rocket::server",
        ]
    );
}

#[test]
fn see_log() {
    use log::info;

    init_env_logger(true);
    info!(target: "pfx", "target pfx");
    info!(target: "other", "target other");
}
