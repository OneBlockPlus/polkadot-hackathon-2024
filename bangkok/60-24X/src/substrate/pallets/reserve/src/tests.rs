use crate::{mock::*, Error, Event, CollateralParams};
use frame_support::{assert_noop, assert_ok, error::BadOrigin};
// use sp_runtime::traits::BadOrigin;

#[test]
fn deposit_collateral_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        
        let account = 1;
        let pool_id = 1;
        let amount = 100;
        let asset_id = 1;

        // mint balance
        assert_ok!(Balances::force_set_balance(RuntimeOrigin::root(), account, 1000));

        // Create asset
        assert_ok!(Assets::create(RuntimeOrigin::signed(account), asset_id, account, 1));

        // Add collateral asset
        assert_ok!(Reserve::add_collateral_asset(RuntimeOrigin::root(), pool_id, asset_id, CollateralParams {
            max_ceiling: 1000,
            liquidation_threshold: 80,
            liquidation_penalty: 5,
        }));

        // Create token account for account
        assert_ok!(Assets::touch_other(RuntimeOrigin::signed(account), asset_id, Reserve::pallet_account_id()));

        // Mint some balance for the account
        assert_ok!(Assets::mint(RuntimeOrigin::signed(account), asset_id, account, 1000));

        // Deposit collateral
        assert_ok!(Reserve::deposit_collateral(RuntimeOrigin::signed(account), pool_id, asset_id, amount));

        // Check that the collateral was deposited
        assert_eq!(Reserve::user_collateral((pool_id, asset_id, account)), amount);
        assert_eq!(Reserve::pool_collateral((pool_id, asset_id)), amount);

        // Check that the event was emitted
        System::assert_last_event(Event::CollateralDeposited(account, pool_id, asset_id, amount).into());

        // Check that the balance was transferred
        assert_eq!(Assets::balance(account.try_into().unwrap(), &asset_id.into()), 900);
    });
}

// #[test]
// fn deposit_collateral_fails_with_insufficient_balance() {
//     new_test_ext().execute_with(|| {
//         let account = 1;
//         let pool_id = 1;
//         let asset_id = 1;
//         let amount = 100;

//         // Add collateral asset
//         assert_ok!(Reserve::add_collateral_asset(RuntimeOrigin::root(), pool_id, asset_id, CollateralParams {
//             max_ceiling: 1000,
//             liquidation_threshold: 80,
//             liquidation_penalty: 5,
//         }));

//         // Mint insufficient balance for the account
//         assert_ok!(Balances::force_set_balance(RuntimeOrigin::root(), account, 50));

//         // Attempt to deposit collateral
//         assert_noop!(
//             Reserve::deposit_collateral(RuntimeOrigin::signed(account), pool_id, asset_id, amount),
//             pallet_balances::Error::<Test>::InsufficientBalance
//         );
//     });
// }

// #[test]
// fn withdraw_collateral_works() {
//     new_test_ext().execute_with(|| {
//         let account = 1;
//         let pool_id = 1;
//         let asset_id = 1;
//         let deposit_amount = 100;
//         let withdraw_amount = 50;

//         // Add collateral asset
//         assert_ok!(Reserve::add_collateral_asset(RuntimeOrigin::root(), pool_id, asset_id, CollateralParams {
//             max_ceiling: 1000,
//             liquidation_threshold: 80,
//             liquidation_penalty: 5,
//         }));

//         // Mint some balance for the account
//         assert_ok!(Balances::force_set_balance(RuntimeOrigin::root(), account, 1000));

//         // Deposit collateral
//         assert_ok!(Reserve::deposit_collateral(RuntimeOrigin::signed(account), pool_id, asset_id, deposit_amount));

//         // Withdraw collateral
//         assert_ok!(Reserve::withdraw_collateral(RuntimeOrigin::signed(account), pool_id, asset_id, withdraw_amount));

//         // Check that the collateral was withdrawn
//         assert_eq!(Reserve::user_collateral((pool_id, asset_id, account)), deposit_amount - withdraw_amount);
//         assert_eq!(Reserve::pool_collateral(pool_id, asset_id), deposit_amount - withdraw_amount);

//         // Check that the event was emitted
//         System::assert_last_event(Event::CollateralWithdrawn(account, pool_id, asset_id, withdraw_amount).into());

//         // Check that the balance was transferred back
//         assert_eq!(Balances::free_balance(account), 950);
//         assert_eq!(Balances::free_balance(Reserve::account_id()), deposit_amount - withdraw_amount);
//     });
// }

// #[test]
// fn withdraw_collateral_fails_with_insufficient_collateral() {
//     new_test_ext().execute_with(|| {
//         let account = 1;
//         let pool_id = 1;
//         let asset_id = 1;
//         let deposit_amount = 100;
//         let withdraw_amount = 150;

