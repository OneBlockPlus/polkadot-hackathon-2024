use crate::{mock::*, Error, Event, PoolInfo};
use frame_support::{assert_noop, assert_ok};
use frame_system::pallet_prelude::*;
use sp_std::alloc::System;
// Add these imports
use crate as pools;
use pools::PoolsLiquidationTrait;

#[test]
fn create_pool_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let pool_id = 1u32; // Change this to u32
        let symbol = b"SYN".to_vec();
        let name = b"Synthetic Asset".to_vec();
        let initial_parameters = PoolInfo {
            synthetic_asset: 1u32, // Change this to u32
            debt_ceiling: 1000u128,
            min_mint_amount: 1u128,
        };

        assert_ok!(Pools::create_pool(RuntimeOrigin::signed(1), symbol, name, initial_parameters));
        assert!(pools::PoolParameters::<Test>::contains_key(pool_id));

        System::assert_last_event(Event::PoolCreated(pool_id).into());
    });
}

#[test]
fn create_pool_fails_when_pool_exists() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let symbol = b"SYN".to_vec();
        let name = b"Synthetic Asset".to_vec();
        let initial_parameters = PoolInfo {
            synthetic_asset: 1u64.into(),
            debt_ceiling: 1000u128,
            min_mint_amount: 1u128,
        };

        assert_ok!(Pools::create_pool(RuntimeOrigin::signed(1), symbol.clone(), name.clone(), initial_parameters.clone()));
        assert_noop!(
            Pools::create_pool(RuntimeOrigin::signed(1), symbol, name, initial_parameters),
            Error::<Test>::PoolAlreadyExists
        );
    });
}

#[test]
fn mint_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let pool_id = 1u64.into();
        let symbol = b"SYN".to_vec();
        let name = b"Synthetic Asset".to_vec();
        let initial_parameters = PoolInfo {
            synthetic_asset: 1u64.into(),
            debt_ceiling: 1000u128,
            min_mint_amount: 1u128,
        };

        assert_ok!(Pools::create_pool(RuntimeOrigin::signed(1), symbol, name, initial_parameters));
        assert_ok!(Pools::mint(RuntimeOrigin::signed(1), pool_id, 100u128));

        assert_eq!(crate::UserDebt::<Test>::get((pool_id, 1)), 100u128);
        assert_eq!(crate::PoolTotalDebt::<Test>::get(pool_id), 100u128);

        System::assert_last_event(Event::SyntheticMinted(1, pool_id, 100u128).into());
    });
}

#[test]
fn burn_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let pool_id = 1u64.into();
        let symbol = b"SYN".to_vec();
        let name = b"Synthetic Asset".to_vec();
        let initial_parameters = PoolInfo {
            synthetic_asset: 1u64.into(),
            debt_ceiling: 1000u128,
            min_mint_amount: 1u128,
        };

        assert_ok!(Pools::create_pool(RuntimeOrigin::signed(1), symbol, name, initial_parameters));
        assert_ok!(Pools::mint(RuntimeOrigin::signed(1), pool_id, 100u128));
        assert_ok!(Pools::burn(RuntimeOrigin::signed(1), pool_id, 50u128));

        assert_eq!(crate::UserDebt::<Test>::get((pool_id, 1)), 50u128);
        assert_eq!(crate::PoolTotalDebt::<Test>::get(pool_id), 50u128);

        System::assert_last_event(Event::SyntheticBurned(1, pool_id, 50u128).into());
    });
}

#[test]
fn prepare_liquidation_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let pool_id = 1u32;
        let symbol = b"SYN".to_vec();
        let name = b"Synthetic Asset".to_vec();
        let initial_parameters = PoolInfo {
            synthetic_asset: 1u32,
            debt_ceiling: 1000u128,
            min_mint_amount: 1u128,
        };

        assert_ok!(Pools::create_pool(RuntimeOrigin::signed(1), symbol, name, initial_parameters));
        assert_ok!(Pools::mint(RuntimeOrigin::signed(1), pool_id, 100u128));

        assert_ok!(<Pools as PoolsLiquidationTrait<_, _, _, _>>::prepare_liquidation(RuntimeOrigin::root(), 2, 1, pool_id, 50u128));

        assert_eq!(pools::UserDebt::<Test>::get((pool_id, 1)), 50u128);
        assert_eq!(pools::UserDebt::<Test>::get((pool_id, 2)), 50u128);
        assert_eq!(pools::PoolTotalDebt::<Test>::get(pool_id), 100u128);

        System::assert_last_event(Event::DebtTransferred(2, 1, pool_id, 50u128).into());
    });
}
