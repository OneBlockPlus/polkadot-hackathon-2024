#![allow(warnings)]

use crate::{self as rosca, mock::*, Error, Event};
use frame_support::{
	assert_noop, assert_ok, assert_err,
	traits::{OnFinalize, OnInitialize},
	pallet_prelude::*
};
use frame_support::pallet_prelude::DispatchError::Token;
use frame_support::testing_prelude::bounded_vec;
use sp_runtime::{traits::BadOrigin, DispatchError, ModuleError};
use sp_runtime::TokenError::FundsUnavailable;

use frame_support::traits::fungible::Mutate;


#[test]
fn create_rosca_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let participants: BoundedVec<u64, ConstU32<149>> = vec![2, 3, 4].try_into().unwrap();
        Balances::mint_into(&1, 1000);
        assert_ok!(RoscaPallet::create_rosca(
            RuntimeOrigin::signed(1),
            false,
            participants,
            4,
            100,
            50,
            51,
            Some(0),
            bounded_vec![1]
        ));
        assert_eq!(Balances::free_balance(1), 1000);
    })
}


#[test]
fn join_rosca_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let participants: BoundedVec<u64, ConstU32<149>> = vec![2, 3, 4].try_into().unwrap();
        Balances::mint_into(&1, 1000);
        Balances::mint_into(&2, 1000);
        Balances::mint_into(&3, 1000);
        Balances::mint_into(&4, 1000);

        assert_noop!(RoscaPallet::create_rosca(
            RuntimeOrigin::signed(1),
            false,
            bounded_vec![1,2,3,4],
            3,
            100,
            50,
            51,
            Some(0),
            bounded_vec![1]
        ), Error::<Test>::CantInviteSelf);

        assert_ok!(RoscaPallet::create_rosca(
            RuntimeOrigin::signed(1),
            false,
            participants,
            3,
            100,
            50,
            51,
            Some(0),
            bounded_vec![1]
        ));
        assert_eq!(Balances::free_balance(1), 1000);

        assert_noop!(RoscaPallet::join_rosca( 
            RuntimeOrigin::signed(1), 
            0,
            None
        ), Error::<Test>::AlreadyJoined);

        assert_ok!(RoscaPallet::join_rosca( 
            RuntimeOrigin::signed(2), 
            0,
            None
        ));

        assert_noop!(RoscaPallet::join_rosca( 
            RuntimeOrigin::signed(2), 
            0,
            None
        ), Error::<Test>::AlreadyJoined);

        
        assert_ok!(RoscaPallet::join_rosca( 
            RuntimeOrigin::signed(3), 
            0,
            None
        ));


        assert_ok!(RoscaPallet::join_rosca( 
            RuntimeOrigin::signed(4), 
            0,
            None
        ));


        assert_noop!(RoscaPallet::join_rosca( 
            RuntimeOrigin::signed(5), 
            0,
            None
        ), Error::<Test>::NotInvited);

    })
}


#[test]
fn leave_rosca_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let participants: BoundedVec<u64, ConstU32<149>> = vec![2, 3, 4].try_into().unwrap();
        Balances::mint_into(&1, 1000);
        Balances::mint_into(&2, 1000);
        Balances::mint_into(&3, 1000);
        Balances::mint_into(&4, 1000);
        assert_err!(RoscaPallet::create_rosca(
            RuntimeOrigin::signed(1),
            false,
            participants.clone(),
            8,
            100,
            50,
            51,
            Some(0),
            bounded_vec![1]
        ), Error::<Test>::ThresholdTooHigh);

        assert_ok!(RoscaPallet::create_rosca(
            RuntimeOrigin::signed(1),
            false,
            participants.clone(),
            3,
            100,
            50,
            51,
            Some(0),
            bounded_vec![1]
        ));
        assert_eq!(Balances::free_balance(1), 1000);

        assert_ok!(RoscaPallet::leave_rosca(
            RuntimeOrigin::signed(1),
            0,
        ));

        assert_eq!(RoscaPallet::participants_count(0), Some(0));

    })
}


