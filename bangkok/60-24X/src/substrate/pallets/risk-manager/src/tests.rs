use crate::{mock::*, Error, Event, PoolParams, CollateralParams, GlobalRiskParams};
use frame_support::{assert_ok, assert_noop};
use sp_runtime::traits::BadOrigin;
use crate::{PoolParameters, CollateralParameters};

#[test]
fn update_pool_parameters_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);
        let pool_id = 1;
        let initial_params = PoolParams {
            debt_ceiling: 1000,
            min_debt_amount: 10,
            is_minting_allowed: true,
            is_burning_allowed: true,
        };
        
        // Add initial pool parameters
        PoolParameters::<Test>::insert(pool_id, initial_params);

        let new_params = PoolParams {
            debt_ceiling: 2000,
            min_debt_amount: 20,
            is_minting_allowed: false,
            is_burning_allowed: true,
        };

        // Update pool parameters
        assert_ok!(RiskManagement::update_pool_parameters(RuntimeOrigin::root(), pool_id, new_params.clone()));

        // Check that the parameters were updated
        assert_eq!(RiskManagement::pool_parameters(pool_id), Some(new_params));

        // Check that the event was emitted
        System::assert_last_event(Event::PoolParametersUpdated(pool_id).into());
    });
}

#[test]
fn update_pool_parameters_fails_for_non_root() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let pool_id = 1;
        let new_params = PoolParams {
            debt_ceiling: 2000,
            min_debt_amount: 20,
            is_minting_allowed: false,
            is_burning_allowed: true,
        };

        // Attempt to update pool parameters with non-root origin
        assert_noop!(
            RiskManagement::update_pool_parameters(RuntimeOrigin::signed(1), pool_id, new_params),
            BadOrigin
        );
    });
}

#[test]
fn update_collateral_parameters_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let pool_id = 1;
        let asset_id = 1;
        let initial_params = CollateralParams {
            is_enabled: true,
            max_ceiling: 1000,
            base_ltv: 80,
            liquidation_threshold: 90,
            liquidation_penalty: 5,
            liquidation_fee: 1,
        };
        
        // Add initial collateral parameters
        CollateralParameters::<Test>::insert((pool_id, asset_id), initial_params);

        let new_params = CollateralParams {
            is_enabled: true,
            max_ceiling: 2000,
            base_ltv: 75,
            liquidation_threshold: 85,
            liquidation_penalty: 10,
            liquidation_fee: 2,
        };

        // Update collateral parameters
        assert_ok!(RiskManagement::update_collateral_parameters(RuntimeOrigin::root(), pool_id, asset_id, new_params.clone()));

        // Check that the parameters were updated
        assert_eq!(RiskManagement::collateral_parameters((pool_id, asset_id)), new_params);

        // Check that the event was emitted
        System::assert_last_event(Event::CollateralParametersUpdated(pool_id, asset_id).into());
    });
}

#[test]
fn update_collateral_parameters_fails_for_non_root() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let pool_id = 1;
        let asset_id = 1;
        let new_params = CollateralParams {
            is_enabled: true,
            max_ceiling: 2000,
            base_ltv: 75,
            liquidation_threshold: 85,
            liquidation_penalty: 10,
            liquidation_fee: 2,
        };

        // Attempt to update collateral parameters with non-root origin
        assert_noop!(
            RiskManagement::update_collateral_parameters(RuntimeOrigin::signed(1), pool_id, asset_id, new_params),
            BadOrigin
        );
    });
}

#[test]
fn update_global_risk_parameters_works() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let new_params = GlobalRiskParams {
            global_debt_ceiling: 1000000,
            min_health_factor: 120,
        };

        // Update global risk parameters
        assert_ok!(RiskManagement::update_global_risk_parameters(RuntimeOrigin::root(), new_params.clone()));

        // Check that the parameters were updated
        assert_eq!(RiskManagement::global_risk_state(), new_params);

        // Check that the event was emitted
        System::assert_last_event(Event::GlobalRiskParametersUpdated.into());
    });
}

#[test]
fn update_global_risk_parameters_fails_for_non_root() {
    new_test_ext().execute_with(|| {
        System::set_block_number(1);

        let new_params = GlobalRiskParams {
            global_debt_ceiling: 1000000,
            min_health_factor: 120,
        };

        // Attempt to update global risk parameters with non-root origin
        assert_noop!(
            RiskManagement::update_global_risk_parameters(RuntimeOrigin::signed(1), new_params),
            BadOrigin
        );
    });
}

#[test]
fn calculate_health_factor_works() {
    new_test_ext().execute_with(|| {
        let pool_id = 1;
        let account = 1;

        // This test assumes that the calculate_health_factor function is implemented
        // and returns a value of 100 (as per the placeholder implementation)
        assert_eq!(RiskManagement::calculate_health_factor(pool_id, &account).unwrap(), 100);
    });
}

#[test]
fn is_liquidatable_works() {
    new_test_ext().execute_with(|| {
        let pool_id = 1;
        let account = 1;

        // This test assumes that the is_liquidatable function is implemented
        // and returns false (as per the placeholder implementation)
        assert_eq!(RiskManagement::is_liquidatable(pool_id, &account), false);
    });
}

