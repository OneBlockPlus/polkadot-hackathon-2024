use futures::StreamExt;
use sigmaverse_client::{cybor_nft::events::*, traits::*, CyborRace};
use gclient::GearApi;
use sails_rs::{calls::*, events::*, gsdk::calls::*, prelude::*};
use std::panic;

const SIGMAVERSE_WASM_PATH: &str = "../../../target/wasm32-unknown-unknown/debug/sigmaverse.opt.wasm";

#[tokio::test]
#[ignore = "requires run gear node on GEAR_PATH"]
async fn mint_cybor_works() {
    // Arrange

    let (remoting, sigmaverse_code_id, gas_limit) = spin_up_node_with_sigmaverse_code().await;

    let sigmaverse_factory: sigmaverse_client::SigmaverseFactory<GSdkRemoting> = sigmaverse_client::SigmaverseFactory::new(remoting.clone());

    // Use generated client code for activating Sigmaverse program
    // using the `new` constructor and the `send_recv` method
    let sigmaverse_program_id = sigmaverse_factory
        .default()
        .with_gas_limit(gas_limit)
        .send_recv(sigmaverse_code_id, "123")
        .await
        .unwrap();

    let mut cybor_client = sigmaverse_client::CyborNft::new(remoting.clone());
    // Listen to Counter events
    let mut cybor_listener = sigmaverse_client::cybor_nft::events::listener(remoting.clone());
    let mut cybor_events = cybor_listener.listen().await.unwrap();

    // Act
    let result = cybor_client
        .mint(CyborRace::Nguyen)
        .with_gas_limit(gas_limit)
        .send_recv(sigmaverse_program_id)
        .await
        .unwrap();

    // Asert

    let event = cybor_events.next().await.unwrap();

    assert_eq!(result, ());

    let e = CyborNftEvents::Minted { to: ActorId::zero(), value: U256::from(1), next_id: U256::from(1), len_by_minted: 1, len_by_group_user: 1 };
    assert_eq!((sigmaverse_program_id, e), event);

}

async fn spin_up_node_with_sigmaverse_code() -> (GSdkRemoting, CodeId, GasUnit) {
    let gear_path = option_env!("GEAR_PATH");
    if gear_path.is_none() {
        panic!("the 'GEAR_PATH' environment variable was not set during compile time");
    }
    let api = GearApi::dev_from_path(gear_path.unwrap()).await.unwrap();
    let gas_limit = api.block_gas_limit().unwrap();
    let remoting = GSdkRemoting::new(api);
    let code_id = remoting.upload_code_by_path(SIGMAVERSE_WASM_PATH).await.unwrap();
    (remoting, code_id, gas_limit)
}