#[test]
fn contribute_to_rosca_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let participants_vec = vec![2, 3];
        let participants: BoundedVec<u64, ConstU32<149>> = participants_vec.clone().try_into().unwrap();
        Balances::mint_into(&1, 1000);
        Balances::mint_into(&2, 1000);
        Balances::mint_into(&3, 1000);

        // Create ROSCA
        assert_ok!(RoscaPallet::create_rosca(
            RuntimeOrigin::signed(1),
            false,
            participants.clone(),
            3,
            100,
            50,
            51,
            Some(0),
            bounded_vec![1]
        ));

        // Participants join ROSCA
        for participant in participants_vec.iter() {
            assert_ok!(RoscaPallet::join_rosca(RuntimeOrigin::signed(*participant), 0, None));
        }

        // Start the ROSCA
        assert_ok!(RoscaPallet::start_rosca(RuntimeOrigin::signed(1), 0));

        // First contribution round
        // Eligible claimant is participant 1
        for &participant in &[2, 3] {
            assert_ok!(RoscaPallet::contribute_to_rosca(RuntimeOrigin::signed(participant), 0));
        }

        // Check balances after first round
        assert_eq!(Balances::free_balance(1), 1000 + 200); // Received contributions
        assert_eq!(Balances::free_balance(2), 1000 - 100);
        assert_eq!(Balances::free_balance(3), 1000 - 100);

        // Advance to next period
        System::set_block_number(51);

        // Second contribution round
        // Eligible claimant is participant 2
        for &participant in &[1, 3] {
            assert_ok!(RoscaPallet::contribute_to_rosca(RuntimeOrigin::signed(participant), 0));
        }

        // Check balances after second round
        assert_eq!(Balances::free_balance(2), 1000 - 100 + 200); // Net zero
        assert_eq!(Balances::free_balance(1), 1000 + 200 - 100); // Contributed 100
        assert_eq!(Balances::free_balance(3), 1000 - 100 - 100);

        // Advance to next period
        System::set_block_number(101);

        // Third contribution round
        // Eligible claimant is participant 3
        for &participant in &[1, 2] {
            assert_ok!(RoscaPallet::contribute_to_rosca(RuntimeOrigin::signed(participant), 0));
        }

        // Check balances after third round
        assert_eq!(Balances::free_balance(3), 1000 - 200 + 200); // Net zero
        assert_eq!(Balances::free_balance(1), 1000 + 200 - 100 - 100); // Contributed twice
        assert_eq!(Balances::free_balance(2), 1000 - 100 + 200 - 100);

        // Ensure the ROSCA is marked as completed
        assert!(RoscaPallet::completed_roscas(0).is_some());
    });
}

#[test]
fn manually_end_rosca_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let participants_vec = vec![2, 3];
        let participants: BoundedVec<u64, ConstU32<149>> = participants_vec.clone().try_into().unwrap();
        Balances::mint_into(&1, 1000);
        Balances::mint_into(&2, 1000);
        Balances::mint_into(&3, 1000);

        // Create and start the ROSCA
        assert_ok!(RoscaPallet::create_rosca(
            RuntimeOrigin::signed(1),
            false,
            participants.clone(),
            3,
            100,
            50,
            51,
            Some(0),
            bounded_vec![1]
        ));
        for participant in participants_vec.iter() {
            assert_ok!(RoscaPallet::join_rosca(RuntimeOrigin::signed(*participant), 0, None));
        }
        assert_ok!(RoscaPallet::start_rosca(RuntimeOrigin::signed(1), 0));

        // Participants contribute in the first round
        for &participant in &[2, 3] {
            assert_ok!(RoscaPallet::contribute_to_rosca(RuntimeOrigin::signed(participant), 0));
        }

        // Advance to a block beyond the final pay block
        System::set_block_number(200);

        // Manually end the ROSCA
        assert_ok!(RoscaPallet::manually_end_rosca(RuntimeOrigin::signed(1), 0));

        // Ensure the ROSCA is marked as completed
        assert!(RoscaPallet::completed_roscas(0).is_some());
    });
}


#[test]
fn claim_security_deposit_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let participants_vec = vec![2, 3];
        let participants: BoundedVec<u64, ConstU32<149>> = participants_vec.clone().try_into().unwrap();
        Balances::mint_into(&1, 1000);
        Balances::mint_into(&2, 1000);
        Balances::mint_into(&3, 1000);

        // Create and start the ROSCA
        assert_ok!(RoscaPallet::create_rosca(
            RuntimeOrigin::signed(1),
            false,
            participants.clone(),
            3,
            100,
            50,
            51,
            Some(0),
            bounded_vec![1]
        ));
        for participant in participants_vec.iter() {
            assert_ok!(RoscaPallet::join_rosca(RuntimeOrigin::signed(*participant), 0, None));
        }
        assert_ok!(RoscaPallet::start_rosca(RuntimeOrigin::signed(1), 0));

        // Participants add to their security deposit
        assert_ok!(RoscaPallet::add_to_security_deposit(RuntimeOrigin::signed(1), 0, 50));
        assert_ok!(RoscaPallet::add_to_security_deposit(RuntimeOrigin::signed(2), 0, 50));

        // Complete the ROSCA
        System::set_block_number(200);
        assert_ok!(RoscaPallet::manually_end_rosca(RuntimeOrigin::signed(1), 0));

        // Claim security deposit
        assert_ok!(RoscaPallet::claim_security_deposit(RuntimeOrigin::signed(1), 0));
        assert_eq!(Balances::free_balance(1), 1000 - 50 + 50); // Should get back the deposit
    });
}

