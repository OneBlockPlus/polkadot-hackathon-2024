use crate::{
    mock::*,
    pallet::{Error, Event},
    tests::util::*,
    types::{Contract, PaymentType, ContractType},
};
use frame_support::{assert_noop, assert_ok};

// Failure Tests
#[test]
fn fail_accept_nonexistent_purchase() {
    new_test_ext().execute_with(|| {
        let buyer = 2u64;
        assert_noop!(
            IPPallet::accept_purchase(RuntimeOrigin::signed(buyer), 999u32),
            Error::<Test>::OfferNotFound
        );
    });
}

#[test]
fn fail_accept_wrong_offer_type() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let buyer = 2u64;
        let nft_id = create_nft(owner);

        // Create license offer instead of purchase
        assert_ok!(IPPallet::offer_license(
            RuntimeOrigin::signed(owner),
            nft_id,
            create_one_time_payment_type(),
            false,
            100u32.into()
        ));
        let offer_id = get_last_offer_id();

        // Try to accept as purchase
        assert_noop!(
            IPPallet::accept_purchase(RuntimeOrigin::signed(buyer), offer_id),
            Error::<Test>::NotAPurchaseOffer
        );
    });
}

#[test]
fn fail_accept_nft_already_escrowed() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let buyer1 = 2u64;
        let buyer2 = 3u64;
        let nft_id = create_nft(owner);

        // Create two purchase offers first
        assert_ok!(IPPallet::offer_purchase(
            RuntimeOrigin::signed(owner),
            nft_id,
            create_periodic_payment_type(),
        ));
        let offer_id1 = get_last_offer_id();

        assert_ok!(IPPallet::offer_purchase(
            RuntimeOrigin::signed(owner),
            nft_id,
            create_one_time_payment_type(),
        ));
        let offer_id2 = get_last_offer_id();

        // Accept first offer, putting NFT in escrow
        assert_ok!(IPPallet::accept_purchase(RuntimeOrigin::signed(buyer1), offer_id1));

        // Try to accept second offer while NFT is escrowed
        assert_noop!(
            IPPallet::accept_purchase(RuntimeOrigin::signed(buyer2), offer_id2),
            Error::<Test>::NftInEscrow
        );
    });
}

#[test]
fn fail_accept_purchase_insufficient_balance_onetime() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let poor_buyer = 4u64; // Account with no balance
        let nft_id = create_nft(owner);

        // Create purchase offer with one-time payment
        assert_ok!(IPPallet::offer_purchase(
            RuntimeOrigin::signed(owner),
            nft_id,
            PaymentType::OneTime(50_000u128.into()), // Amount greater than any initial balance
        ));
        let offer_id = get_last_offer_id();

        // Try to accept offer without sufficient balance
        assert_noop!(
            IPPallet::accept_purchase(RuntimeOrigin::signed(poor_buyer), offer_id),
            Error::<Test>::InsufficientBalance
        );
    });
}

// Success Tests
#[test]
fn success_accept_onetime_purchase() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let buyer = 2u64;
        let nft_id = create_nft(owner);
        let payment_amount = 1_000u128;

        let owner_initial_balance = Balances::free_balance(owner);
        let buyer_initial_balance = Balances::free_balance(buyer);

        // Create purchase offer
        assert_ok!(IPPallet::offer_purchase(
            RuntimeOrigin::signed(owner),
            nft_id,
            PaymentType::OneTime(payment_amount.into()),
        ));
        let offer_id = get_last_offer_id();

        // Accept purchase
        assert_ok!(IPPallet::accept_purchase(RuntimeOrigin::signed(buyer), offer_id));

        // Verify balances
        assert_eq!(
            Balances::free_balance(owner),
            owner_initial_balance + payment_amount
        );
        assert_eq!(
            Balances::free_balance(buyer),
            buyer_initial_balance - payment_amount
        );

        // Verify NFT ownership and escrow
        assert!(IPPallet::escrowed_nfts(nft_id).is_none());
        let nft = IPPallet::nfts(nft_id).unwrap();
        assert_eq!(nft.owner, buyer);

        // Verify offer removed
        assert!(IPPallet::offers(offer_id).is_none());

        // Verify contract created and completed
        let contracts = IPPallet::nft_contracts(nft_id);
        assert_eq!(contracts.len(), 0); // Contract should be removed after completion

        // Verify events
        System::assert_has_event(RuntimeEvent::IPPallet(Event::PaymentMade {
            payer: buyer,
            payee: owner,
            amount: payment_amount.into(),
        }));
        System::assert_has_event(RuntimeEvent::IPPallet(Event::ContractCompleted {
            contract_id: 0u32.into(), // First contract
            contract_type: ContractType::Purchase,
            nft_id,
            offered_by: owner,
            accepted_by: buyer,
            total_paid: payment_amount.into(),
        }));
    });
}

#[test]
fn success_accept_periodic_purchase() {
    new_test_ext().execute_with(|| {
        let owner = 1u64;
        let buyer = 2u64;
        let nft_id = create_nft(owner);
        let payment_amount = 1_000u128;

        let owner_initial_balance = Balances::free_balance(owner);
        let buyer_initial_balance = Balances::free_balance(buyer);

        // Create periodic purchase offer
        assert_ok!(IPPallet::offer_purchase(
            RuntimeOrigin::signed(owner),
            nft_id,
            PaymentType::Periodic {
                amount_per_payment: payment_amount.into(),
                total_payments: 10u32,
                frequency: 10u32.into(),
            },
        ));
        let offer_id = get_last_offer_id();

        // Accept purchase
        assert_ok!(IPPallet::accept_purchase(RuntimeOrigin::signed(buyer), offer_id));

        // Verify first payment balances
        assert_eq!(
            Balances::free_balance(owner),
            owner_initial_balance + payment_amount
        );
        assert_eq!(
            Balances::free_balance(buyer),
            buyer_initial_balance - payment_amount
        );

        // Verify NFT escrow
        assert!(IPPallet::escrowed_nfts(nft_id).is_some());
        let escrow = IPPallet::escrowed_nfts(nft_id).unwrap();
        assert_eq!(escrow, owner);

        // Verify contract state
        let contracts = IPPallet::nft_contracts(nft_id);
        assert_eq!(contracts.len(), 1);
        let contract_id = contracts[0];

        if let Some(Contract::Purchase(purchase)) = IPPallet::contracts(contract_id) {
            assert_eq!(purchase.buyer, buyer);
            assert_eq!(purchase.seller, owner);
            assert_eq!(purchase.nft_id, nft_id);
            
            let schedule = purchase.payment_schedule.unwrap();
            assert_eq!(schedule.payments_made, 1u32);
            assert_eq!(schedule.payments_due, 9u32);
            assert!(schedule.missed_payments.is_none());
            assert!(schedule.penalty_amount.is_none());
            assert_eq!(schedule.frequency, 10u64);
            assert_eq!(schedule.next_payment_block, frame_system::Pallet::<Test>::block_number() + 10u64);
        } else {
            panic!("Contract not found or wrong type");
        }

        // Verify events
        System::assert_has_event(RuntimeEvent::IPPallet(Event::PaymentMade {
            payer: buyer,
            payee: owner,
            amount: payment_amount.into(),
        }));
        System::assert_has_event(RuntimeEvent::IPPallet(Event::ContractCreated {
            contract_id: contract_id,
            contract_type: ContractType::Purchase,
            nft_id,
            offered_by: owner,
            accepted_by: buyer,
        }));
        System::assert_has_event(RuntimeEvent::IPPallet(Event::NftEscrowed {
            nft_id,
            owner,
        }));
    });
} 