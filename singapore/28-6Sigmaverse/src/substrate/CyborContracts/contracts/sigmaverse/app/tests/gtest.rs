use gstd::ActorId;
use sigmaverse_client::{
    traits::{CyborNft, SigmaverseFactory}, CyborRace, cybor_nft::events::CyborNftEvents
};
use fixture::Fixture;
use futures::stream::StreamExt;
use sails_rs::{calls::*, events::*, U256};

mod fixture;

#[tokio::test]
async fn mint_cybor_works() {
    // Arrange

    let fixture = Fixture::new(fixture::ADMIN_ID);

    let sigmaverse_factory = fixture.sigmaverse_factory();

    // Use generated client code for activating Demo program
    // using the `new` constructor and the `send_recv` method
    let sigmaverse_program_id = sigmaverse_factory
        .default()
        .send_recv(fixture.sigmaverse_code_id(), "123")
        .await
        .unwrap();

    let mut cybor_client = fixture.cybor_client();
    // Listen to Counter events
    let mut cybor_listener = fixture.cybor_listener();
    let mut cybor_events = cybor_listener.listen().await.unwrap();

    // Act

    // Use generated client code for calling Counter service
    // using the `send_recv` method
    let result = cybor_client
        .mint(CyborRace::Nguyen)
        .send_recv(sigmaverse_program_id)
        .await
        .unwrap();

    // Asert

    let event = cybor_events.next().await.unwrap();

    assert_eq!(result, ());
    let e = CyborNftEvents::Minted { to: ActorId::zero(), value: U256::from(1), next_id: U256::from(1), len_by_minted: 1, len_by_group_user: 1 };
    assert_eq!((sigmaverse_program_id, e), event);
}
