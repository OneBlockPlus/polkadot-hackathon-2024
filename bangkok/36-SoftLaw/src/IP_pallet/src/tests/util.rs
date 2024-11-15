use frame_support::assert_ok;

use crate::pallet::Event;
use crate::types::*;
use crate::{mock::*, pallet::Config};

pub fn create_nft(owner: <Test as frame_system::Config>::AccountId) -> <Test as Config>::NFTId {
    let origin = RuntimeOrigin::signed(owner);
    IPPallet::mint_nft(
        origin,
        "Test NFT".into(),
        "Test Description".into(),
        "2023-05-01".into(),
        "Test Jurisdiction".into(),
    )
    .unwrap();
    IPPallet::next_nft_id() - 1
}

pub fn create_periodic_payment_type() -> PaymentType<Test> {
    PaymentType::Periodic {
        amount_per_payment: 100u32.into(),
        total_payments: 10u32,
        frequency: 10u32.into(),
    }
}

pub fn create_one_time_payment_type() -> PaymentType<Test> {
    PaymentType::OneTime(1000u32.into())
}

pub fn get_last_offer_id() -> <Test as Config>::OfferId {
    match System::events().last().unwrap().event {
        RuntimeEvent::IPPallet(Event::PurchaseOffered { offer_id, .. })
        | RuntimeEvent::IPPallet(Event::LicenseOffered { offer_id, .. }) => offer_id,
        _ => panic!("Expected Offer event"),
    }
}

pub fn get_last_contract_id() -> <Test as Config>::ContractId {
    match System::events().last().unwrap().event {
        RuntimeEvent::IPPallet(Event::ContractCreated { contract_id, .. }) => contract_id,
        _ => panic!("Expected ContractCreated event"),
    }
}

pub fn create_and_accept_periodic_purchase(
    owner: <Test as frame_system::Config>::AccountId,
    buyer: <Test as frame_system::Config>::AccountId,
    nft_id: <Test as Config>::NFTId,
) -> <Test as Config>::ContractId {
    // Create purchase offer
    assert_ok!(IPPallet::offer_purchase(
        RuntimeOrigin::signed(owner),
        nft_id,
        create_periodic_payment_type(),
    ));
    let offer_id = get_last_offer_id();

    // Accept purchase
    assert_ok!(IPPallet::accept_purchase(
        RuntimeOrigin::signed(buyer),
        offer_id
    ));

    // Return contract ID
    IPPallet::nft_contracts(nft_id)[0]
}