#[test]
fn is_position_healthy_works() {
    new_test_ext().execute_with(|| {
        let pool_id = 1;
        let account = 1;

        // This test assumes that the is_position_healthy function is implemented
        // and returns true (as per the placeholder implementation)
        assert_eq!(RiskManagement::is_position_healthy(pool_id, &account), true);
    });
}

#[test]
fn get_user_position_works() {
    new_test_ext().execute_with(|| {
        let pool_id = 1;
        let account = 1;

        // This test assumes that the get_user_position function is implemented
        // and returns a UserPosition with all values set to zero (as per the placeholder implementation)
        let position = RiskManagement::get_user_position(pool_id, &account).unwrap();
        assert_eq!(position.debt, 0);
        assert_eq!(position.collateral, 0);
        assert_eq!(position.collateral_base, 0);
        assert_eq!(position.collateral_liq, 0);
    });
}


// use crate::{mock::*, Error, Event, PoolParams, CollateralParams, GlobalRiskParams};
// use frame_support::{assert_noop, assert_ok};

// #[test]
// fn update_pool_parameters_works() {
//     new_test_ext().execute_with(|| {
//         let pool_id = 1;
//         let new_params = PoolParams {
//             debt_ceiling: 1_000_000,
//             min_debt_amount: 100,
//             is_minting_allowed: true,
//             is_burning_allowed: true,
//         };

//         // Update pool parameters
//         assert_ok!(RiskManagement::update_pool_parameters(RuntimeOrigin::root(), pool_id, new_params.clone()));

//         // Check that the parameters were updated
//         assert_eq!(RiskManagement::pool_parameters(pool_id), Some(new_params));

//         // Check that the event was emitted
//         System::assert_last_event(Event::PoolParametersUpdated(pool_id).into());
//     });
// }

// #[test]
// fn update_pool_parameters_fails_for_non_root() {
//     new_test_ext().execute_with(|| {
//         let pool_id = 1;
//         let new_params = PoolParams {
//             debt_ceiling: 1_000_000,
//             min_debt_amount: 100,
//             is_minting_allowed: true,
//             is_burning_allowed: true,
//         };

//         // Attempt to update pool parameters with non-root origin
//         assert_noop!(
//             RiskManagement::update_pool_parameters(RuntimeOrigin::signed(1), pool_id, new_params),
//             sp_runtime::DispatchError::BadOrigin
//         );
//     });
// }

// #[test]
// fn update_collateral_parameters_works() {
//     new_test_ext().execute_with(|| {
//         let pool_id = 1;
//         let asset_id = 1;
//         let new_params = CollateralParams {
//             is_enabled: true,
//             max_ceiling: 1_000_000,
//             base_ltv: 80,
//             liquidation_threshold: 85,
//             liquidation_penalty: 5,
//             liquidation_fee: 1,
//         };

//         // Update collateral parameters
//         assert_ok!(RiskManagement::update_collateral_parameters(RuntimeOrigin::root(), pool_id, asset_id, new_params.clone()));

//         // Check that the parameters were updated
//         assert_eq!(RiskManagement::collateral_parameters(pool_id, asset_id), Some(new_params));

//         // Check that the event was emitted
//         System::assert_last_event(Event::CollateralParametersUpdated(pool_id, asset_id).into());
//     });
// }

// #[test]
// fn update_global_risk_parameters_works() {
//     new_test_ext().execute_with(|| {
//         let new_params = GlobalRiskParams {
//             global_debt_ceiling: 10_000_000,
//             min_health_factor: 110,
//         };

//         // Update global risk parameters
//         assert_ok!(RiskManagement::update_global_risk_parameters(RuntimeOrigin::root(), new_params.clone()));

//         // Check that the parameters were updated
//         assert_eq!(RiskManagement::global_risk_state(), new_params);

//         // Check that the event was emitted
//         System::assert_last_event(Event::GlobalRiskParametersUpdated.into());
//     });
// }

// #[test]
// fn calculate_health_factor_works() {
//     new_test_ext().execute_with(|| {
//         let pool_id = 1;
//         let account = 1;

//         // Calculate health factor
//         let health_factor = RiskManagement::calculate_health_factor(pool_id, &account).unwrap();

//         // Check that the health factor is calculated (this is a placeholder value)
//         assert_eq!(health_factor, 100);
//     });
// }

// #[test]
// fn is_liquidatable_works() {
//     new_test_ext().execute_with(|| {
//         let pool_id = 1;
//         let account = 1;

//         // Check if the position is liquidatable (this uses the placeholder health factor)
//         assert!(!RiskManagement::is_liquidatable(pool_id, &account));
//     });
// }

// #[test]
// fn is_position_healthy_works() {
//     new_test_ext().execute_with(|| {
//         let pool_id = 1;
//         let account = 1;

//         // Check if the position is healthy (this uses the placeholder health factor)
//         assert!(RiskManagement::is_position_healthy(pool_id, &account));
//     });
// }

// #[test]
// fn get_user_position_works() {
//     new_test_ext().execute_with(|| {
//         let pool_id = 1;
//         let account = 1;

//         // Get user position
//         let position = RiskManagement::get_user_position(pool_id, &account).unwrap();

//         // Check that the position is retrieved (these are placeholder values)
//         assert_eq!(position.debt, 0);
//         assert_eq!(position.collateral, 0);
//         assert_eq!(position.collateral_base, 0);
//         assert_eq!(position.collateral_liq, 0);
//     });
// }