//         // Add collateral asset
//         assert_ok!(Reserve::add_collateral_asset(RuntimeOrigin::root(), pool_id, asset_id, CollateralParams {
//             max_ceiling: 1000,
//             liquidation_threshold: 80,
//             liquidation_penalty: 5,
//         }));

//         // Mint some balance for the account
//         assert_ok!(Balances::force_set_balance(RuntimeOrigin::root(), account, 1000));

//         // Deposit collateral
//         assert_ok!(Reserve::deposit_collateral(RuntimeOrigin::signed(account), pool_id, asset_id, deposit_amount));

//         // Attempt to withdraw more collateral than deposited
//         assert_noop!(
//             Reserve::withdraw_collateral(RuntimeOrigin::signed(account), pool_id, asset_id, withdraw_amount),
//             Error::<Test>::InsufficientCollateral
//         );
//     });
// }

// #[test]
// fn liquidate_works() {
//     new_test_ext().execute_with(|| {
//         let liquidator = 1;
//         let account = 2;
//         let pool_id = 1;
//         let asset_id = 1;
//         let collateral_amount = 100;
//         let liquidation_amount = 80;

//         // Add collateral asset
//         assert_ok!(Reserve::add_collateral_asset(RuntimeOrigin::root(), pool_id, asset_id, CollateralParams {
//             max_ceiling: 1000,
//             liquidation_threshold: 80,
//             liquidation_penalty: 5,
//         }));

//         // Mint some balance for the account
//         assert_ok!(Balances::force_set_balance(RuntimeOrigin::root(), account, 1000));

//         // Deposit collateral
//         assert_ok!(Reserve::deposit_collateral(RuntimeOrigin::signed(account), pool_id, asset_id, collateral_amount));

//         // Perform liquidation
//         assert_ok!(Reserve::liquidate(RuntimeOrigin::signed(liquidator), liquidator, account, pool_id, asset_id, liquidation_amount));

//         // Check that the collateral was transferred
//         assert_eq!(Reserve::user_collateral((pool_id, asset_id, account)), collateral_amount - liquidation_amount);
//         assert_eq!(Reserve::user_collateral((pool_id, asset_id, liquidator)), liquidation_amount);

//         // Check that the event was emitted
//         System::assert_last_event(Event::Liquidated(liquidator, account, pool_id, asset_id, liquidation_amount, liquidation_amount).into());
//     });
// }

// #[test]
// fn add_collateral_asset_works() {
//     new_test_ext().execute_with(|| {
//         let pool_id = 1;
//         let asset_id = 1;
//         let params = CollateralParams {
//             max_ceiling: 1000,
//             liquidation_threshold: 80,
//             liquidation_penalty: 5,
//         };

//         // Add collateral asset
//         assert_ok!(Reserve::add_collateral_asset(RuntimeOrigin::root(), pool_id, asset_id, params.clone()));

//         // Check that the collateral asset was added
//         assert_eq!(Reserve::collateral_parameters((pool_id, asset_id)), params);

//         // Check that the event was emitted
//         System::assert_last_event(Event::CollateralAssetAdded(pool_id, asset_id).into());
//     });
// }

// #[test]
// fn add_collateral_asset_fails_for_non_root() {
//     new_test_ext().execute_with(|| {
//         let pool_id = 1;
//         let asset_id = 1;
//         let params = CollateralParams {
//             max_ceiling: 1000,
//             liquidation_threshold: 80,
//             liquidation_penalty: 5,
//         };

//         // Attempt to add collateral asset with non-root origin
//         assert_noop!(
//             Reserve::add_collateral_asset(RuntimeOrigin::signed(1), pool_id, asset_id, params),
//             BadOrigin
//         );
//     });
// }

// #[test]
// fn update_collateral_params_works() {
//     new_test_ext().execute_with(|| {
//         let pool_id = 1;
//         let asset_id = 1;
//         let initial_params = CollateralParams {
//             max_ceiling: 1000,
//             liquidation_threshold: 80,
//             liquidation_penalty: 5,
//         };
//         let updated_params = CollateralParams {
//             max_ceiling: 2000,
//             liquidation_threshold: 75,
//             liquidation_penalty: 10,
//         };

//         // Add collateral asset
//         assert_ok!(Reserve::add_collateral_asset(RuntimeOrigin::root(), pool_id, asset_id, initial_params));

//         // Update collateral parameters
//         assert_ok!(Reserve::update_collateral_params(RuntimeOrigin::root(), pool_id, asset_id, updated_params.clone()));

//         // Check that the parameters were updated
//         assert_eq!(Reserve::collateral_parameters((pool_id, asset_id)), updated_params);

//         // Check that the event was emitted
//         System::assert_last_event(Event::CollateralParametersUpdated(pool_id, asset_id).into());
//     });
// }