#[test]
fn add_to_security_deposit_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let participants_vec = vec![2, 3];
        let participants: BoundedVec<u64, ConstU32<149>> = participants_vec.clone().try_into().unwrap();
        Balances::mint_into(&1, 1000);

        // Create and start the ROSCA
        assert_ok!(RoscaPallet::create_rosca(
            RuntimeOrigin::signed(1),
            false,
            participants.clone(),
            1,
            100,
            50,
            51,
            Some(0),
            bounded_vec![1]
        ));
        assert_ok!(RoscaPallet::start_rosca(RuntimeOrigin::signed(1), 0));

        // Add to security deposit
        assert_ok!(RoscaPallet::add_to_security_deposit(RuntimeOrigin::signed(1), 0, 100));

        // Check that the deposit is recorded
        let deposit = RoscaPallet::security_deposit(0, &1).expect("Deposit should be recorded");
        assert_eq!(deposit, 100);

        // Check balance
        assert_eq!(Balances::free_balance(1), 900); // 1000 - 100
    });
}

#[test]
fn contribute_twice_in_same_period_fails() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let participants_vec = vec![2, 3];
        let participants: BoundedVec<u64, ConstU32<149>> = participants_vec.clone().try_into().unwrap();
        Balances::mint_into(&1, 1000);
        Balances::mint_into(&2, 1000);
        Balances::mint_into(&3, 1000);

        // Create and start the ROSCA
        assert_ok!(RoscaPallet::create_rosca(
            RuntimeOrigin::signed(1),
            false,
            participants.clone(),
            3,
            100,
            50,
            51,
            Some(0),
            bounded_vec![1]
        ));
        for participant in participants_vec.iter() {
            assert_ok!(RoscaPallet::join_rosca(RuntimeOrigin::signed(*participant), 0, None));
        }
        assert_ok!(RoscaPallet::start_rosca(RuntimeOrigin::signed(1), 0));

        // Participant contributes
        assert_ok!(RoscaPallet::contribute_to_rosca(RuntimeOrigin::signed(2), 0));

        // Participant tries to contribute again in the same period
        assert_noop!(
            RoscaPallet::contribute_to_rosca(RuntimeOrigin::signed(2), 0),
            Error::<Test>::AlreadyContributed
        );
    });
}

#[test]
fn start_rosca_already_active_fails() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let participants_vec = vec![2, 3];
        let participants: BoundedVec<u64, ConstU32<149>> = participants_vec.clone().try_into().unwrap();
        Balances::mint_into(&1, 1000);

        // Create and start the ROSCA
        assert_ok!(RoscaPallet::create_rosca(
            RuntimeOrigin::signed(1),
            false,
            participants.clone(),
            1,
            100,
            50,
            51,
            Some(0),
            bounded_vec![1]
        ));
        assert_ok!(RoscaPallet::start_rosca(RuntimeOrigin::signed(1), 0));

        // Attempt to start the ROSCA again
        assert_noop!(
            RoscaPallet::start_rosca(RuntimeOrigin::signed(1), 0),
            Error::<Test>::RoscaAlreadyActive
        );
    });
}

#[test]
fn join_rosca_without_invitation_fails() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let participants: BoundedVec<u64, ConstU32<149>> = vec![2, 3].try_into().unwrap();
        Balances::mint_into(&1, 1000);
        Balances::mint_into(&4, 1000);

        // Create ROSCA
        assert_ok!(RoscaPallet::create_rosca(
            RuntimeOrigin::signed(1),
            false,
            participants,
            3,
            100,
            50,
            51,
            Some(0),
            bounded_vec![1]
        ));

        // Participant 4 tries to join without an invitation
        assert_noop!(
            RoscaPallet::join_rosca(RuntimeOrigin::signed(4), 0, None),
            Error::<Test>::NotInvited
        );
    });
}

#[test]
fn contribute_after_final_pay_triggers_default_count() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let participants_vec = vec![2, 3];
        let participants: BoundedVec<u64, ConstU32<149>> = participants_vec.clone().try_into().unwrap();
        Balances::mint_into(&1, 1000);
        Balances::mint_into(&2, 1000);
        Balances::mint_into(&3, 1000);

        // Create and start the ROSCA
        assert_ok!(RoscaPallet::create_rosca(
            RuntimeOrigin::signed(1),
            false,
            participants.clone(),
            3,
            100,
            50,
            51,
            Some(0),
            bounded_vec![1]
        ));
        for participant in participants_vec.iter() {
            assert_ok!(RoscaPallet::join_rosca(RuntimeOrigin::signed(*participant), 0, None));
        }
        assert_ok!(RoscaPallet::start_rosca(RuntimeOrigin::signed(1), 0));

        // Advance to a block beyond the final pay block
        System::set_block_number(200);

        // Participant tries to contribute
        assert_ok!(
            RoscaPallet::contribute_to_rosca(RuntimeOrigin::signed(2), 0)
        );
    });
}
