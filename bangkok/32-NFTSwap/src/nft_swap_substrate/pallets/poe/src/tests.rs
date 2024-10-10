use super::*;
use crate::{mock::*, Error};
use frame_support::{assert_noop, assert_ok, BoundedVec, pallet_prelude::Get};

#[test]
fn create_claim_works() {
    new_test_ext().execute_with(|| {
        let claim = BoundedVec::try_from(vec![0, 1, 2]).unwrap();
        let account_id = 1;
        assert_ok!(PoeModule::create_claim(RuntimeOrigin::signed(account_id), claim.clone()));

        assert_eq!(
            Proofs::<Test>::get(&claim),
            Some((account_id, frame_system::Pallet::<Test>::block_number()))
        );
    })
}

#[test]
fn create_claim_failed_when_claim_already_exist() {
    new_test_ext().execute_with(|| {
        let claim = BoundedVec::try_from(vec![0, 1, 2]).unwrap();
        let account_id = 1;
        let _ = PoeModule::create_claim(RuntimeOrigin::signed(account_id), claim.clone());

        assert_noop!(
            PoeModule::create_claim(RuntimeOrigin::signed(account_id), claim.clone()),
            Error::<Test>::ProofAlreadyExist
        );
    })
}

#[test]
fn revoke_claim_works() {
    new_test_ext().execute_with(|| {
        let claim = BoundedVec::try_from(vec![0, 1, 2]).unwrap();
        let account_id = 1;
        let _ = PoeModule::create_claim(RuntimeOrigin::signed(account_id), claim.clone());

        assert_ok!(PoeModule::revoke_claim(RuntimeOrigin::signed(account_id), claim.clone()));
    })
}

#[test]
fn revoke_claim_failed_when_claim_is_not_exist() {
    new_test_ext().execute_with(|| {
        let claim = BoundedVec::try_from(vec![0, 1, 2]).unwrap();
        let account_id = 1;

        assert_noop!(
            PoeModule::revoke_claim(RuntimeOrigin::signed(account_id), claim.clone()),
            Error::<Test>::ClaimNotExist
        );
    })
}

#[test]
fn revoke_claim_failed_with_wrong_owner() {
    new_test_ext().execute_with(|| {
        let claim = BoundedVec::try_from(vec![0, 1, 2]).unwrap();
        let _ = PoeModule::create_claim(RuntimeOrigin::signed(1), claim.clone());

        assert_noop!(
            PoeModule::revoke_claim(RuntimeOrigin::signed(2), claim.clone()),
            Error::<Test>::NotClaimOwner
        );
    })
}

#[test]
fn transfer_claim_works() {
    new_test_ext().execute_with(|| {
        let claim = BoundedVec::try_from(vec![0, 1, 2]).unwrap();
        let account_id = 1;
        let to_account_id = 2;
        let _ = PoeModule::create_claim(RuntimeOrigin::signed(account_id), claim.clone());

        assert_ok!(PoeModule::transfer_claim(RuntimeOrigin::signed(account_id), claim.clone(), to_account_id));

        let bounded_claim =
            BoundedVec::<u8, <Test as Config>::MaxClaimLength>::try_from(claim.clone()).unwrap();
        assert_eq!(
            Proofs::<Test>::get(&bounded_claim),
            Some((to_account_id, frame_system::Pallet::<Test>::block_number()))
        );
    })
}

#[test]
fn transfer_claim_failed_when_claim_is_not_exist() {
    new_test_ext().execute_with(|| {
        let claim = BoundedVec::try_from(vec![0, 1, 2]).unwrap();
        let account_id = 1;
        let to_account_id = 2;

        assert_noop!(
            PoeModule::transfer_claim(RuntimeOrigin::signed(account_id), claim.clone(), to_account_id),
            Error::<Test>::ClaimNotExist
        );
    })
}

#[test]
fn transfer_claim_failed_with_wrong_owner() {
    new_test_ext().execute_with(|| {
        let claim = BoundedVec::try_from(vec![0, 1, 2]).unwrap();
        let account_id = 1;
        let wrong_account_id = 2;
        let to_account_id = 3;
        let _ = PoeModule::create_claim(RuntimeOrigin::signed(account_id), claim.clone());

        assert_noop!(
            PoeModule::transfer_claim(RuntimeOrigin::signed(wrong_account_id), claim.clone(), to_account_id),
            Error::<Test>::NotClaimOwner
        );
    })
}