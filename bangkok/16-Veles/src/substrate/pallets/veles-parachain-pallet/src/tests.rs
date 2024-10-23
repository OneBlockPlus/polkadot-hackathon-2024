use crate::{mock::*, Error};
use frame_support::traits::Time;
use frame_support::{assert_err, assert_ok};

#[test]
fn update_vote_pass_ratio_unauthorized() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Check for Unauthorized error
        assert_err!(
            Veles::update_vote_pass_ratio(RuntimeOrigin::signed(alice()), 0, 0),
            Error::<Test>::Unauthorized
        );
    });
}

#[test]
fn update_vote_pass_ratio_ok_zero_upper_limit_part() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());
        AuthorityAccounts::<Test>::set(new_authorities);

        // Update pass ratio
        assert_ok!(Veles::update_vote_pass_ratio(
            RuntimeOrigin::signed(alice()),
            1,
            0
        ));

        let vote_pass_ratio = VotePassRatio::<Test>::get();

        // Check updated pass ratios
        assert_eq!(vote_pass_ratio.proportion_part, 0);
        assert_eq!(vote_pass_ratio.upper_limit_part, 0);
    });
}

#[test]
fn update_vote_pass_ratio_ok_portion_part_bigger_than_upper_limit_part() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());
        AuthorityAccounts::<Test>::set(new_authorities);

        // Update pass ratio
        assert_ok!(Veles::update_vote_pass_ratio(
            RuntimeOrigin::signed(alice()),
            5,
            3
        ));

        let vote_pass_ratio = VotePassRatio::<Test>::get();

        // Check updated pass ratios
        assert_eq!(vote_pass_ratio.proportion_part, 3);
        assert_eq!(vote_pass_ratio.upper_limit_part, 3);
    });
}

#[test]
fn update_vote_pass_ratio_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());
        AuthorityAccounts::<Test>::set(new_authorities);

        // Update pass ratio
        assert_ok!(Veles::update_vote_pass_ratio(
            RuntimeOrigin::signed(alice()),
            2,
            3
        ));

        let vote_pass_ratio = VotePassRatio::<Test>::get();

        // Check updated pass ratios
        assert_eq!(vote_pass_ratio.proportion_part, 2);
        assert_eq!(vote_pass_ratio.upper_limit_part, 3);
    });
}

#[test]
fn update_penalty_levels_unauthorized() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let mut new_penalty_levels = BTreeMap::<u8, BalanceOf<Test>>::new();
        new_penalty_levels.insert(0, 10000);
        new_penalty_levels.insert(1, 10000);
        new_penalty_levels.insert(2, 10000);
        new_penalty_levels.insert(3, 10000);
        new_penalty_levels.insert(4, 10000);

        // Check for Unauthorized error
        assert_err!(
            Veles::update_penalty_levels(RuntimeOrigin::signed(alice()), new_penalty_levels),
            Error::<Test>::Unauthorized
        );
    });
}

#[test]
fn update_penalty_levels_not_all_penalty_levels_have_been_submitted() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());

        AuthorityAccounts::<Test>::set(new_authorities);

        let mut new_penalty_levels = BTreeMap::<u8, BalanceOf<Test>>::new();
        new_penalty_levels.insert(0, 10000);
        new_penalty_levels.insert(1, 10000);
        new_penalty_levels.insert(2, 10000);
        new_penalty_levels.insert(3, 10000);

        // Check for NotAllPenaltyLevelsHaveBeenSubmitted error
        assert_err!(
            Veles::update_penalty_levels(RuntimeOrigin::signed(alice()), new_penalty_levels),
            Error::<Test>::NotAllPenaltyLevelsHaveBeenSubmitted
        );
    });
}

#[test]
fn update_penalty_levels_invalid_penalty_level_value() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());

        AuthorityAccounts::<Test>::set(new_authorities);

        let mut new_penalty_levels = BTreeMap::<u8, BalanceOf<Test>>::new();
        new_penalty_levels.insert(0, 9000);
        new_penalty_levels.insert(1, 12500);
        new_penalty_levels.insert(2, 25000);
        new_penalty_levels.insert(3, 35200);
        new_penalty_levels.insert(4, 35250);

        // Check for InvalidPenaltyLevelValue error
        assert_err!(
            Veles::update_penalty_levels(RuntimeOrigin::signed(alice()), new_penalty_levels),
            Error::<Test>::InvalidPenaltyLevelValue
        );
    });
}

#[test]
fn update_penalty_levels_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());

        AuthorityAccounts::<Test>::set(new_authorities);

        let mut new_penalty_levels = BTreeMap::<u8, BalanceOf<Test>>::new();
        new_penalty_levels.insert(0, 10000);
        new_penalty_levels.insert(1, 12500);
        new_penalty_levels.insert(2, 25000);
        new_penalty_levels.insert(3, 35200);
        new_penalty_levels.insert(4, 36050);

        // Successfully update penalty levels
        assert_ok!(Veles::update_penalty_levels(
            RuntimeOrigin::signed(alice()),
            new_penalty_levels
        ));

        // Check if penalty values match
        let penalty_levels = PenaltyLevels::<Test>::get();

        assert_eq!(penalty_levels[&0], BalanceOf::<Test>::from(10000u32));
        assert_eq!(penalty_levels[&1], BalanceOf::<Test>::from(12500u32));
        assert_eq!(penalty_levels[&2], BalanceOf::<Test>::from(25000u32));
        assert_eq!(penalty_levels[&3], BalanceOf::<Test>::from(35200u32));
        assert_eq!(penalty_levels[&4], BalanceOf::<Test>::from(36050u32));
    });
}

#[test]
fn update_beneficiary_splits_unauthorized() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let mut new_beneficiary_splits = BTreeMap::<u8, BalanceOf<Test>>::new();
        new_beneficiary_splits.insert(0, 5000);
        new_beneficiary_splits.insert(1, 2500);
        new_beneficiary_splits.insert(2, 2500);

        // Check for Unauthorized error
        assert_err!(
            Veles::update_beneficiary_splits(
                RuntimeOrigin::signed(alice()),
                new_beneficiary_splits
            ),
            Error::<Test>::Unauthorized
        );
    });
}

#[test]
fn update_beneficiary_splits_invalid_beneficiary_split_values() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());

        AuthorityAccounts::<Test>::set(new_authorities);

        let mut new_beneficiary_splits = BTreeMap::<u8, BalanceOf<Test>>::new();
        new_beneficiary_splits.insert(0, 5000);
        new_beneficiary_splits.insert(1, 2500);
        new_beneficiary_splits.insert(2, 2500);
        new_beneficiary_splits.insert(3, 2500);

        // Check for InvalidBeneficiarySplitValues error
        assert_err!(
            Veles::update_beneficiary_splits(
                RuntimeOrigin::signed(alice()),
                new_beneficiary_splits
            ),
            Error::<Test>::InvalidBeneficiarySplitValues
        );
    });
}

#[test]
fn update_beneficiary_splits_invalid_primary_sale_beneficiary_split() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());

        AuthorityAccounts::<Test>::set(new_authorities);

        let mut new_beneficiary_splits = BTreeMap::<u8, BalanceOf<Test>>::new();
        new_beneficiary_splits.insert(0, 5001);
        new_beneficiary_splits.insert(1, 2500);
        new_beneficiary_splits.insert(2, 2500);

        // Check for InvalidPrimarySaleBeneficiarySplit error
        assert_err!(
            Veles::update_beneficiary_splits(
                RuntimeOrigin::signed(alice()),
                new_beneficiary_splits
            ),
            Error::<Test>::InvalidPrimarySaleBeneficiarySplit
        );
    });
}

#[test]
fn update_beneficiary_splits_invalid_secondary_sale_beneficiary_split() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());

        AuthorityAccounts::<Test>::set(new_authorities);

        let mut new_beneficiary_splits = BTreeMap::<u8, BalanceOf<Test>>::new();
        new_beneficiary_splits.insert(0, 5000);
        new_beneficiary_splits.insert(1, 2500);
        new_beneficiary_splits.insert(2, 2501);

        // Check for InvalidSecondarySaleBeneficiarySplit error
        assert_err!(
            Veles::update_beneficiary_splits(
                RuntimeOrigin::signed(alice()),
                new_beneficiary_splits
            ),
            Error::<Test>::InvalidSecondarySaleBeneficiarySplit
        );
    });
}

#[test]
fn update_beneficiary_splits_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());

        AuthorityAccounts::<Test>::set(new_authorities);

        let mut new_beneficiary_splits = BTreeMap::<u8, BalanceOf<Test>>::new();
        new_beneficiary_splits.insert(0, 5000);
        new_beneficiary_splits.insert(1, 2500);
        new_beneficiary_splits.insert(2, 2500);

        // Successfully update beneficiary splits
        assert_ok!(Veles::update_beneficiary_splits(
            RuntimeOrigin::signed(alice()),
            new_beneficiary_splits
        ));

        let beneficiary_splits = BeneficiarySplits::<Test>::get();

        assert_eq!(beneficiary_splits[&0], BalanceOf::<Test>::from(5000u32));
        assert_eq!(beneficiary_splits[&1], BalanceOf::<Test>::from(2500u32));
        assert_eq!(beneficiary_splits[&2], BalanceOf::<Test>::from(2500u32));
    });
}

#[test]
fn update_time_value_unauthorized() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Check for Unauthorized error
        assert_err!(
            Veles::update_time_value(RuntimeOrigin::signed(alice()), TimeType::PenaltyTimeout, 0),
            Error::<Test>::Unauthorized
        );
    });
}

#[test]
fn update_time_value_unable_to_change_pallet_base_time() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Check for Unauthorized error
        assert_err!(
            Veles::update_time_value(RuntimeOrigin::signed(alice()), TimeType::PalletBaseTime, 0),
            Error::<Test>::Unauthorized
        );
    });
}

#[test]
fn update_time_value_invalid_timeout_value() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());
        AuthorityAccounts::<Test>::set(new_authorities);

        // Check for InvalidTimeoutValue error
        assert_err!(
            Veles::update_time_value(RuntimeOrigin::signed(alice()), TimeType::PenaltyTimeout, 0),
            Error::<Test>::InvalidTimeoutValue
        );
    });
}

#[test]
fn update_time_value_updating_to_current_value() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());
        AuthorityAccounts::<Test>::set(new_authorities);

        let block_finalization_time: u32 = 6;

        let seconds_in_year: u32 = 365 * 24 * 60 * 60;
        let seconds_in_month: u32 = 31 * 24 * 60 * 60;
        let seconds_in_week: u32 = 7 * 24 * 60 * 60;

        let blocks_in_year = seconds_in_year / block_finalization_time;
        let blocks_in_month = seconds_in_month / block_finalization_time;
        let blocks_in_week = seconds_in_week / block_finalization_time;

        // Check for UpdatingToCurrentValue error
        assert_err!(
            Veles::update_time_value(
                RuntimeOrigin::signed(alice()),
                TimeType::NumberOfBlocksYearly,
                blocks_in_year.into()
            ),
            Error::<Test>::UpdatingToCurrentValue
        );

        // Check for UpdatingToCurrentValue error
        assert_err!(
            Veles::update_time_value(
                RuntimeOrigin::signed(alice()),
                TimeType::PenaltyTimeout,
                blocks_in_month.into()
            ),
            Error::<Test>::UpdatingToCurrentValue
        );

        // Check for UpdatingToCurrentValue error
        assert_err!(
            Veles::update_time_value(
                RuntimeOrigin::signed(alice()),
                TimeType::VotingTimeout,
                blocks_in_week.into()
            ),
            Error::<Test>::UpdatingToCurrentValue
        );

        // Check for UpdatingToCurrentValue error
        assert_err!(
            Veles::update_time_value(
                RuntimeOrigin::signed(alice()),
                TimeType::SalesTimeout,
                blocks_in_week.into()
            ),
            Error::<Test>::UpdatingToCurrentValue
        );
    });
}

#[test]
fn update_time_value_ok_number_of_blocks_yearly() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());
        AuthorityAccounts::<Test>::set(new_authorities);

        // Update timeout time
        assert_ok!(Veles::update_time_value(
            RuntimeOrigin::signed(alice()),
            TimeType::NumberOfBlocksYearly,
            1
        ));

        // Check updated timeout time
        let pallet_time_values = PalletTimeValues::<Test>::get();

        assert_eq!(pallet_time_values.number_of_blocks_per_year, 1);
    });
}

#[test]
fn update_time_value_ok_penalty() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());
        AuthorityAccounts::<Test>::set(new_authorities);

        // Update timeout time
        assert_ok!(Veles::update_time_value(
            RuntimeOrigin::signed(alice()),
            TimeType::PenaltyTimeout,
            1
        ));

        // Check updated timeout time
        let pallet_time_values = PalletTimeValues::<Test>::get();

        assert_eq!(pallet_time_values.penalty_timeout, 1);
    });
}

#[test]
fn update_time_value_ok_voting() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());
        AuthorityAccounts::<Test>::set(new_authorities);

        // Update timeout time
        assert_ok!(Veles::update_time_value(
            RuntimeOrigin::signed(alice()),
            TimeType::VotingTimeout,
            1
        ));

        // Check updated timeout time
        let pallet_time_values = PalletTimeValues::<Test>::get();

        assert_eq!(pallet_time_values.voting_timeout, 1);
    });
}

#[test]
fn update_time_value_ok_sales() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());
        AuthorityAccounts::<Test>::set(new_authorities);

        // Update timeout time
        assert_ok!(Veles::update_time_value(
            RuntimeOrigin::signed(alice()),
            TimeType::SalesTimeout,
            1
        ));

        // Check updated timeout time
        let pallet_time_values = PalletTimeValues::<Test>::get();

        assert_eq!(pallet_time_values.sales_timeout, 1);
    });
}

#[test]
fn update_fee_value_unauthorized() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Check for Unauthorized error
        assert_err!(
            Veles::update_fee_value(RuntimeOrigin::signed(alice()), FeeType::TraderAccountFee, 0),
            Error::<Test>::Unauthorized
        );
    });
}

#[test]
fn update_fee_value_updating_to_current_value() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());
        AuthorityAccounts::<Test>::set(new_authorities);

        let trader_account_fee = BalanceOf::<Test>::from(100u32);
        let project_validator_account_fee = BalanceOf::<Test>::from(100u32);
        let project_owner_account_fee = BalanceOf::<Test>::from(100u32);
        let carbon_footprint_report_fee = BalanceOf::<Test>::from(300u32);
        let project_proposal_fee = BalanceOf::<Test>::from(100u32);
        let carbon_credit_batch_fee = BalanceOf::<Test>::from(50u32);
        let voting_fee = BalanceOf::<Test>::from(100u32);
        let complaint_fee = BalanceOf::<Test>::from(100u32);

        // Check for UpdatingToCurrentValue error
        assert_err!(
            Veles::update_fee_value(
                RuntimeOrigin::signed(alice()),
                FeeType::TraderAccountFee,
                trader_account_fee
            ),
            Error::<Test>::UpdatingToCurrentValue
        );

        // Check for UpdatingToCurrentValue error
        assert_err!(
            Veles::update_fee_value(
                RuntimeOrigin::signed(alice()),
                FeeType::ProjectValidatorAccountFee,
                project_validator_account_fee
            ),
            Error::<Test>::UpdatingToCurrentValue
        );

        // Check for UpdatingToCurrentValue error
        assert_err!(
            Veles::update_fee_value(
                RuntimeOrigin::signed(alice()),
                FeeType::ProjectOwnerAccountFee,
                project_owner_account_fee
            ),
            Error::<Test>::UpdatingToCurrentValue
        );

        // Check for UpdatingToCurrentValue error
        assert_err!(
            Veles::update_fee_value(
                RuntimeOrigin::signed(alice()),
                FeeType::CarbonFootprintReportFee,
                carbon_footprint_report_fee
            ),
            Error::<Test>::UpdatingToCurrentValue
        );

        // Check for UpdatingToCurrentValue error
        assert_err!(
            Veles::update_fee_value(
                RuntimeOrigin::signed(alice()),
                FeeType::ProjectProposalFee,
                project_proposal_fee
            ),
            Error::<Test>::UpdatingToCurrentValue
        );

        // Check for UpdatingToCurrentValue error
        assert_err!(
            Veles::update_fee_value(
                RuntimeOrigin::signed(alice()),
                FeeType::CarbonCreditBatchFee,
                carbon_credit_batch_fee
            ),
            Error::<Test>::UpdatingToCurrentValue
        );

        // Check for UpdatingToCurrentValue error
        assert_err!(
            Veles::update_fee_value(
                RuntimeOrigin::signed(alice()),
                FeeType::VotingFee,
                voting_fee
            ),
            Error::<Test>::UpdatingToCurrentValue
        );

        // Check for UpdatingToCurrentValue error
        assert_err!(
            Veles::update_fee_value(
                RuntimeOrigin::signed(alice()),
                FeeType::ComplaintFee,
                complaint_fee
            ),
            Error::<Test>::UpdatingToCurrentValue
        );
    });
}

#[test]
fn update_fee_value_ok_trader_account_fee() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());
        AuthorityAccounts::<Test>::set(new_authorities);

        // Update fee amount
        assert_ok!(Veles::update_fee_value(
            RuntimeOrigin::signed(alice()),
            FeeType::TraderAccountFee,
            0
        ));

        // Check updated fee amount
        let pallet_fee_values = PalletFeeValues::<Test>::get();

        assert_eq!(pallet_fee_values.trader_account_fee, 0);
    });
}

#[test]
fn update_fee_value_ok_project_validator_account_fee() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());
        AuthorityAccounts::<Test>::set(new_authorities);

        // Update fee amount
        assert_ok!(Veles::update_fee_value(
            RuntimeOrigin::signed(alice()),
            FeeType::ProjectValidatorAccountFee,
            0
        ));

        // Check updated fee amount
        let pallet_fee_values = PalletFeeValues::<Test>::get();

        assert_eq!(pallet_fee_values.project_validator_account_fee, 0);
    });
}

#[test]
fn update_fee_value_ok_project_owner_account_fee() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());
        AuthorityAccounts::<Test>::set(new_authorities);

        // Update fee amount
        assert_ok!(Veles::update_fee_value(
            RuntimeOrigin::signed(alice()),
            FeeType::ProjectOwnerAccountFee,
            0
        ));

        // Check updated fee amount
        let pallet_fee_values = PalletFeeValues::<Test>::get();

        assert_eq!(pallet_fee_values.project_owner_account_fee, 0);
    });
}

#[test]
fn update_fee_value_ok_carbon_footprint_report_fee() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());
        AuthorityAccounts::<Test>::set(new_authorities);

        // Update fee amount
        assert_ok!(Veles::update_fee_value(
            RuntimeOrigin::signed(alice()),
            FeeType::CarbonFootprintReportFee,
            0
        ));

        // Check updated fee amount
        let pallet_fee_values = PalletFeeValues::<Test>::get();

        assert_eq!(pallet_fee_values.carbon_footprint_report_fee, 0);
    });
}

#[test]
fn update_fee_value_ok_project_proposal_fee() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());
        AuthorityAccounts::<Test>::set(new_authorities);

        // Update fee amount
        assert_ok!(Veles::update_fee_value(
            RuntimeOrigin::signed(alice()),
            FeeType::ProjectProposalFee,
            0
        ));

        // Check updated fee amount
        let pallet_fee_values = PalletFeeValues::<Test>::get();

        assert_eq!(pallet_fee_values.project_proposal_fee, 0);
    });
}

#[test]
fn update_fee_value_ok_carbon_credit_batch_fee() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());
        AuthorityAccounts::<Test>::set(new_authorities);

        // Update fee amount
        assert_ok!(Veles::update_fee_value(
            RuntimeOrigin::signed(alice()),
            FeeType::CarbonCreditBatchFee,
            0
        ));

        // Check updated fee amount
        let pallet_fee_values = PalletFeeValues::<Test>::get();

        assert_eq!(pallet_fee_values.carbon_credit_batch_fee, 0);
    });
}

#[test]
fn update_fee_value_ok_voting_fee() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());
        AuthorityAccounts::<Test>::set(new_authorities);

        // Update fee amount
        assert_ok!(Veles::update_fee_value(
            RuntimeOrigin::signed(alice()),
            FeeType::VotingFee,
            0
        ));

        // Check updated fee amount
        let pallet_fee_values = PalletFeeValues::<Test>::get();

        assert_eq!(pallet_fee_values.voting_fee, 0);
    });
}

#[test]
fn update_fee_value_ok_complaint_fee() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert authority account
        let mut new_authorities = AuthorityAccounts::<Test>::get();
        new_authorities.insert(alice());
        AuthorityAccounts::<Test>::set(new_authorities);

        // Update fee amount
        assert_ok!(Veles::update_fee_value(
            RuntimeOrigin::signed(alice()),
            FeeType::ComplaintFee,
            0
        ));

        // Check updated fee amount
        let pallet_fee_values = PalletFeeValues::<Test>::get();

        assert_eq!(pallet_fee_values.complaint_fee, 0);
    });
}

#[test]
fn register_for_trader_account_account_id_already_in_use() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut new_traders = TraderAccounts::<Test>::get();
        new_traders.insert(alice());
        TraderAccounts::<Test>::set(new_traders);

        // Check for AccountIdAlreadyInUse error
        assert_err!(
            Veles::register_for_trader_account(RuntimeOrigin::signed(alice()),),
            Error::<Test>::AccountIdAlreadyInUse
        );
    });
}

#[test]
fn register_for_trader_account_user_is_active_in_carbon_footprint_report_voting_cycle() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert carbon footprint report
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");
        let carbon_footprint_report = CarbonFootprintReportInfo {
            cf_account: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            carbon_footprint_surplus: BalanceOf::<Test>::from(0u32),
            carbon_footprint_deficit: BalanceOf::<Test>::from(0u32),
            votes_for: BTreeSet::<AccountId>::new(),
            votes_against: BTreeSet::<AccountId>::new(),
            voting_active: true,
        };

        CarbonFootprintReports::<Test>::insert(documentation_ipfs, carbon_footprint_report);

        // Check for UserIsActiveInCarbonFootprintReportVotingCycle error
        assert_err!(
            Veles::register_for_trader_account(RuntimeOrigin::signed(alice())),
            Error::<Test>::UserIsActiveInCarbonFootprintReportVotingCycle
        );
    });
}

#[test]
fn register_for_trader_account_insufficient_funds() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Check for InsufficientFunds error
        assert_err!(
            Veles::register_for_trader_account(RuntimeOrigin::signed(alice())),
            Error::<Test>::InsufficientFunds
        );
    });
}

#[test]
fn register_for_trader_account_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            5000
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            0
        );

        // Successfully registed trader account
        assert_ok!(Veles::register_for_trader_account(RuntimeOrigin::signed(
            charlie()
        )));

        // Check if trader account was stored
        assert_eq!(TraderAccounts::<Test>::get().contains(&charlie()), true);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            4900
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            100
        );
    });
}

#[test]
fn register_for_project_validator_account_account_id_already_in_use() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut new_traders = TraderAccounts::<Test>::get();
        new_traders.insert(alice());
        TraderAccounts::<Test>::set(new_traders);

        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        // Check for AccountIdAlreadyInUse error
        assert_err!(
            Veles::register_for_project_validator_account(
                RuntimeOrigin::signed(alice()),
                documentation_ipfs
            ),
            Error::<Test>::AccountIdAlreadyInUse
        );
    });
}

#[test]
fn register_for_project_validator_account_user_is_active_in_carbon_footprint_report_voting_cycle() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert carbon footprint report
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");
        let carbon_footprint_report = CarbonFootprintReportInfo {
            cf_account: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            carbon_footprint_surplus: BalanceOf::<Test>::from(0u32),
            carbon_footprint_deficit: BalanceOf::<Test>::from(0u32),
            votes_for: BTreeSet::<AccountId>::new(),
            votes_against: BTreeSet::<AccountId>::new(),
            voting_active: true,
        };

        CarbonFootprintReports::<Test>::insert(documentation_ipfs.clone(), carbon_footprint_report);

        // Check for UserIsActiveInCarbonFootprintReportVotingCycle error
        assert_err!(
            Veles::register_for_project_validator_account(
                RuntimeOrigin::signed(alice()),
                documentation_ipfs
            ),
            Error::<Test>::UserIsActiveInCarbonFootprintReportVotingCycle
        );
    });
}

#[test]
fn register_for_project_validator_account_documentation_was_used_previously() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert validator
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(bob(), validator);

        // Check for DocumentationWasUsedPreviously error
        assert_err!(
            Veles::register_for_project_validator_account(
                RuntimeOrigin::signed(alice()),
                documentation_ipfs
            ),
            Error::<Test>::DocumentationWasUsedPreviously
        );
    });
}

#[test]
fn register_for_project_validator_account_insufficient_funds() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        // Check for InsufficientFunds error
        assert_err!(
            Veles::register_for_project_validator_account(
                RuntimeOrigin::signed(alice()),
                documentation_ipfs
            ),
            Error::<Test>::InsufficientFunds
        );
    });
}

#[test]
fn register_for_project_validator_account_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            5000
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            0
        );

        // Successfully registed project validator
        assert_ok!(Veles::register_for_project_validator_account(
            RuntimeOrigin::signed(charlie()),
            documentation_ipfs.clone()
        ));

        // Check if validator account was stored correctly
        let validator = Validators::<Test>::get(charlie()).unwrap();

        assert_eq!(validator.documentation_ipfs, documentation_ipfs);
        assert_eq!(validator.penalty_level, 0);
        assert_eq!(validator.penalty_timeout, 0);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            4900
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            100
        );
    });
}

#[test]
fn register_for_project_owner_account_account_id_already_in_use() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut new_traders = TraderAccounts::<Test>::get();
        new_traders.insert(alice());
        TraderAccounts::<Test>::set(new_traders);

        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        // Check for AccountIdAlreadyInUse error
        assert_err!(
            Veles::register_for_project_owner_account(
                RuntimeOrigin::signed(alice()),
                documentation_ipfs
            ),
            Error::<Test>::AccountIdAlreadyInUse
        );
    });
}

#[test]
fn register_for_project_owner_account_user_is_active_in_carbon_footprint_report_voting_cycle() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert carbon footprint report
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");
        let carbon_footprint_report = CarbonFootprintReportInfo {
            cf_account: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            carbon_footprint_surplus: BalanceOf::<Test>::from(0u32),
            carbon_footprint_deficit: BalanceOf::<Test>::from(0u32),
            votes_for: BTreeSet::<AccountId>::new(),
            votes_against: BTreeSet::<AccountId>::new(),
            voting_active: true,
        };

        CarbonFootprintReports::<Test>::insert(documentation_ipfs.clone(), carbon_footprint_report);

        // Check for UserIsActiveInCarbonFootprintReportVotingCycle error
        assert_err!(
            Veles::register_for_project_owner_account(
                RuntimeOrigin::signed(alice()),
                documentation_ipfs
            ),
            Error::<Test>::UserIsActiveInCarbonFootprintReportVotingCycle
        );
    });
}

#[test]
fn register_for_project_owner_account_documentation_was_used_previously() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert validator
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(bob(), validator);

        // Check for DocumentationWasUsedPreviously error
        assert_err!(
            Veles::register_for_project_owner_account(
                RuntimeOrigin::signed(alice()),
                documentation_ipfs
            ),
            Error::<Test>::DocumentationWasUsedPreviously
        );
    });
}

#[test]
fn register_for_project_owner_account_insufficient_funds() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        // Check for InsufficientFunds error
        assert_err!(
            Veles::register_for_project_owner_account(
                RuntimeOrigin::signed(alice()),
                documentation_ipfs
            ),
            Error::<Test>::InsufficientFunds
        );
    });
}

#[test]
fn register_for_project_owner_account_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            5000
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            0
        );

        // Successfully registed project owner
        assert_ok!(Veles::register_for_project_owner_account(
            RuntimeOrigin::signed(charlie()),
            documentation_ipfs.clone()
        ));

        // Check if tne project_owner was stored correctly
        let project_owner = ProjectOwners::<Test>::get(charlie()).unwrap();

        assert_eq!(project_owner.documentation_ipfs, documentation_ipfs);
        assert_eq!(project_owner.penalty_level, 0);
        assert_eq!(project_owner.penalty_timeout, 0);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            4900
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            100
        );
    });
}

#[test]
fn submit_carbon_footprint_report_invalid_carbon_footprint_values() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut new_traders = TraderAccounts::<Test>::get();
        new_traders.insert(alice());
        TraderAccounts::<Test>::set(new_traders);

        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");
        let carbon_footprint_surplus = BalanceOf::<Test>::from(0u32);
        let carbon_footprint_deficit = BalanceOf::<Test>::from(0u32);

        // Check for InvalidCarbonFootprintValues error
        assert_err!(
            Veles::submit_carbon_footprint_report(
                RuntimeOrigin::signed(alice()),
                documentation_ipfs,
                carbon_footprint_surplus,
                carbon_footprint_deficit,
            ),
            Error::<Test>::InvalidCarbonFootprintValues
        );
    });
}

#[test]
fn submit_carbon_footprint_report_account_id_already_in_use() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut new_traders = TraderAccounts::<Test>::get();
        new_traders.insert(alice());
        TraderAccounts::<Test>::set(new_traders);

        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");
        let carbon_footprint_surplus = BalanceOf::<Test>::from(0u32);
        let carbon_footprint_deficit = BalanceOf::<Test>::from(10u32);

        // Check for AccountIdAlreadyInUse error
        assert_err!(
            Veles::submit_carbon_footprint_report(
                RuntimeOrigin::signed(alice()),
                documentation_ipfs,
                carbon_footprint_surplus,
                carbon_footprint_deficit,
            ),
            Error::<Test>::AccountIdAlreadyInUse
        );
    });
}

#[test]
fn submit_carbon_footprint_report_user_is_active_in_carbon_footprint_report_voting_cycle() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert carbon footprint report
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");
        let carbon_footprint_report = CarbonFootprintReportInfo {
            cf_account: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            carbon_footprint_surplus: BalanceOf::<Test>::from(0u32),
            carbon_footprint_deficit: BalanceOf::<Test>::from(10u32),
            votes_for: BTreeSet::<AccountId>::new(),
            votes_against: BTreeSet::<AccountId>::new(),
            voting_active: true,
        };

        CarbonFootprintReports::<Test>::insert(documentation_ipfs.clone(), carbon_footprint_report);

        let carbon_footprint_surplus = BalanceOf::<Test>::from(0u32);
        let carbon_footprint_deficit = BalanceOf::<Test>::from(10u32);

        // Check for CarbonFootprintReportAlreadySubmitted error
        assert_err!(
            Veles::submit_carbon_footprint_report(
                RuntimeOrigin::signed(alice()),
                documentation_ipfs,
                carbon_footprint_surplus,
                carbon_footprint_deficit,
            ),
            Error::<Test>::CarbonFootprintReportAlreadySubmitted
        );
    });
}

#[test]
fn submit_carbon_footprint_report_documentation_was_used_previously() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert validator
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(bob(), validator);

        let carbon_footprint_surplus = BalanceOf::<Test>::from(0u32);
        let carbon_footprint_deficit = BalanceOf::<Test>::from(10u32);

        // Check for DocumentationWasUsedPreviously error
        assert_err!(
            Veles::submit_carbon_footprint_report(
                RuntimeOrigin::signed(alice()),
                documentation_ipfs,
                carbon_footprint_surplus,
                carbon_footprint_deficit,
            ),
            Error::<Test>::DocumentationWasUsedPreviously
        );
    });
}

#[test]
fn submit_carbon_footprint_report_insufficient_funds() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let carbon_footprint_surplus = BalanceOf::<Test>::from(0u32);
        let carbon_footprint_deficit = BalanceOf::<Test>::from(10u32);

        // Check for InsufficientFunds error
        assert_err!(
            Veles::submit_carbon_footprint_report(
                RuntimeOrigin::signed(alice()),
                documentation_ipfs,
                carbon_footprint_surplus,
                carbon_footprint_deficit,
            ),
            Error::<Test>::InsufficientFunds
        );
    });
}

#[test]
fn submit_carbon_footprint_report_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let carbon_footprint_surplus = BalanceOf::<Test>::from(0u32);
        let carbon_footprint_deficit = BalanceOf::<Test>::from(10u32);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            5000
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            0
        );

        // Successfully registed project owner
        assert_ok!(Veles::submit_carbon_footprint_report(
            RuntimeOrigin::signed(charlie()),
            documentation_ipfs.clone(),
            carbon_footprint_surplus,
            carbon_footprint_deficit,
        ));

        // Check if the carbon footprint report was stored correctly
        let report = CarbonFootprintReports::<Test>::get(documentation_ipfs.clone()).unwrap();

        assert_eq!(report.cf_account, charlie());
        assert_eq!(
            report.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );
        assert_eq!(
            report.carbon_footprint_surplus,
            BalanceOf::<Test>::from(0u32)
        );
        assert_eq!(
            report.carbon_footprint_deficit,
            BalanceOf::<Test>::from(10u32)
        );
        assert_eq!(report.votes_for, BTreeSet::<AccountIdOf<Test>>::new());
        assert_eq!(report.votes_against, BTreeSet::<AccountIdOf<Test>>::new());
        assert_eq!(report.voting_active, true);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            4700
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            300
        );
    });
}

#[test]
fn cast_vote_unauthorized() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        // Check for Unauthorized error
        assert_err!(
            Veles::cast_vote(
                RuntimeOrigin::signed(alice()),
                VoteType::ProjectProposalVote,
                documentation_ipfs,
                true
            ),
            Error::<Test>::Unauthorized
        );
    });
}

#[test]
fn cast_vote_insufficient_funds() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert validator
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(alice(), validator);

        // Check for InsufficientFunds error
        assert_err!(
            Veles::cast_vote(
                RuntimeOrigin::signed(alice()),
                VoteType::ProjectProposalVote,
                documentation_ipfs,
                true
            ),
            Error::<Test>::InsufficientFunds
        );
    });
}

#[test]
fn cast_vote_carbon_footprint_report_vote_carbon_footprint_report_not_found() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert validator
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Check for CarbonFootprintReportNotFound error
        assert_err!(
            Veles::cast_vote(
                RuntimeOrigin::signed(charlie()),
                VoteType::CarbonFootprintReportVote,
                documentation_ipfs,
                true
            ),
            Error::<Test>::CarbonFootprintReportNotFound
        );
    });
}

#[test]
fn cast_vote_carbon_footprint_report_vote_voting_cycle_is_over() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert validator
        let validator_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("validator_documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Insert carbon footprint report
        let report_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("report_documentation_ipfs");

        let report = CarbonFootprintReportInfo {
            cf_account: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            carbon_footprint_surplus: BalanceOf::<Test>::from(0u32),
            carbon_footprint_deficit: BalanceOf::<Test>::from(0u32),
            votes_for: BTreeSet::<AccountId>::new(),
            votes_against: BTreeSet::<AccountId>::new(),
            voting_active: false,
        };

        CarbonFootprintReports::<Test>::insert(report_documentation_ipfs.clone(), report);

        // Check for VotingCycleIsOver error
        assert_err!(
            Veles::cast_vote(
                RuntimeOrigin::signed(charlie()),
                VoteType::CarbonFootprintReportVote,
                report_documentation_ipfs,
                true
            ),
            Error::<Test>::VotingCycleIsOver
        );
    });
}

#[test]
fn cast_vote_carbon_footprint_report_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert validator
        let validator_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("validator_documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Insert carbon footprint report
        let report_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("report_documentation_ipfs");

        let report = CarbonFootprintReportInfo {
            cf_account: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            carbon_footprint_surplus: BalanceOf::<Test>::from(0u32),
            carbon_footprint_deficit: BalanceOf::<Test>::from(0u32),
            votes_for: BTreeSet::<AccountId>::new(),
            votes_against: BTreeSet::<AccountId>::new(),
            voting_active: true,
        };

        CarbonFootprintReports::<Test>::insert(report_documentation_ipfs.clone(), report);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            5000
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            0
        );

        // Successfully cast vote
        assert_ok!(Veles::cast_vote(
            RuntimeOrigin::signed(charlie()),
            VoteType::CarbonFootprintReportVote,
            report_documentation_ipfs.clone(),
            true
        ));

        // Check if the report was updated
        let report =
            CarbonFootprintReports::<Test>::get(report_documentation_ipfs.clone()).unwrap();

        assert_eq!(report.cf_account, alice());
        assert_eq!(
            report.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );
        assert_eq!(
            report.carbon_footprint_surplus,
            BalanceOf::<Test>::from(0u32)
        );
        assert_eq!(
            report.carbon_footprint_deficit,
            BalanceOf::<Test>::from(0u32)
        );
        assert_eq!(report.votes_for.len(), 1);
        assert_eq!(report.votes_for.contains(&charlie()), true);
        assert_eq!(report.votes_against, BTreeSet::<AccountIdOf<Test>>::new());
        assert_eq!(report.voting_active, true);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            4900
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            100
        );
    });
}

#[test]
fn cast_vote_carbon_footprint_report_vote_already_submitted() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert validator
        let validator_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("validator_documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Insert carbon footprint report
        let report_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("report_documentation_ipfs");

        let report = CarbonFootprintReportInfo {
            cf_account: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            carbon_footprint_surplus: BalanceOf::<Test>::from(0u32),
            carbon_footprint_deficit: BalanceOf::<Test>::from(0u32),
            votes_for: BTreeSet::<AccountId>::new(),
            votes_against: BTreeSet::<AccountId>::new(),
            voting_active: true,
        };

        CarbonFootprintReports::<Test>::insert(report_documentation_ipfs.clone(), report);

        // Successfully cast vote
        assert_ok!(Veles::cast_vote(
            RuntimeOrigin::signed(charlie()),
            VoteType::CarbonFootprintReportVote,
            report_documentation_ipfs.clone(),
            true
        ));

        // Check for VoteAlreadySubmitted error
        assert_err!(
            Veles::cast_vote(
                RuntimeOrigin::signed(charlie()),
                VoteType::CarbonFootprintReportVote,
                report_documentation_ipfs,
                true
            ),
            Error::<Test>::VoteAlreadySubmitted
        );
    });
}

#[test]
fn cast_vote_project_proposal_vote_project_proposal_not_found() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert validator
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Check for ProjectProposalNotFound error
        assert_err!(
            Veles::cast_vote(
                RuntimeOrigin::signed(charlie()),
                VoteType::ProjectProposalVote,
                documentation_ipfs,
                true
            ),
            Error::<Test>::ProjectProposalNotFound
        );
    });
}

#[test]
fn cast_vote_project_proposal_vote_voting_cycle_is_over() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert validator
        let validator_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("validator_documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Insert project proposal
        let proposal_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("proposal_documentation_ipfs");

        let proposal = ProjectProposalInfo {
            project_owner: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            project_hash: generate_hash(alice()),
            votes_for: BTreeSet::<AccountId>::new(),
            votes_against: BTreeSet::<AccountId>::new(),
            voting_active: false,
        };

        ProjectProposals::<Test>::insert(proposal_documentation_ipfs.clone(), proposal);

        // Check for VotingCycleIsOver error
        assert_err!(
            Veles::cast_vote(
                RuntimeOrigin::signed(charlie()),
                VoteType::ProjectProposalVote,
                proposal_documentation_ipfs,
                true
            ),
            Error::<Test>::VotingCycleIsOver
        );
    });
}

#[test]
fn cast_vote_project_proposal_vote_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert validator
        let validator_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("validator_documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Insert project proposal
        let proposal_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("proposal_documentation_ipfs");
        let project_hash = generate_hash(alice());

        let proposal = ProjectProposalInfo {
            project_owner: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            project_hash,
            votes_for: BTreeSet::<AccountId>::new(),
            votes_against: BTreeSet::<AccountId>::new(),
            voting_active: true,
        };

        ProjectProposals::<Test>::insert(proposal_documentation_ipfs.clone(), proposal);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            5000
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            0
        );

        // Successfully cast vote
        assert_ok!(Veles::cast_vote(
            RuntimeOrigin::signed(charlie()),
            VoteType::ProjectProposalVote,
            proposal_documentation_ipfs.clone(),
            true
        ));

        // Check if the proposal was updated
        let proposal = ProjectProposals::<Test>::get(proposal_documentation_ipfs.clone()).unwrap();

        assert_eq!(proposal.project_owner, alice());
        assert_eq!(
            proposal.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );
        assert_eq!(proposal.project_hash, project_hash);
        assert_eq!(proposal.votes_for.len(), 1);
        assert_eq!(proposal.votes_for.contains(&charlie()), true);
        assert_eq!(proposal.votes_against, BTreeSet::<AccountIdOf<Test>>::new());
        assert_eq!(proposal.voting_active, true);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            4900
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            100
        );
    });
}

#[test]
fn cast_vote_project_proposal_vote_already_submitted() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert validator
        let validator_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("validator_documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Insert project proposal
        let proposal_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("proposal_documentation_ipfs");
        let project_hash = generate_hash(alice());

        let proposal = ProjectProposalInfo {
            project_owner: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            project_hash,
            votes_for: BTreeSet::<AccountId>::new(),
            votes_against: BTreeSet::<AccountId>::new(),
            voting_active: true,
        };

        ProjectProposals::<Test>::insert(proposal_documentation_ipfs.clone(), proposal);

        // Successfully cast vote
        assert_ok!(Veles::cast_vote(
            RuntimeOrigin::signed(charlie()),
            VoteType::ProjectProposalVote,
            proposal_documentation_ipfs.clone(),
            true
        ));

        // Check for VoteAlreadySubmitted error
        assert_err!(
            Veles::cast_vote(
                RuntimeOrigin::signed(charlie()),
                VoteType::ProjectProposalVote,
                proposal_documentation_ipfs.clone(),
                true
            ),
            Error::<Test>::VoteAlreadySubmitted
        );
    });
}

#[test]
fn cast_vote_carbon_credit_batch_vote_carbon_credit_batch_proposal_not_found() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert validator
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Check for CarbonCreditBatchProposalNotFound error
        assert_err!(
            Veles::cast_vote(
                RuntimeOrigin::signed(charlie()),
                VoteType::CarbonCreditBatchVote,
                documentation_ipfs,
                true
            ),
            Error::<Test>::CarbonCreditBatchProposalNotFound
        );
    });
}

#[test]
fn cast_vote_carbon_credit_batch_vote_voting_cycle_is_over() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert carbon credit batch proposal
        let proposal_ipfs = BoundedString::<IPFSLength>::truncate_from("proposal_ipfs");

        let project_hash = generate_hash(bob());
        let batch_hash = generate_hash(alice());

        let proposal = CarbonCreditBatchProposalInfo {
            project_hash,
            batch_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: 0u32.into(),
            penalty_repay_price: 0u32.into(),
            votes_for: BTreeSet::<AccountId>::new(),
            votes_against: BTreeSet::<AccountId>::new(),
            voting_active: false,
        };

        CarbonCreditBatchProposals::<Test>::insert(proposal_ipfs.clone(), proposal);

        // Insert validator
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Check for VotingCycleIsOver error
        assert_err!(
            Veles::cast_vote(
                RuntimeOrigin::signed(charlie()),
                VoteType::CarbonCreditBatchVote,
                proposal_ipfs,
                true
            ),
            Error::<Test>::VotingCycleIsOver
        );
    });
}

#[test]
fn cast_vote_carbon_credit_batch_vote_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert carbon credit batch proposal
        let proposal_ipfs = BoundedString::<IPFSLength>::truncate_from("proposal_ipfs");

        let project_hash = generate_hash(bob());
        let batch_hash = generate_hash(alice());

        let proposal = CarbonCreditBatchProposalInfo {
            project_hash,
            batch_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: 0u32.into(),
            penalty_repay_price: 0u32.into(),
            votes_for: BTreeSet::<AccountId>::new(),
            votes_against: BTreeSet::<AccountId>::new(),
            voting_active: true,
        };

        CarbonCreditBatchProposals::<Test>::insert(proposal_ipfs.clone(), proposal);

        // Insert validator
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            5000
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            0
        );

        // Successfully cast vote
        assert_ok!(Veles::cast_vote(
            RuntimeOrigin::signed(charlie()),
            VoteType::CarbonCreditBatchVote,
            proposal_ipfs.clone(),
            true
        ));

        // Check if the proposal was updated
        let proposal = CarbonCreditBatchProposals::<Test>::get(proposal_ipfs.clone()).unwrap();

        assert_eq!(proposal.project_hash, project_hash);
        assert_eq!(proposal.batch_hash, batch_hash);
        assert_eq!(
            proposal.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );
        assert_eq!(proposal.credit_amount, 0u32.into());
        assert_eq!(proposal.penalty_repay_price, 0u32.into());
        assert_eq!(proposal.votes_for.len(), 1);
        assert_eq!(proposal.votes_for.contains(&charlie()), true);
        assert_eq!(proposal.votes_against, BTreeSet::<AccountIdOf<Test>>::new());
        assert_eq!(proposal.voting_active, true);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            4900
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            100
        );
    });
}

#[test]
fn cast_vote_carbon_credit_batch_vote_vote_already_submitted() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert carbon credit batch proposal
        let proposal_ipfs = BoundedString::<IPFSLength>::truncate_from("proposal_ipfs");

        let project_hash = generate_hash(bob());
        let batch_hash = generate_hash(alice());

        let proposal = CarbonCreditBatchProposalInfo {
            project_hash,
            batch_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: 0u32.into(),
            penalty_repay_price: 0u32.into(),
            votes_for: BTreeSet::<AccountId>::new(),
            votes_against: BTreeSet::<AccountId>::new(),
            voting_active: true,
        };

        CarbonCreditBatchProposals::<Test>::insert(proposal_ipfs.clone(), proposal);

        // Insert validator
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            5000
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            0
        );

        // Successfully cast vote
        assert_ok!(Veles::cast_vote(
            RuntimeOrigin::signed(charlie()),
            VoteType::CarbonCreditBatchVote,
            proposal_ipfs.clone(),
            true
        ));

        // Check for VoteAlreadySubmitted error
        assert_err!(
            Veles::cast_vote(
                RuntimeOrigin::signed(charlie()),
                VoteType::CarbonCreditBatchVote,
                proposal_ipfs.clone(),
                true
            ),
            Error::<Test>::VoteAlreadySubmitted
        );
    });
}

#[test]
fn cast_vote_complaint_vote_complaint_not_found() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert validator
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Check for ComplaintNotFound error
        assert_err!(
            Veles::cast_vote(
                RuntimeOrigin::signed(charlie()),
                VoteType::ComplaintVote,
                documentation_ipfs,
                true
            ),
            Error::<Test>::ComplaintNotFound
        );
    });
}

#[test]
fn cast_vote_complaint_accounts_voting_cycle_is_over() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert complaint for account type
        let complaint_ipfs = BoundedString::<IPFSLength>::truncate_from("complaint_ipfs");

        let complaint = ComplaintAccountBasedInfo {
            complaint_proposer: alice(),
            complaint_type: ComplaintType::ValidatorComplaint,
            complaint_for: bob(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            votes_for: BTreeSet::<AccountIdOf<Test>>::new(),
            votes_against: BTreeSet::<AccountIdOf<Test>>::new(),
            complaint_active: false,
        };

        ComplaintsForAccounts::<Test>::insert(complaint_ipfs.clone(), complaint);

        // Insert validator
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Check for VotingCycleIsOver error
        assert_err!(
            Veles::cast_vote(
                RuntimeOrigin::signed(charlie()),
                VoteType::ComplaintVote,
                complaint_ipfs,
                true
            ),
            Error::<Test>::VotingCycleIsOver
        );
    });
}

#[test]
fn cast_vote_complaint_accounts_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert complaint for account type
        let complaint_ipfs = BoundedString::<IPFSLength>::truncate_from("complaint_ipfs");

        let complaint = ComplaintAccountBasedInfo {
            complaint_proposer: alice(),
            complaint_type: ComplaintType::ValidatorComplaint,
            complaint_for: bob(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            votes_for: BTreeSet::<AccountIdOf<Test>>::new(),
            votes_against: BTreeSet::<AccountIdOf<Test>>::new(),
            complaint_active: true,
        };

        ComplaintsForAccounts::<Test>::insert(complaint_ipfs.clone(), complaint);

        // Insert validator
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            5000
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            0
        );

        // Successfully cast vote
        assert_ok!(Veles::cast_vote(
            RuntimeOrigin::signed(charlie()),
            VoteType::ComplaintVote,
            complaint_ipfs.clone(),
            true
        ));

        // Check if the complaint was updated
        let complaint = ComplaintsForAccounts::<Test>::get(complaint_ipfs).unwrap();

        assert_eq!(complaint.complaint_for, bob());
        assert_eq!(complaint.complaint_type, ComplaintType::ValidatorComplaint);
        assert_eq!(
            complaint.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );
        assert_eq!(complaint.complaint_proposer, alice());
        assert_eq!(complaint.votes_for.len(), 1);
        assert_eq!(complaint.votes_for.contains(&charlie()), true);
        assert_eq!(
            complaint.votes_against,
            BTreeSet::<AccountIdOf<Test>>::new()
        );
        assert_eq!(complaint.complaint_active, true);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            4900
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            100
        );
    });
}

#[test]
fn cast_vote_complaint_accounts_vote_already_submitted() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert complaint for account type
        let complaint_ipfs = BoundedString::<IPFSLength>::truncate_from("complaint_ipfs");

        let complaint = ComplaintAccountBasedInfo {
            complaint_proposer: alice(),
            complaint_type: ComplaintType::ValidatorComplaint,
            complaint_for: bob(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            votes_for: BTreeSet::<AccountIdOf<Test>>::new(),
            votes_against: BTreeSet::<AccountIdOf<Test>>::new(),
            complaint_active: true,
        };

        ComplaintsForAccounts::<Test>::insert(complaint_ipfs.clone(), complaint);

        // Insert validator
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Successfully cast vote
        assert_ok!(Veles::cast_vote(
            RuntimeOrigin::signed(charlie()),
            VoteType::ComplaintVote,
            complaint_ipfs.clone(),
            true
        ));

        // Check for VoteAlreadySubmitted error
        assert_err!(
            Veles::cast_vote(
                RuntimeOrigin::signed(charlie()),
                VoteType::ComplaintVote,
                complaint_ipfs.clone(),
                true
            ),
            Error::<Test>::VoteAlreadySubmitted
        );
    });
}

#[test]
fn cast_vote_complaint_hashes_voting_cycle_is_over() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert complaint for account type
        let complaint_ipfs = BoundedString::<IPFSLength>::truncate_from("complaint_ipfs");
        let complaint_for_hash = generate_hash(bob());

        let complaint = ComplaintHashBasedInfo {
            complaint_proposer: alice(),
            complaint_type: ComplaintType::ProjectComplaint,
            complaint_for: complaint_for_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            votes_for: BTreeSet::<AccountIdOf<Test>>::new(),
            votes_against: BTreeSet::<AccountIdOf<Test>>::new(),
            complaint_active: false,
        };

        ComplaintsForHashes::<Test>::insert(complaint_ipfs.clone(), complaint);

        // Insert validator
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Check for VotingCycleIsOver error
        assert_err!(
            Veles::cast_vote(
                RuntimeOrigin::signed(charlie()),
                VoteType::ComplaintVote,
                complaint_ipfs,
                true
            ),
            Error::<Test>::VotingCycleIsOver
        );
    });
}

#[test]
fn cast_vote_complaint_hashes_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert complaint for account type
        let complaint_ipfs = BoundedString::<IPFSLength>::truncate_from("complaint_ipfs");
        let complaint_for_hash = generate_hash(bob());

        let complaint = ComplaintHashBasedInfo {
            complaint_proposer: alice(),
            complaint_type: ComplaintType::ProjectComplaint,
            complaint_for: complaint_for_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            votes_for: BTreeSet::<AccountIdOf<Test>>::new(),
            votes_against: BTreeSet::<AccountIdOf<Test>>::new(),
            complaint_active: true,
        };

        ComplaintsForHashes::<Test>::insert(complaint_ipfs.clone(), complaint);

        // Insert validator
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            5000
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            0
        );

        // Successfully cast vote
        assert_ok!(Veles::cast_vote(
            RuntimeOrigin::signed(charlie()),
            VoteType::ComplaintVote,
            complaint_ipfs.clone(),
            true
        ));

        // Check if the complaint was updated
        let complaint = ComplaintsForHashes::<Test>::get(complaint_ipfs).unwrap();

        assert_eq!(complaint.complaint_for, complaint_for_hash);
        assert_eq!(complaint.complaint_type, ComplaintType::ProjectComplaint);
        assert_eq!(
            complaint.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );
        assert_eq!(complaint.complaint_proposer, alice());
        assert_eq!(complaint.votes_for.len(), 1);
        assert_eq!(complaint.votes_for.contains(&charlie()), true);
        assert_eq!(
            complaint.votes_against,
            BTreeSet::<AccountIdOf<Test>>::new()
        );
        assert_eq!(complaint.complaint_active, true);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            4900
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            100
        );
    });
}

#[test]
fn cast_vote_complaint_hashes_vote_already_submitted() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert complaint for account type
        let complaint_ipfs = BoundedString::<IPFSLength>::truncate_from("complaint_ipfs");
        let complaint_for_hash = generate_hash(bob());

        let complaint = ComplaintHashBasedInfo {
            complaint_proposer: alice(),
            complaint_type: ComplaintType::ProjectComplaint,
            complaint_for: complaint_for_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            votes_for: BTreeSet::<AccountIdOf<Test>>::new(),
            votes_against: BTreeSet::<AccountIdOf<Test>>::new(),
            complaint_active: true,
        };

        ComplaintsForHashes::<Test>::insert(complaint_ipfs.clone(), complaint);

        // Insert validator
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(charlie(), validator);

        // Successfully cast vote
        assert_ok!(Veles::cast_vote(
            RuntimeOrigin::signed(charlie()),
            VoteType::ComplaintVote,
            complaint_ipfs.clone(),
            true
        ));

        // Check for VoteAlreadySubmitted error
        assert_err!(
            Veles::cast_vote(
                RuntimeOrigin::signed(charlie()),
                VoteType::ComplaintVote,
                complaint_ipfs.clone(),
                true
            ),
            Error::<Test>::VoteAlreadySubmitted
        );
    });
}

#[test]
fn propose_project_unauthorized() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        // Check for Unauthorized error
        assert_err!(
            Veles::propose_project(RuntimeOrigin::signed(alice()), documentation_ipfs,),
            Error::<Test>::Unauthorized
        );
    });
}

#[test]
fn propose_project_project_owner_has_standing_debts() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(alice(), project_owner);

        // Insert project owner debts
        let mut debts = BTreeMap::<AccountIdOf<Test>, BalanceOf<Test>>::new();

        debts.insert(bob(), BalanceOf::<Test>::from(10u32));
        debts.insert(charlie(), BalanceOf::<Test>::from(20u32));

        ProjectOwnerDebts::<Test>::insert(alice(), debts);

        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        // Check for ProjectOwnerHasStandingDebts error
        assert_err!(
            Veles::propose_project(RuntimeOrigin::signed(alice()), documentation_ipfs,),
            Error::<Test>::ProjectOwnerHasStandingDebts
        );
    });
}

#[test]
fn propose_project_project_proposal_already_exists() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(alice(), project_owner);

        // Insert project proposal
        let proposal_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("proposal_documentation_ipfs");

        let project_hash = generate_hash(alice());

        let proposal = ProjectProposalInfo {
            project_owner: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            project_hash,
            votes_for: BTreeSet::<AccountIdOf<Test>>::new(),
            votes_against: BTreeSet::<AccountIdOf<Test>>::new(),
            voting_active: true,
        };

        ProjectProposals::<Test>::insert(proposal_documentation_ipfs.clone(), proposal);

        // Check for ProjectProposalAlreadyExists error
        assert_err!(
            Veles::propose_project(RuntimeOrigin::signed(alice()), proposal_documentation_ipfs,),
            Error::<Test>::ProjectProposalAlreadyExists
        );
    });
}

#[test]
fn propose_project_documentation_was_used_previously() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(alice(), project_owner);

        // Check for DocumentationWasUsedPreviously error
        assert_err!(
            Veles::propose_project(RuntimeOrigin::signed(alice()), owner_documentation_ipfs,),
            Error::<Test>::DocumentationWasUsedPreviously
        );
    });
}

#[test]
fn propose_project_insufficient_funds() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(alice(), project_owner);

        let proposal_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("proposal_documentation_ipfs");

        // Check for InsufficientFunds error
        assert_err!(
            Veles::propose_project(RuntimeOrigin::signed(alice()), proposal_documentation_ipfs,),
            Error::<Test>::InsufficientFunds
        );
    });
}

#[test]
fn propose_project_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(charlie(), project_owner);

        let proposal_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("proposal_documentation_ipfs");

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            5000
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            0
        );

        // Successfully propose project
        assert_ok!(Veles::propose_project(
            RuntimeOrigin::signed(charlie()),
            proposal_documentation_ipfs.clone(),
        ));

        // Check saved proposal data
        let project_hash = generate_hash(charlie());

        let proposal = ProjectProposals::<Test>::get(proposal_documentation_ipfs.clone()).unwrap();

        assert_eq!(proposal.project_owner, charlie());
        assert_eq!(
            proposal.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );
        assert_eq!(proposal.project_hash, project_hash);
        assert_eq!(proposal.votes_for, BTreeSet::<AccountIdOf<Test>>::new());
        assert_eq!(proposal.votes_against, BTreeSet::<AccountIdOf<Test>>::new());
        assert_eq!(proposal.voting_active, true);

        // Check voting timeout data
        let current_block = frame_system::Pallet::<Test>::block_number();
        let timeout_block = current_block + PalletTimeValues::<Test>::get().voting_timeout;

        let timeout_events = VotingTimeouts::<Test>::get(timeout_block).unwrap();

        assert_eq!(timeout_events.len(), 1);
        assert_eq!(timeout_events.contains(&proposal_documentation_ipfs), true);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            4900
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            100
        );
    });
}

#[test]
fn propose_carbon_credit_batch_unauthorized() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let project_hash = generate_hash(alice());
        let credit_amount = BalanceOf::<Test>::from(0u32);
        let penalty_repay_price = BalanceOf::<Test>::from(0u32);
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        // Check for Unauthorized error
        assert_err!(
            Veles::propose_carbon_credit_batch(
                RuntimeOrigin::signed(alice()),
                project_hash,
                credit_amount,
                penalty_repay_price,
                documentation_ipfs
            ),
            Error::<Test>::Unauthorized
        );
    });
}

#[test]
fn propose_carbon_credit_batch_project_owner_has_standing_debts() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let project_hash = generate_hash(alice());
        let credit_amount = BalanceOf::<Test>::from(0u32);
        let penalty_repay_price = BalanceOf::<Test>::from(0u32);
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(alice(), project_owner);

        // Insert project owner debts
        let mut debts = BTreeMap::<AccountIdOf<Test>, BalanceOf<Test>>::new();

        debts.insert(bob(), BalanceOf::<Test>::from(10u32));
        debts.insert(charlie(), BalanceOf::<Test>::from(20u32));

        ProjectOwnerDebts::<Test>::insert(alice(), debts);

        // Check for ProjectOwnerHasStandingDebts error
        assert_err!(
            Veles::propose_carbon_credit_batch(
                RuntimeOrigin::signed(alice()),
                project_hash,
                credit_amount,
                penalty_repay_price,
                documentation_ipfs
            ),
            Error::<Test>::ProjectOwnerHasStandingDebts
        );
    });
}

#[test]
fn propose_carbon_credit_batch_invalid_penalty_price_value() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let project_hash = generate_hash(alice());
        let credit_amount = BalanceOf::<Test>::from(0u32);
        let penalty_repay_price = BalanceOf::<Test>::from(0u32);
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(alice(), project_owner);

        // Check for InvalidPenaltyPriceValue error
        assert_err!(
            Veles::propose_carbon_credit_batch(
                RuntimeOrigin::signed(alice()),
                project_hash,
                credit_amount,
                penalty_repay_price,
                documentation_ipfs
            ),
            Error::<Test>::InvalidPenaltyPriceValue
        );
    });
}

#[test]
fn propose_carbon_credit_batch_project_doesnt_exist() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let project_hash = generate_hash(alice());
        let credit_amount = BalanceOf::<Test>::from(0u32);
        let penalty_repay_price = BalanceOf::<Test>::from(1u32);
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(alice(), project_owner);

        // Check for ProjectDoesntExist error
        assert_err!(
            Veles::propose_carbon_credit_batch(
                RuntimeOrigin::signed(alice()),
                project_hash,
                credit_amount,
                penalty_repay_price,
                documentation_ipfs
            ),
            Error::<Test>::ProjectDoesntExist
        );
    });
}

#[test]
fn propose_carbon_credit_batch_unauthorized_project_owner() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let project_hash = generate_hash(alice());
        let credit_amount = BalanceOf::<Test>::from(0u32);
        let penalty_repay_price = BalanceOf::<Test>::from(1u32);
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(alice(), project_owner);

        // Insert project
        let project_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("project_documentation_ipfs");

        let project = ProjectInfo {
            documentation_ipfs: project_documentation_ipfs,
            project_owner: bob(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Projects::<Test>::insert(project_hash, project);

        // Check for Unauthorized error
        assert_err!(
            Veles::propose_carbon_credit_batch(
                RuntimeOrigin::signed(alice()),
                project_hash,
                credit_amount,
                penalty_repay_price,
                documentation_ipfs
            ),
            Error::<Test>::Unauthorized
        );
    });
}

#[test]
fn propose_carbon_credit_batch_documentation_was_used_previously() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let project_hash = generate_hash(alice());
        let credit_amount = BalanceOf::<Test>::from(0u32);
        let penalty_repay_price = BalanceOf::<Test>::from(1u32);

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(alice(), project_owner);

        // Insert project
        let project_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("project_documentation_ipfs");

        let project = ProjectInfo {
            documentation_ipfs: project_documentation_ipfs,
            project_owner: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Projects::<Test>::insert(project_hash, project);

        // Check for DocumentationWasUsedPreviously error
        assert_err!(
            Veles::propose_carbon_credit_batch(
                RuntimeOrigin::signed(alice()),
                project_hash,
                credit_amount,
                penalty_repay_price,
                owner_documentation_ipfs,
            ),
            Error::<Test>::DocumentationWasUsedPreviously
        );
    });
}

#[test]
fn propose_carbon_credit_batch_insufficient_funds() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let project_hash = generate_hash(alice());
        let credit_amount = BalanceOf::<Test>::from(0u32);
        let penalty_repay_price = BalanceOf::<Test>::from(1u32);
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(alice(), project_owner);

        // Insert project
        let project_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("project_documentation_ipfs");

        let project = ProjectInfo {
            documentation_ipfs: project_documentation_ipfs,
            project_owner: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Projects::<Test>::insert(project_hash, project);

        // Check for InsufficientFunds error
        assert_err!(
            Veles::propose_carbon_credit_batch(
                RuntimeOrigin::signed(alice()),
                project_hash,
                credit_amount,
                penalty_repay_price,
                documentation_ipfs
            ),
            Error::<Test>::InsufficientFunds
        );
    });
}

#[test]
fn propose_carbon_credit_batch_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let project_hash = generate_hash(charlie());
        let credit_amount = BalanceOf::<Test>::from(0u32);
        let penalty_repay_price = BalanceOf::<Test>::from(1u32);
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(charlie(), project_owner);

        // Insert project
        let project_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("project_documentation_ipfs");

        let project = ProjectInfo {
            documentation_ipfs: project_documentation_ipfs,
            project_owner: charlie(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Projects::<Test>::insert(project_hash, project);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            5000
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            0
        );

        // Successfully propose carbon credit batch
        assert_ok!(Veles::propose_carbon_credit_batch(
            RuntimeOrigin::signed(charlie()),
            project_hash,
            credit_amount,
            penalty_repay_price,
            documentation_ipfs.clone()
        ));

        // Check saved proposal data
        let batch_hash = generate_hash(charlie());

        let proposal = CarbonCreditBatchProposals::<Test>::get(documentation_ipfs.clone()).unwrap();

        assert_eq!(proposal.project_hash, project_hash);
        assert_eq!(proposal.batch_hash, batch_hash);
        assert_eq!(
            proposal.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );
        assert_eq!(proposal.credit_amount, BalanceOf::<Test>::from(0u32));
        assert_eq!(proposal.penalty_repay_price, BalanceOf::<Test>::from(1u32));
        assert_eq!(proposal.votes_for, BTreeSet::<AccountIdOf<Test>>::new());
        assert_eq!(proposal.votes_against, BTreeSet::<AccountIdOf<Test>>::new());
        assert_eq!(proposal.voting_active, true);

        // Check voting timeout data
        let current_block = frame_system::Pallet::<Test>::block_number();
        let timeout_block = current_block + PalletTimeValues::<Test>::get().voting_timeout;

        let timeout_events = VotingTimeouts::<Test>::get(timeout_block).unwrap();

        assert_eq!(timeout_events.len(), 1);
        assert_eq!(timeout_events.contains(&documentation_ipfs), true);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            4950
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            50
        );
    });
}

#[test]
fn create_sale_order_user_is_not_eligible_for_carbon_credit_transactions() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let batch_hash = generate_hash(alice());
        let credit_price = BalanceOf::<Test>::from(0u32);
        let credit_amount = BalanceOf::<Test>::from(0u32);

        // Check for UserIsNotEligibleForCarbonCreditTransactions error
        assert_err!(
            Veles::create_sale_order(
                RuntimeOrigin::signed(alice()),
                batch_hash,
                credit_price,
                credit_amount,
            ),
            Error::<Test>::UserIsNotEligibleForCarbonCreditTransactions
        );
    });
}

#[test]
fn create_sale_order_project_owner_has_standing_debtst() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut traders = BTreeSet::<AccountId>::new();
        traders.insert(alice());

        TraderAccounts::<Test>::set(traders);

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(alice(), project_owner);

        // Insert project owner debts
        let mut debts = BTreeMap::<AccountIdOf<Test>, BalanceOf<Test>>::new();

        debts.insert(bob(), BalanceOf::<Test>::from(10u32));
        debts.insert(charlie(), BalanceOf::<Test>::from(20u32));

        ProjectOwnerDebts::<Test>::insert(alice(), debts);

        let batch_hash = generate_hash(alice());
        let credit_price = BalanceOf::<Test>::from(0u32);
        let credit_amount = BalanceOf::<Test>::from(0u32);

        // Check for ProjectOwnerHasStandingDebts error
        assert_err!(
            Veles::create_sale_order(
                RuntimeOrigin::signed(alice()),
                batch_hash,
                credit_price,
                credit_amount,
            ),
            Error::<Test>::ProjectOwnerHasStandingDebts
        );
    });
}

#[test]
fn create_sale_order_invalid_carbon_credit_amount() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut traders = BTreeSet::<AccountId>::new();
        traders.insert(alice());

        TraderAccounts::<Test>::set(traders);

        let batch_hash = generate_hash(alice());
        let credit_price = BalanceOf::<Test>::from(0u32);
        let credit_amount = BalanceOf::<Test>::from(0u32);

        // Check for InvalidCarbonCreditAmount error
        assert_err!(
            Veles::create_sale_order(
                RuntimeOrigin::signed(alice()),
                batch_hash,
                credit_price,
                credit_amount,
            ),
            Error::<Test>::InvalidCarbonCreditAmount
        );
    });
}

#[test]
fn create_sale_order_carbon_credit_batch_does_not_exist() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut traders = BTreeSet::<AccountId>::new();
        traders.insert(alice());

        TraderAccounts::<Test>::set(traders);

        let batch_hash = generate_hash(alice());
        let credit_price = BalanceOf::<Test>::from(0u32);
        let credit_amount = BalanceOf::<Test>::from(1u32);

        // Check for InvalidCarbonCreditAmount error
        assert_err!(
            Veles::create_sale_order(
                RuntimeOrigin::signed(alice()),
                batch_hash,
                credit_price,
                credit_amount,
            ),
            Error::<Test>::CarbonCreditBatchDoesNotExist
        );
    });
}

#[test]
fn create_sale_order_carbon_credit_batch_is_not_active() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut traders = BTreeSet::<AccountId>::new();
        traders.insert(alice());

        TraderAccounts::<Test>::set(traders);

        // Insert carbon credit batch
        let batch_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("batch_documentation_ipfs");

        let project_hash = generate_hash(bob());

        let batch = CarbonCreditBatchInfo {
            documentation_ipfs: batch_documentation_ipfs,
            project_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: BalanceOf::<Test>::from(1u32),
            penalty_repay_price: BalanceOf::<Test>::from(1u32),
            status: CarbonCreditBatchStatus::Frozen,
            validator_benefactors: BTreeSet::<AccountIdOf<Test>>::new(),
        };

        let batch_hash = generate_hash(alice());

        CarbonCreditBatches::<Test>::insert(batch_hash, batch);

        let credit_price = BalanceOf::<Test>::from(0u32);
        let credit_amount = BalanceOf::<Test>::from(1u32);

        // Check for CarbonCreditBatchIsNotActive error
        assert_err!(
            Veles::create_sale_order(
                RuntimeOrigin::signed(alice()),
                batch_hash,
                credit_price,
                credit_amount,
            ),
            Error::<Test>::CarbonCreditBatchIsNotActive
        );
    });
}

#[test]
fn create_sale_order_carbon_credit_holdings_dont_exist() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut traders = BTreeSet::<AccountId>::new();
        traders.insert(alice());

        TraderAccounts::<Test>::set(traders);

        // Insert carbon credit batch
        let batch_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("batch_documentation_ipfs");

        let project_hash = generate_hash(bob());

        let batch = CarbonCreditBatchInfo {
            documentation_ipfs: batch_documentation_ipfs,
            project_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: BalanceOf::<Test>::from(1u32),
            penalty_repay_price: BalanceOf::<Test>::from(1000u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<Test>>::new(),
        };

        let batch_hash = generate_hash(alice());

        CarbonCreditBatches::<Test>::insert(batch_hash, batch);

        let credit_price = BalanceOf::<Test>::from(0u32);
        let credit_amount = BalanceOf::<Test>::from(1u32);

        // Check for NotEnoughtAvailableCredits error
        assert_err!(
            Veles::create_sale_order(
                RuntimeOrigin::signed(alice()),
                batch_hash,
                credit_price,
                credit_amount,
            ),
            Error::<Test>::CarbonCreditHoldingsDontExist
        );
    });
}

#[test]
fn create_sale_order_not_enought_available_credits() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut traders = BTreeSet::<AccountId>::new();
        traders.insert(alice());

        TraderAccounts::<Test>::set(traders);

        // Insert carbon credit batch
        let batch_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("batch_documentation_ipfs");

        let project_hash = generate_hash(bob());

        let batch = CarbonCreditBatchInfo {
            documentation_ipfs: batch_documentation_ipfs,
            project_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: BalanceOf::<Test>::from(100u32),
            penalty_repay_price: BalanceOf::<Test>::from(1u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<Test>>::new(),
        };

        let batch_hash = generate_hash(alice());

        CarbonCreditBatches::<Test>::insert(batch_hash, batch);

        // Insert carbon credit holdings
        let credit_holdings = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<Test>::from(0u32),
            unavailable_amount: BalanceOf::<Test>::from(0u32),
        };

        CarbonCreditHoldings::<Test>::insert(batch_hash, alice(), credit_holdings);

        let credit_price = BalanceOf::<Test>::from(0u32);
        let credit_amount = BalanceOf::<Test>::from(1u32);

        // Check for NotEnoughtAvailableCredits error
        assert_err!(
            Veles::create_sale_order(
                RuntimeOrigin::signed(alice()),
                batch_hash,
                credit_price,
                credit_amount,
            ),
            Error::<Test>::NotEnoughtAvailableCredits
        );
    });
}

#[test]
fn create_sale_order_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut traders = BTreeSet::<AccountId>::new();
        traders.insert(alice());

        TraderAccounts::<Test>::set(traders);

        // Insert carbon credit batch
        let batch_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("batch_documentation_ipfs");

        let project_hash = generate_hash(bob());

        let batch = CarbonCreditBatchInfo {
            documentation_ipfs: batch_documentation_ipfs,
            project_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: BalanceOf::<Test>::from(100u32),
            penalty_repay_price: BalanceOf::<Test>::from(1u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<Test>>::new(),
        };

        let batch_hash = generate_hash(alice());

        CarbonCreditBatches::<Test>::insert(batch_hash, batch);

        // Insert carbon credit holdings
        let credit_holdings = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<Test>::from(40u32),
            unavailable_amount: BalanceOf::<Test>::from(0u32),
        };

        CarbonCreditHoldings::<Test>::insert(batch_hash, alice(), credit_holdings.clone());

        let credit_price = BalanceOf::<Test>::from(0u32);
        let credit_amount = BalanceOf::<Test>::from(5u32);

        // Check cabon credit holding for seller before sale order creation
        assert_eq!(
            credit_holdings.available_amount,
            BalanceOf::<Test>::from(40u32)
        );
        assert_eq!(
            credit_holdings.unavailable_amount,
            BalanceOf::<Test>::from(0u32)
        );

        // Successfully create sale order
        assert_ok!(Veles::create_sale_order(
            RuntimeOrigin::signed(alice()),
            batch_hash,
            credit_price,
            credit_amount,
        ));

        // Check cabon credit holding for seller after sale order creation
        let credit_holdings = CarbonCreditHoldings::<Test>::get(batch_hash, alice()).unwrap();

        assert_eq!(
            credit_holdings.available_amount,
            BalanceOf::<Test>::from(35u32)
        );
        assert_eq!(
            credit_holdings.unavailable_amount,
            BalanceOf::<Test>::from(5u32)
        );

        // Check sale order info structure
        let sale_order_hash = generate_hash(alice());

        let sale_order = CarbonCreditSaleOrders::<Test>::get(sale_order_hash).unwrap();

        let current_block = frame_system::Pallet::<Test>::block_number();
        let timeout_block = current_block + PalletTimeValues::<Test>::get().voting_timeout;

        assert_eq!(sale_order.batch_hash, batch_hash);
        assert_eq!(sale_order.credit_amount, BalanceOf::<Test>::from(5u32));
        assert_eq!(sale_order.credit_price, BalanceOf::<Test>::from(0u32));
        assert_eq!(sale_order.seller, alice());
        assert_eq!(sale_order.buyer, alice());
        assert_eq!(sale_order.sale_active, true);
        assert_eq!(sale_order.sale_timeout, timeout_block);

        // Check for sale timeout event
        let sale_timeouts = SaleOrderTimeouts::<Test>::get(timeout_block).unwrap();

        assert_eq!(sale_timeouts.len(), 1);
        assert_eq!(sale_timeouts.contains(&sale_order_hash), true);
    });
}

#[test]
fn complete_sale_order_user_is_not_eligible_for_carbon_credit_transactions() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let sale_hash = generate_hash(alice());

        // Check for UserIsNotEligibleForCarbonCreditTransactions error
        assert_err!(
            Veles::complete_sale_order(RuntimeOrigin::signed(alice()), sale_hash,),
            Error::<Test>::UserIsNotEligibleForCarbonCreditTransactions
        );
    });
}

#[test]
fn complete_sale_order_project_owner_has_standing_debts() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(alice(), project_owner);

        // Insert project owner debts
        let mut debts = BTreeMap::<AccountIdOf<Test>, BalanceOf<Test>>::new();

        debts.insert(bob(), BalanceOf::<Test>::from(10u32));
        debts.insert(charlie(), BalanceOf::<Test>::from(20u32));

        ProjectOwnerDebts::<Test>::insert(alice(), debts);

        let sale_hash = generate_hash(alice());

        // Check for ProjectOwnerHasStandingDebts error
        assert_err!(
            Veles::complete_sale_order(RuntimeOrigin::signed(alice()), sale_hash,),
            Error::<Test>::ProjectOwnerHasStandingDebts
        );
    });
}

#[test]
fn complete_sale_order_carbon_credit_sale_order_doesnt_exist() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut traders = BTreeSet::<AccountId>::new();
        traders.insert(alice());

        TraderAccounts::<Test>::set(traders);

        let sale_hash = generate_hash(alice());

        // Check for CarbonCreditSaleOrderDoesntExist error
        assert_err!(
            Veles::complete_sale_order(RuntimeOrigin::signed(alice()), sale_hash,),
            Error::<Test>::CarbonCreditSaleOrderDoesntExist
        );
    });
}

#[test]
fn complete_sale_order_buyer_cant_buy_his_own_tokens() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut traders = BTreeSet::<AccountId>::new();
        traders.insert(alice());

        TraderAccounts::<Test>::set(traders);

        // Insert sale order
        let sale_order = CarbonCreditSaleOrderInfo {
            batch_hash: generate_hash(alice()),
            credit_amount: BalanceOf::<Test>::from(10u32),
            credit_price: BalanceOf::<Test>::from(5u32),
            seller: alice(),
            buyer: alice(),
            sale_active: true,
            sale_timeout: BlockNumber::<Test>::from(10u32),
        };

        let sale_hash = generate_hash(bob());

        CarbonCreditSaleOrders::<Test>::insert(sale_hash, sale_order);

        // Check for BuyerCantBuyHisOwnTokens error
        assert_err!(
            Veles::complete_sale_order(RuntimeOrigin::signed(alice()), sale_hash,),
            Error::<Test>::BuyerCantBuyHisOwnTokens
        );
    });
}

#[test]
fn complete_sale_order_carbon_credit_batch_does_not_exists() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut traders = BTreeSet::<AccountId>::new();
        traders.insert(alice());

        TraderAccounts::<Test>::set(traders);

        // Insert sale order
        let sale_order = CarbonCreditSaleOrderInfo {
            batch_hash: generate_hash(alice()),
            credit_amount: BalanceOf::<Test>::from(10u32),
            credit_price: BalanceOf::<Test>::from(5u32),
            seller: bob(),
            buyer: bob(),
            sale_active: true,
            sale_timeout: BlockNumber::<Test>::from(10u32),
        };

        let sale_hash = generate_hash(bob());

        CarbonCreditSaleOrders::<Test>::insert(sale_hash, sale_order);

        // Check for CarbonCreditBatchDoesNotExist error
        assert_err!(
            Veles::complete_sale_order(RuntimeOrigin::signed(alice()), sale_hash,),
            Error::<Test>::CarbonCreditBatchDoesNotExist
        );
    });
}

#[test]
fn complete_sale_order_carbon_credit_batch_is_not_active() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut traders = BTreeSet::<AccountId>::new();
        traders.insert(alice());

        TraderAccounts::<Test>::set(traders);

        // Insert carbon credit batch
        let credit_batch = CarbonCreditBatchInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from(
                "batch_documentation_ipfs",
            ),
            project_hash: generate_hash(charlie()),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: BalanceOf::<Test>::from(100u32),
            penalty_repay_price: BalanceOf::<Test>::from(10u32),
            status: CarbonCreditBatchStatus::Frozen,
            validator_benefactors: BTreeSet::<AccountIdOf<Test>>::new(),
        };

        let batch_hash = generate_hash(alice());

        CarbonCreditBatches::<Test>::insert(batch_hash, credit_batch);

        // Insert sale order
        let sale_order = CarbonCreditSaleOrderInfo {
            batch_hash: generate_hash(alice()),
            credit_amount: BalanceOf::<Test>::from(10u32),
            credit_price: BalanceOf::<Test>::from(5u32),
            seller: bob(),
            buyer: bob(),
            sale_active: true,
            sale_timeout: BlockNumber::<Test>::from(10u32),
        };

        let sale_hash = generate_hash(bob());

        CarbonCreditSaleOrders::<Test>::insert(sale_hash, sale_order);

        // Check for CarbonCreditBatchIsNotActive error
        assert_err!(
            Veles::complete_sale_order(RuntimeOrigin::signed(alice()), sale_hash,),
            Error::<Test>::CarbonCreditBatchIsNotActive
        );
    });
}

#[test]
fn complete_sale_order_insufficient_funds() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut traders = BTreeSet::<AccountId>::new();
        traders.insert(alice());

        TraderAccounts::<Test>::set(traders);

        // Insert carbon credit batch
        let credit_batch = CarbonCreditBatchInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from(
                "batch_documentation_ipfs",
            ),
            project_hash: generate_hash(charlie()),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: BalanceOf::<Test>::from(100u32),
            penalty_repay_price: BalanceOf::<Test>::from(10u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<Test>>::new(),
        };

        let batch_hash = generate_hash(alice());

        CarbonCreditBatches::<Test>::insert(batch_hash, credit_batch);

        // Insert sale order
        let sale_order = CarbonCreditSaleOrderInfo {
            batch_hash: generate_hash(alice()),
            credit_amount: BalanceOf::<Test>::from(10u32),
            credit_price: BalanceOf::<Test>::from(5u32),
            seller: bob(),
            buyer: bob(),
            sale_active: true,
            sale_timeout: BlockNumber::<Test>::from(10u32),
        };

        let sale_hash = generate_hash(bob());

        CarbonCreditSaleOrders::<Test>::insert(sale_hash, sale_order);

        // Check for InsufficientFunds error
        assert_err!(
            Veles::complete_sale_order(RuntimeOrigin::signed(alice()), sale_hash,),
            Error::<Test>::InsufficientFunds
        );
    });
}

#[test]
fn complete_sale_order_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut traders = BTreeSet::<AccountId>::new();
        traders.insert(charlie());

        TraderAccounts::<Test>::set(traders);

        // Insert validators
        let validator_1 = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from("validator_1"),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        let validator_2 = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from("validator_2"),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        Validators::<Test>::insert(dave(), validator_1);
        Validators::<Test>::insert(fred(), validator_2);

        // Insert project owner
        let owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from("owner"),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(alice(), owner);

        // Insert project
        let project = ProjectInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from("project"),
            project_owner: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        let project_hash = generate_hash(alice());

        Projects::<Test>::insert(project_hash, project);

        // Insert carbon credit batch
        let mut validator_benefactors = BTreeSet::<AccountIdOf<Test>>::new();
        validator_benefactors.insert(dave());
        validator_benefactors.insert(fred());

        let credit_batch = CarbonCreditBatchInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from("batch"),
            project_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: BalanceOf::<Test>::from(100u32),
            penalty_repay_price: BalanceOf::<Test>::from(10u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors,
        };

        let batch_hash = generate_hash(bob());

        CarbonCreditBatches::<Test>::insert(batch_hash, credit_batch);

        // Insert carbon credit holdings
        let credit_holdings = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<Test>::from(50u32),
            unavailable_amount: BalanceOf::<Test>::from(20u32),
        };

        CarbonCreditHoldings::<Test>::insert(batch_hash, bob(), credit_holdings);

        // Insert sale order
        let timeout_block = BlockNumber::<Test>::from(100u32);

        let sale_order = CarbonCreditSaleOrderInfo {
            batch_hash,
            credit_amount: BalanceOf::<Test>::from(10u32),
            credit_price: BalanceOf::<Test>::from(5u32),
            seller: bob(),
            buyer: bob(),
            sale_active: true,
            sale_timeout: timeout_block,
        };

        let sale_hash = generate_hash(bob());

        CarbonCreditSaleOrders::<Test>::insert(sale_hash, sale_order);

        // Insert sale timeout
        let mut sale_timeouts = BTreeSet::<H256>::new();
        sale_timeouts.insert(sale_hash);

        SaleOrderTimeouts::<Test>::insert(timeout_block, sale_timeouts);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            5000
        );
        assert_eq!(pallet_balances::Pallet::<Test>::free_balance(bob()), 100);

        // Successfully complete sale order
        assert_ok!(Veles::complete_sale_order(
            RuntimeOrigin::signed(charlie()),
            sale_hash,
        ));

        // Check seller carbon credit holdings
        let seller_holdings = CarbonCreditHoldings::<Test>::get(batch_hash, bob()).unwrap();
        assert_eq!(
            seller_holdings.available_amount,
            BalanceOf::<Test>::from(50u32)
        );
        assert_eq!(
            seller_holdings.unavailable_amount,
            BalanceOf::<Test>::from(10u32)
        );

        // Check buyer carbon credit holdings
        let buyer_holdings = CarbonCreditHoldings::<Test>::get(batch_hash, charlie()).unwrap();
        assert_eq!(
            buyer_holdings.available_amount,
            BalanceOf::<Test>::from(10u32)
        );
        assert_eq!(
            buyer_holdings.unavailable_amount,
            BalanceOf::<Test>::from(0u32)
        );

        // Check sale order structure
        let sale_order = CarbonCreditSaleOrders::<Test>::get(sale_hash).unwrap();
        assert_eq!(sale_order.batch_hash, batch_hash);
        assert_eq!(sale_order.credit_amount, BalanceOf::<Test>::from(10u32));
        assert_eq!(sale_order.credit_price, BalanceOf::<Test>::from(5u32));
        assert_eq!(sale_order.seller, bob());
        assert_eq!(sale_order.buyer, charlie());
        assert_eq!(sale_order.sale_active, false);
        assert_eq!(sale_order.sale_timeout, timeout_block);

        // Check sale timeout structure
        let sale_timeouts = SaleOrderTimeouts::<Test>::get(timeout_block);

        assert_eq!(sale_timeouts, None);

        // Check balances after extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            4951
        );
        assert_eq!(pallet_balances::Pallet::<Test>::free_balance(bob()), 128);
        assert_eq!(pallet_balances::Pallet::<Test>::free_balance(dave()), 8);
        assert_eq!(pallet_balances::Pallet::<Test>::free_balance(fred()), 8);
        assert_eq!(pallet_balances::Pallet::<Test>::free_balance(alice()), 6);
    });
}

#[test]
fn close_sale_order_user_is_not_eligible_for_carbon_credit_transactions() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let sale_hash = generate_hash(alice());

        // Check for UserIsNotEligibleForCarbonCreditTransactions error
        assert_err!(
            Veles::close_sale_order(RuntimeOrigin::signed(alice()), sale_hash,),
            Error::<Test>::UserIsNotEligibleForCarbonCreditTransactions
        );
    });
}

#[test]
fn close_sale_order_project_owner_has_standing_debts() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(alice(), project_owner);

        // Insert project owner debts
        let mut debts = BTreeMap::<AccountIdOf<Test>, BalanceOf<Test>>::new();

        debts.insert(bob(), BalanceOf::<Test>::from(10u32));
        debts.insert(charlie(), BalanceOf::<Test>::from(20u32));

        ProjectOwnerDebts::<Test>::insert(alice(), debts);

        let sale_hash = generate_hash(alice());

        // Check for ProjectOwnerHasStandingDebts error
        assert_err!(
            Veles::close_sale_order(RuntimeOrigin::signed(alice()), sale_hash,),
            Error::<Test>::ProjectOwnerHasStandingDebts
        );
    });
}

#[test]
fn close_sale_order_carbon_credit_sale_order_doesnt_exist() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut traders = BTreeSet::<AccountId>::new();
        traders.insert(alice());

        TraderAccounts::<Test>::set(traders);

        let sale_hash = generate_hash(alice());

        // Check for CarbonCreditSaleOrderDoesntExist error
        assert_err!(
            Veles::close_sale_order(RuntimeOrigin::signed(alice()), sale_hash,),
            Error::<Test>::CarbonCreditSaleOrderDoesntExist
        );
    });
}

#[test]
fn close_sale_order_sale_order_is_not_active() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut traders = BTreeSet::<AccountId>::new();
        traders.insert(alice());

        TraderAccounts::<Test>::set(traders);

        // Insert sale order
        let sale_order = CarbonCreditSaleOrderInfo {
            batch_hash: generate_hash(alice()),
            credit_amount: BalanceOf::<Test>::from(10u32),
            credit_price: BalanceOf::<Test>::from(5u32),
            seller: bob(),
            buyer: bob(),
            sale_active: false,
            sale_timeout: BlockNumber::<Test>::from(10u32),
        };

        let sale_hash = generate_hash(bob());

        CarbonCreditSaleOrders::<Test>::insert(sale_hash, sale_order);

        // Check for SaleOrderIsNotActive error
        assert_err!(
            Veles::close_sale_order(RuntimeOrigin::signed(alice()), sale_hash,),
            Error::<Test>::SaleOrderIsNotActive
        );
    });
}

#[test]
fn close_sale_order_user_didnt_create_the_sale_order() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut traders = BTreeSet::<AccountId>::new();
        traders.insert(alice());

        TraderAccounts::<Test>::set(traders);

        // Insert sale order
        let sale_order = CarbonCreditSaleOrderInfo {
            batch_hash: generate_hash(alice()),
            credit_amount: BalanceOf::<Test>::from(10u32),
            credit_price: BalanceOf::<Test>::from(5u32),
            seller: bob(),
            buyer: bob(),
            sale_active: true,
            sale_timeout: BlockNumber::<Test>::from(10u32),
        };

        let sale_hash = generate_hash(bob());

        CarbonCreditSaleOrders::<Test>::insert(sale_hash, sale_order);

        // Check for UserDidntCreateTheSaleOrder error
        assert_err!(
            Veles::close_sale_order(RuntimeOrigin::signed(alice()), sale_hash,),
            Error::<Test>::UserDidntCreateTheSaleOrder
        );
    });
}

#[test]
fn close_sale_order_carbon_credit_batch_does_not_exist() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut traders = BTreeSet::<AccountId>::new();
        traders.insert(alice());

        TraderAccounts::<Test>::set(traders);

        // Insert sale order
        let sale_order = CarbonCreditSaleOrderInfo {
            batch_hash: generate_hash(alice()),
            credit_amount: BalanceOf::<Test>::from(10u32),
            credit_price: BalanceOf::<Test>::from(5u32),
            seller: alice(),
            buyer: alice(),
            sale_active: true,
            sale_timeout: BlockNumber::<Test>::from(10u32),
        };

        let sale_hash = generate_hash(bob());

        CarbonCreditSaleOrders::<Test>::insert(sale_hash, sale_order);

        // Check for CarbonCreditBatchDoesNotExist error
        assert_err!(
            Veles::close_sale_order(RuntimeOrigin::signed(alice()), sale_hash,),
            Error::<Test>::CarbonCreditBatchDoesNotExist
        );
    });
}

#[test]
fn close_sale_order_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert trader account
        let mut traders = BTreeSet::<AccountId>::new();
        traders.insert(bob());

        TraderAccounts::<Test>::set(traders);

        // Insert credit batch
        let batch = CarbonCreditBatchInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from(
                "batch_documentation_ipfs",
            ),
            project_hash: generate_hash(charlie()),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: BalanceOf::<Test>::from(100u32),
            penalty_repay_price: BalanceOf::<Test>::from(10u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<Test>>::new(),
        };

        let batch_hash = generate_hash(alice());

        CarbonCreditBatches::<Test>::insert(batch_hash, batch);

        // Insert carbon credit holdings
        let credit_holdings = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<Test>::from(50u32),
            unavailable_amount: BalanceOf::<Test>::from(20u32),
        };

        CarbonCreditHoldings::<Test>::insert(batch_hash, bob(), credit_holdings);

        // Insert sale order
        let timeout_block = BlockNumber::<Test>::from(100u32);

        // Insert sale order
        let sale_order = CarbonCreditSaleOrderInfo {
            batch_hash,
            credit_amount: BalanceOf::<Test>::from(10u32),
            credit_price: BalanceOf::<Test>::from(5u32),
            seller: bob(),
            buyer: bob(),
            sale_active: true,
            sale_timeout: timeout_block,
        };

        let sale_hash = generate_hash(bob());

        CarbonCreditSaleOrders::<Test>::insert(sale_hash, sale_order);

        // Insert sale timeout
        let mut sale_timeouts = BTreeSet::<H256>::new();
        sale_timeouts.insert(sale_hash);

        SaleOrderTimeouts::<Test>::insert(timeout_block, sale_timeouts);

        // Successfully close sale order
        assert_ok!(Veles::close_sale_order(
            RuntimeOrigin::signed(bob()),
            sale_hash,
        ));

        // Check sale order structure
        let sale_order = CarbonCreditSaleOrders::<Test>::get(sale_hash).unwrap();
        assert_eq!(sale_order.batch_hash, batch_hash);
        assert_eq!(sale_order.credit_amount, BalanceOf::<Test>::from(10u32));
        assert_eq!(sale_order.credit_price, BalanceOf::<Test>::from(5u32));
        assert_eq!(sale_order.seller, bob());
        assert_eq!(sale_order.buyer, bob());
        assert_eq!(sale_order.sale_active, false);
        assert_eq!(sale_order.sale_timeout, timeout_block);

        // Check credit holdings structure
        let credit_holdings = CarbonCreditHoldings::<Test>::get(batch_hash, bob()).unwrap();
        assert_eq!(
            credit_holdings.available_amount,
            BalanceOf::<Test>::from(60u32)
        );
        assert_eq!(
            credit_holdings.unavailable_amount,
            BalanceOf::<Test>::from(10u32)
        );

        // Check sale timeouts
        let sale_timeouts = SaleOrderTimeouts::<Test>::get(timeout_block);
        assert_eq!(sale_timeouts, None);
    });
}

#[test]
fn open_account_complaint_user_is_not_a_registered_validator() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");
        let complaint_for = bob();
        let complaint_type = ComplaintType::ValidatorComplaint;

        // Check for UserIsNotARegisteredValidator error
        assert_err!(
            Veles::open_account_complaint(
                RuntimeOrigin::signed(alice()),
                documentation_ipfs,
                complaint_for,
                complaint_type,
            ),
            Error::<Test>::UserIsNotARegisteredValidator
        );
    });
}

#[test]
fn open_account_complaint_documentation_was_used_previously() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        // Insert validator
        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(alice(), validator);

        let complaint_for = bob();
        let complaint_type = ComplaintType::ValidatorComplaint;

        // Check for DocumentationWasUsedPreviously error
        assert_err!(
            Veles::open_account_complaint(
                RuntimeOrigin::signed(alice()),
                documentation_ipfs,
                complaint_for,
                complaint_type,
            ),
            Error::<Test>::DocumentationWasUsedPreviously
        );
    });
}

#[test]
fn open_account_complaint_insufficient_funds() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let validator_documentation =
            BoundedString::<IPFSLength>::truncate_from("validator_documentation");

        // Insert validator
        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(alice(), validator);

        let complaint_documentation =
            BoundedString::<IPFSLength>::truncate_from("complaint_documentation");
        let complaint_for = bob();
        let complaint_type = ComplaintType::ValidatorComplaint;

        // Check for InsufficientFunds error
        assert_err!(
            Veles::open_account_complaint(
                RuntimeOrigin::signed(alice()),
                complaint_documentation,
                complaint_for,
                complaint_type,
            ),
            Error::<Test>::InsufficientFunds
        );
    });
}

#[test]
fn open_account_complaint_unregistered_account_id() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let validator_documentation =
            BoundedString::<IPFSLength>::truncate_from("validator_documentation");

        // Insert validator
        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(charlie(), validator);

        let complaint_documentation =
            BoundedString::<IPFSLength>::truncate_from("complaint_documentation");
        let complaint_for = bob();
        let complaint_type = ComplaintType::ValidatorComplaint;

        // Check for UnregisteredAccountId error
        assert_err!(
            Veles::open_account_complaint(
                RuntimeOrigin::signed(charlie()),
                complaint_documentation,
                complaint_for,
                complaint_type,
            ),
            Error::<Test>::UnregisteredAccountId
        );
    });
}

#[test]
fn open_account_complaint_invalid_complaint_type() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let validator_documentation =
            BoundedString::<IPFSLength>::truncate_from("validator_documentation");

        // Insert validator
        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(charlie(), validator);

        let complaint_documentation =
            BoundedString::<IPFSLength>::truncate_from("complaint_documentation");
        let complaint_for = bob();
        let complaint_type = ComplaintType::CarbonCreditBatchComplaint;

        // Check for InvalidComplaintType error
        assert_err!(
            Veles::open_account_complaint(
                RuntimeOrigin::signed(charlie()),
                complaint_documentation,
                complaint_for,
                complaint_type,
            ),
            Error::<Test>::InvalidComplaintType
        );
    });
}

#[test]
fn open_account_complaint_project_owner_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let validator_documentation =
            BoundedString::<IPFSLength>::truncate_from("validator_documentation");

        // Insert validator
        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(charlie(), validator);

        // Insert project owner
        let owner_documentation = BoundedString::<IPFSLength>::truncate_from("owner_documentation");

        let owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        ProjectOwners::<Test>::insert(bob(), owner);

        // Insert project
        let project_documentation =
            BoundedString::<IPFSLength>::truncate_from("project_documentation");

        let project = ProjectInfo {
            documentation_ipfs: project_documentation,
            project_owner: bob(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        let project_hash = generate_hash(alice());

        Projects::<Test>::insert(project_hash, project);

        // Insert carbon credit batch
        let batch_documentation = BoundedString::<IPFSLength>::truncate_from("batch_documentation");

        let batch = CarbonCreditBatchInfo {
            documentation_ipfs: batch_documentation,
            project_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: BalanceOf::<Test>::from(100u32),
            penalty_repay_price: BalanceOf::<Test>::from(5u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<Test>>::new(),
        };

        let batch_hash = generate_hash(bob());

        CarbonCreditBatches::<Test>::insert(batch_hash, batch);

        let complaint_documentation =
            BoundedString::<IPFSLength>::truncate_from("complaint_documentation");
        let complaint_for = bob();
        let complaint_type = ComplaintType::ProjectOwnerComplaint;

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            5000
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            0
        );

        // Successfully open account complaint
        assert_ok!(Veles::open_account_complaint(
            RuntimeOrigin::signed(charlie()),
            complaint_documentation.clone(),
            complaint_for,
            complaint_type,
        ));

        // Check complaint structure
        let complaint =
            ComplaintsForAccounts::<Test>::get(complaint_documentation.clone()).unwrap();

        assert_eq!(complaint.complaint_for, bob());
        assert_eq!(
            complaint.complaint_type,
            ComplaintType::ProjectOwnerComplaint
        );
        assert_eq!(complaint.complaint_proposer, charlie());
        assert_eq!(
            complaint.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );
        assert_eq!(complaint.votes_for, BTreeSet::<AccountIdOf<Test>>::new());
        assert_eq!(
            complaint.votes_against,
            BTreeSet::<AccountIdOf<Test>>::new()
        );
        assert_eq!(complaint.complaint_active, true);

        // Check complaint timeout
        let current_block = frame_system::Pallet::<Test>::block_number();
        let timeout_block = current_block + PalletTimeValues::<Test>::get().voting_timeout;

        let complaint_timeouts = ComplaintTimeouts::<Test>::get(timeout_block).unwrap();

        assert_eq!(complaint_timeouts.len(), 1);
        assert_eq!(complaint_timeouts.contains(&complaint_documentation), true);

        // Check carbon credit batch status
        let batch = CarbonCreditBatches::<Test>::get(batch_hash).unwrap();

        assert_eq!(
            batch.documentation_ipfs,
            BoundedString::<IPFSLength>::truncate_from("batch_documentation")
        );
        assert_eq!(batch.project_hash, project_hash);
        assert_eq!(
            batch.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );
        assert_eq!(batch.credit_amount, BalanceOf::<Test>::from(100u32));
        assert_eq!(batch.penalty_repay_price, BalanceOf::<Test>::from(5u32));
        assert_eq!(batch.status, CarbonCreditBatchStatus::Frozen);

        // Check balances after extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            4900
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            100
        );
    });
}

#[test]
fn open_account_complaint_validator_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let validator_1_documentation =
            BoundedString::<IPFSLength>::truncate_from("validator_1_documentation");

        // Insert validator #1
        let validator_1 = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_1_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(charlie(), validator_1);

        // Insert validator #2
        let validator_2_documentation =
            BoundedString::<IPFSLength>::truncate_from("validator_2_documentation");

        let validator_2 = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_2_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(bob(), validator_2);

        let complaint_documentation =
            BoundedString::<IPFSLength>::truncate_from("complaint_documentation");
        let complaint_for = bob();
        let complaint_type = ComplaintType::ValidatorComplaint;

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            5000
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            0
        );

        // Successfully open account complaint
        assert_ok!(Veles::open_account_complaint(
            RuntimeOrigin::signed(charlie()),
            complaint_documentation.clone(),
            complaint_for,
            complaint_type,
        ));

        // Check complaint structure
        let complaint =
            ComplaintsForAccounts::<Test>::get(complaint_documentation.clone()).unwrap();

        assert_eq!(complaint.complaint_for, bob());
        assert_eq!(complaint.complaint_type, ComplaintType::ValidatorComplaint);
        assert_eq!(complaint.complaint_proposer, charlie());
        assert_eq!(
            complaint.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );
        assert_eq!(complaint.votes_for, BTreeSet::<AccountIdOf<Test>>::new());
        assert_eq!(
            complaint.votes_against,
            BTreeSet::<AccountIdOf<Test>>::new()
        );
        assert_eq!(complaint.complaint_active, true);

        // Check complaint timeout
        let current_block = frame_system::Pallet::<Test>::block_number();
        let timeout_block = current_block + PalletTimeValues::<Test>::get().voting_timeout;

        let complaint_timeouts = ComplaintTimeouts::<Test>::get(timeout_block).unwrap();

        assert_eq!(complaint_timeouts.len(), 1);
        assert_eq!(complaint_timeouts.contains(&complaint_documentation), true);

        // Check balances after extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            4900
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            100
        );
    });
}

#[test]
fn open_account_complaint_max_potential_penalty_level_exceeded() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let validator_1_documentation =
            BoundedString::<IPFSLength>::truncate_from("validator_1_documentation");

        // Insert validator #1
        let validator_1 = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_1_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(charlie(), validator_1);

        // Insert validator #2
        let validator_2_documentation =
            BoundedString::<IPFSLength>::truncate_from("validator_2_documentation");

        let validator_2 = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_2_documentation,
            penalty_level: 4u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(bob(), validator_2);

        let complaint_documentation =
            BoundedString::<IPFSLength>::truncate_from("complaint_documentation");
        let complaint_for = bob();
        let complaint_type = ComplaintType::ValidatorComplaint;

        // Check for MaxPotentialPenaltyLevelExceeded error
        assert_err!(
            Veles::open_account_complaint(
                RuntimeOrigin::signed(charlie()),
                complaint_documentation.clone(),
                complaint_for,
                complaint_type,
            ),
            Error::<Test>::MaxPotentialPenaltyLevelExceeded,
        );
    });
}

#[test]
fn open_hash_complaint_user_is_not_a_registered_validator() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");
        let complaint_for = generate_hash(bob());
        let complaint_type = ComplaintType::ProjectComplaint;

        // Check for UserIsNotARegisteredValidator error
        assert_err!(
            Veles::open_hash_complaint(
                RuntimeOrigin::signed(alice()),
                documentation_ipfs,
                complaint_for,
                complaint_type,
            ),
            Error::<Test>::UserIsNotARegisteredValidator
        );
    });
}

#[test]
fn open_hash_complaint_documentation_was_used_previously() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("documentation_ipfs");

        // Insert validator
        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: documentation_ipfs.clone(),
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(alice(), validator);

        let complaint_for = generate_hash(bob());
        let complaint_type = ComplaintType::ProjectComplaint;

        // Check for DocumentationWasUsedPreviously error
        assert_err!(
            Veles::open_hash_complaint(
                RuntimeOrigin::signed(alice()),
                documentation_ipfs,
                complaint_for,
                complaint_type,
            ),
            Error::<Test>::DocumentationWasUsedPreviously
        );
    });
}

#[test]
fn open_hash_complaint_insufficient_funds() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let validator_documentation =
            BoundedString::<IPFSLength>::truncate_from("validator_documentation");

        // Insert validator
        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(alice(), validator);

        let complaint_documentation =
            BoundedString::<IPFSLength>::truncate_from("complaint_documentation");
        let complaint_for = generate_hash(bob());
        let complaint_type = ComplaintType::ProjectComplaint;

        // Check for InsufficientFunds error
        assert_err!(
            Veles::open_hash_complaint(
                RuntimeOrigin::signed(alice()),
                complaint_documentation,
                complaint_for,
                complaint_type,
            ),
            Error::<Test>::InsufficientFunds
        );
    });
}

#[test]
fn open_hash_complaint_unregistered_hash() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let validator_documentation =
            BoundedString::<IPFSLength>::truncate_from("validator_documentation");

        // Insert validator
        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(charlie(), validator);

        let complaint_documentation =
            BoundedString::<IPFSLength>::truncate_from("complaint_documentation");
        let complaint_for = generate_hash(bob());
        let complaint_type = ComplaintType::ProjectComplaint;

        // Check for UnregisteredHash error
        assert_err!(
            Veles::open_hash_complaint(
                RuntimeOrigin::signed(charlie()),
                complaint_documentation,
                complaint_for,
                complaint_type,
            ),
            Error::<Test>::UnregisteredHash
        );
    });
}

#[test]
fn open_hash_complaint_carbon_credit_batch_does_not_exist() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let validator_documentation =
            BoundedString::<IPFSLength>::truncate_from("validator_documentation");

        // Insert validator
        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(charlie(), validator);

        let complaint_documentation =
            BoundedString::<IPFSLength>::truncate_from("complaint_documentation");
        let complaint_for = generate_hash(bob());
        let complaint_type = ComplaintType::CarbonCreditBatchComplaint;

        // Check for CarbonCreditBatchDoesNotExist error
        assert_err!(
            Veles::open_hash_complaint(
                RuntimeOrigin::signed(charlie()),
                complaint_documentation,
                complaint_for,
                complaint_type,
            ),
            Error::<Test>::CarbonCreditBatchDoesNotExist
        );
    });
}

#[test]
fn open_hash_complaint_invalid_complaint_type() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let validator_documentation =
            BoundedString::<IPFSLength>::truncate_from("validator_documentation");

        // Insert validator
        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(charlie(), validator);

        let complaint_documentation =
            BoundedString::<IPFSLength>::truncate_from("complaint_documentation");
        let complaint_for = generate_hash(bob());
        let complaint_type = ComplaintType::ProjectOwnerComplaint;

        // Check for InvalidComplaintType error
        assert_err!(
            Veles::open_hash_complaint(
                RuntimeOrigin::signed(charlie()),
                complaint_documentation,
                complaint_for,
                complaint_type,
            ),
            Error::<Test>::InvalidComplaintType
        );
    });
}

#[test]
fn open_hash_complaint_project_max_potential_penalty_level_exceeded() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let validator_documentation =
            BoundedString::<IPFSLength>::truncate_from("validator_documentation");

        // Insert validator
        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(charlie(), validator);

        // Insert project owner
        let owner_documentation = BoundedString::<IPFSLength>::truncate_from("owner_documentation");

        let owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        ProjectOwners::<Test>::insert(bob(), owner);

        // Insert project
        let project_documentation =
            BoundedString::<IPFSLength>::truncate_from("project_documentation");

        let project = ProjectInfo {
            documentation_ipfs: project_documentation,
            project_owner: bob(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            penalty_level: 4u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        let project_hash = generate_hash(alice());

        Projects::<Test>::insert(project_hash, project);

        // Insert carbon credit batch
        let batch_documentation = BoundedString::<IPFSLength>::truncate_from("batch_documentation");

        let batch = CarbonCreditBatchInfo {
            documentation_ipfs: batch_documentation,
            project_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: BalanceOf::<Test>::from(100u32),
            penalty_repay_price: BalanceOf::<Test>::from(5u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<Test>>::new(),
        };

        let batch_hash = generate_hash(bob());

        CarbonCreditBatches::<Test>::insert(batch_hash, batch);

        let complaint_documentation =
            BoundedString::<IPFSLength>::truncate_from("complaint_documentation");
        let complaint_for = project_hash;
        let complaint_type = ComplaintType::ProjectComplaint;

        // Check for MaxPotentialPenaltyLevelExceeded error
        assert_err!(
            Veles::open_hash_complaint(
                RuntimeOrigin::signed(charlie()),
                complaint_documentation.clone(),
                complaint_for,
                complaint_type,
            ),
            Error::<Test>::MaxPotentialPenaltyLevelExceeded,
        );
    });
}

#[test]
fn open_hash_complaint_project_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let validator_documentation =
            BoundedString::<IPFSLength>::truncate_from("validator_documentation");

        // Insert validator
        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(charlie(), validator);

        // Insert project owner
        let owner_documentation = BoundedString::<IPFSLength>::truncate_from("owner_documentation");

        let owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        ProjectOwners::<Test>::insert(bob(), owner);

        // Insert project
        let project_documentation =
            BoundedString::<IPFSLength>::truncate_from("project_documentation");

        let project = ProjectInfo {
            documentation_ipfs: project_documentation,
            project_owner: bob(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        let project_hash = generate_hash(alice());

        Projects::<Test>::insert(project_hash, project);

        // Insert carbon credit batch
        let batch_documentation = BoundedString::<IPFSLength>::truncate_from("batch_documentation");

        let batch = CarbonCreditBatchInfo {
            documentation_ipfs: batch_documentation,
            project_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: BalanceOf::<Test>::from(100u32),
            penalty_repay_price: BalanceOf::<Test>::from(5u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<Test>>::new(),
        };

        let batch_hash = generate_hash(bob());

        CarbonCreditBatches::<Test>::insert(batch_hash, batch);

        let complaint_documentation =
            BoundedString::<IPFSLength>::truncate_from("complaint_documentation");
        let complaint_for = project_hash;
        let complaint_type = ComplaintType::ProjectComplaint;

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            5000
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            0
        );

        // Successfully open account complaint
        assert_ok!(Veles::open_hash_complaint(
            RuntimeOrigin::signed(charlie()),
            complaint_documentation.clone(),
            complaint_for,
            complaint_type,
        ));

        // Check complaint structure
        let complaint = ComplaintsForHashes::<Test>::get(complaint_documentation.clone()).unwrap();

        assert_eq!(complaint.complaint_for, project_hash);
        assert_eq!(complaint.complaint_type, ComplaintType::ProjectComplaint);
        assert_eq!(complaint.complaint_proposer, charlie());
        assert_eq!(
            complaint.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );
        assert_eq!(complaint.votes_for, BTreeSet::<AccountIdOf<Test>>::new());
        assert_eq!(
            complaint.votes_against,
            BTreeSet::<AccountIdOf<Test>>::new()
        );
        assert_eq!(complaint.complaint_active, true);

        // Check complaint timeout
        let current_block = frame_system::Pallet::<Test>::block_number();
        let timeout_block = current_block + PalletTimeValues::<Test>::get().voting_timeout;

        let complaint_timeouts = ComplaintTimeouts::<Test>::get(timeout_block).unwrap();

        assert_eq!(complaint_timeouts.len(), 1);
        assert_eq!(complaint_timeouts.contains(&complaint_documentation), true);

        // Check carbon credit batch status
        let batch = CarbonCreditBatches::<Test>::get(batch_hash).unwrap();

        assert_eq!(
            batch.documentation_ipfs,
            BoundedString::<IPFSLength>::truncate_from("batch_documentation")
        );
        assert_eq!(batch.project_hash, project_hash);
        assert_eq!(
            batch.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );
        assert_eq!(batch.credit_amount, BalanceOf::<Test>::from(100u32));
        assert_eq!(batch.penalty_repay_price, BalanceOf::<Test>::from(5u32));
        assert_eq!(batch.status, CarbonCreditBatchStatus::Frozen);

        // Check balances after extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            4900
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            100
        );
    });
}

#[test]
fn open_hash_complaint_batch_ongoing_carbon_batch_complaint() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let validator_documentation =
            BoundedString::<IPFSLength>::truncate_from("validator_documentation");

        // Insert validator
        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(charlie(), validator);

        // Insert carbon credit batch
        let batch_documentation = BoundedString::<IPFSLength>::truncate_from("batch_documentation");
        let project_hash = generate_hash(alice());

        let batch = CarbonCreditBatchInfo {
            documentation_ipfs: batch_documentation,
            project_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: BalanceOf::<Test>::from(100u32),
            penalty_repay_price: BalanceOf::<Test>::from(5u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<Test>>::new(),
        };

        let batch_hash = generate_hash(bob());

        CarbonCreditBatches::<Test>::insert(batch_hash, batch);

        let complaint_documentation_1 =
            BoundedString::<IPFSLength>::truncate_from("complaint_documentation_1");
        let complaint_for = batch_hash;
        let complaint_type = ComplaintType::CarbonCreditBatchComplaint;

        // Successfully open account complaint
        assert_ok!(Veles::open_hash_complaint(
            RuntimeOrigin::signed(charlie()),
            complaint_documentation_1,
            complaint_for,
            complaint_type,
        ));

        let complaint_documentation_2 =
            BoundedString::<IPFSLength>::truncate_from("complaint_documentation_2");
        let complaint_for = batch_hash;
        let complaint_type = ComplaintType::CarbonCreditBatchComplaint;

        // Check for OngoingCarbonBatchComplaint error
        assert_err!(
            Veles::open_hash_complaint(
                RuntimeOrigin::signed(charlie()),
                complaint_documentation_2,
                complaint_for,
                complaint_type,
            ),
            Error::<Test>::OngoingCarbonBatchComplaint,
        );
    });
}

#[test]
fn open_hash_complaint_batch_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let validator_documentation =
            BoundedString::<IPFSLength>::truncate_from("validator_documentation");

        // Insert validator
        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(charlie(), validator);

        // Insert carbon credit batch
        let batch_documentation = BoundedString::<IPFSLength>::truncate_from("batch_documentation");
        let project_hash = generate_hash(alice());

        let batch = CarbonCreditBatchInfo {
            documentation_ipfs: batch_documentation,
            project_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: BalanceOf::<Test>::from(100u32),
            penalty_repay_price: BalanceOf::<Test>::from(5u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<Test>>::new(),
        };

        let batch_hash = generate_hash(bob());

        CarbonCreditBatches::<Test>::insert(batch_hash, batch);

        let complaint_documentation =
            BoundedString::<IPFSLength>::truncate_from("complaint_documentation");
        let complaint_for = batch_hash;
        let complaint_type = ComplaintType::CarbonCreditBatchComplaint;

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            5000
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            0
        );

        // Successfully open account complaint
        assert_ok!(Veles::open_hash_complaint(
            RuntimeOrigin::signed(charlie()),
            complaint_documentation.clone(),
            complaint_for,
            complaint_type,
        ));

        // Check complaint structure
        let complaint = ComplaintsForHashes::<Test>::get(complaint_documentation.clone()).unwrap();

        assert_eq!(complaint.complaint_for, batch_hash);
        assert_eq!(
            complaint.complaint_type,
            ComplaintType::CarbonCreditBatchComplaint
        );
        assert_eq!(complaint.complaint_proposer, charlie());
        assert_eq!(
            complaint.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );
        assert_eq!(complaint.votes_for, BTreeSet::<AccountIdOf<Test>>::new());
        assert_eq!(
            complaint.votes_against,
            BTreeSet::<AccountIdOf<Test>>::new()
        );
        assert_eq!(complaint.complaint_active, true);

        // Check complaint timeout
        let current_block = frame_system::Pallet::<Test>::block_number();
        let timeout_block = current_block + PalletTimeValues::<Test>::get().voting_timeout;

        let complaint_timeouts = ComplaintTimeouts::<Test>::get(timeout_block).unwrap();

        assert_eq!(complaint_timeouts.len(), 1);
        assert_eq!(complaint_timeouts.contains(&complaint_documentation), true);

        // Check carbon credit batch status
        let batch = CarbonCreditBatches::<Test>::get(batch_hash).unwrap();

        assert_eq!(
            batch.documentation_ipfs,
            BoundedString::<IPFSLength>::truncate_from("batch_documentation")
        );
        assert_eq!(batch.project_hash, project_hash);
        assert_eq!(
            batch.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );
        assert_eq!(batch.credit_amount, BalanceOf::<Test>::from(100u32));
        assert_eq!(batch.penalty_repay_price, BalanceOf::<Test>::from(5u32));
        assert_eq!(batch.status, CarbonCreditBatchStatus::Frozen);

        // Check balances after extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            4900
        );
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(pallet_id()),
            100
        );
    });
}

#[test]
fn retire_carbon_credits_user_is_not_of_a_carbon_footprint_account_type() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        let batch_hash = generate_hash(alice());
        let amount_to_retire = BalanceOf::<Test>::from(0u32);

        // Check for UserIsNotOfACarbonFootprintAccountType error
        assert_err!(
            Veles::retire_carbon_credits(
                RuntimeOrigin::signed(alice()),
                batch_hash,
                amount_to_retire,
            ),
            Error::<Test>::UserIsNotOfACarbonFootprintAccountType
        );
    });
}

#[test]
fn retire_carbon_credits_carbon_credit_batch_does_not_exist() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert carbon footprint account
        let mut documentation_ipfses = BTreeSet::<BoundedString<IPFSLength>>::new();
        let documentation_ipfs = BoundedString::<IPFSLength>::truncate_from("batch_documentation");

        documentation_ipfses.insert(documentation_ipfs);

        let carbon_footprint_account = CarbonFootprintAccountInfo {
            documentation_ipfses,
            carbon_footprint_surplus: BalanceOf::<Test>::from(0u32),
            carbon_footprint_deficit: BalanceOf::<Test>::from(1000u32),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
        };

        CarbonFootprintAccounts::<Test>::insert(alice(), carbon_footprint_account);

        let batch_hash = generate_hash(alice());
        let amount_to_retire = BalanceOf::<Test>::from(0u32);

        // Check for CarbonCreditBatchDoesNotExist error
        assert_err!(
            Veles::retire_carbon_credits(
                RuntimeOrigin::signed(alice()),
                batch_hash,
                amount_to_retire,
            ),
            Error::<Test>::CarbonCreditBatchDoesNotExist
        );
    });
}

#[test]
fn retire_carbon_credits_carbon_credit_batch_is_not_active() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert carbon footprint account
        let mut documentation_ipfses = BTreeSet::<BoundedString<IPFSLength>>::new();
        let footprint_account_ipfs =
            BoundedString::<IPFSLength>::truncate_from("footprint_account_ipfs");

        documentation_ipfses.insert(footprint_account_ipfs);

        let carbon_footprint_account = CarbonFootprintAccountInfo {
            documentation_ipfses,
            carbon_footprint_surplus: BalanceOf::<Test>::from(0u32),
            carbon_footprint_deficit: BalanceOf::<Test>::from(1000u32),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
        };

        CarbonFootprintAccounts::<Test>::insert(alice(), carbon_footprint_account);

        // Insert carbon credit batch
        let batch_ipfs = BoundedString::<IPFSLength>::truncate_from("batch_ipfs");
        let project_hash = generate_hash(bob());

        let carbon_credit_batch = CarbonCreditBatchInfo {
            documentation_ipfs: batch_ipfs,
            project_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: BalanceOf::<Test>::from(200u32),
            penalty_repay_price: BalanceOf::<Test>::from(20u32),
            status: CarbonCreditBatchStatus::Frozen,
            validator_benefactors: BTreeSet::<AccountIdOf<Test>>::new(),
        };

        let batch_hash = generate_hash(alice());

        CarbonCreditBatches::<Test>::insert(batch_hash, carbon_credit_batch);

        let amount_to_retire = BalanceOf::<Test>::from(0u32);

        // Check for CarbonCreditBatchIsNotActive error
        assert_err!(
            Veles::retire_carbon_credits(
                RuntimeOrigin::signed(alice()),
                batch_hash,
                amount_to_retire,
            ),
            Error::<Test>::CarbonCreditBatchIsNotActive
        );
    });
}

#[test]
fn retire_carbon_credits_carbon_credit_holdings_dont_exist() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert carbon footprint account
        let mut documentation_ipfses = BTreeSet::<BoundedString<IPFSLength>>::new();
        let footprint_account_ipfs =
            BoundedString::<IPFSLength>::truncate_from("footprint_account_ipfs");

        documentation_ipfses.insert(footprint_account_ipfs);

        let carbon_footprint_account = CarbonFootprintAccountInfo {
            documentation_ipfses,
            carbon_footprint_surplus: BalanceOf::<Test>::from(0u32),
            carbon_footprint_deficit: BalanceOf::<Test>::from(1000u32),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
        };

        CarbonFootprintAccounts::<Test>::insert(alice(), carbon_footprint_account);

        // Insert carbon credit batch
        let batch_ipfs = BoundedString::<IPFSLength>::truncate_from("batch_ipfs");
        let project_hash = generate_hash(bob());

        let carbon_credit_batch = CarbonCreditBatchInfo {
            documentation_ipfs: batch_ipfs,
            project_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: BalanceOf::<Test>::from(200u32),
            penalty_repay_price: BalanceOf::<Test>::from(20u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<Test>>::new(),
        };

        let batch_hash = generate_hash(alice());

        CarbonCreditBatches::<Test>::insert(batch_hash, carbon_credit_batch);

        let amount_to_retire = BalanceOf::<Test>::from(0u32);

        // Check for CarbonCreditHoldingsDontExist error
        assert_err!(
            Veles::retire_carbon_credits(
                RuntimeOrigin::signed(alice()),
                batch_hash,
                amount_to_retire,
            ),
            Error::<Test>::CarbonCreditHoldingsDontExist
        );
    });
}

#[test]
fn retire_carbon_credits_not_enought_available_credits() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert carbon footprint account
        let mut documentation_ipfses = BTreeSet::<BoundedString<IPFSLength>>::new();
        let footprint_account_ipfs =
            BoundedString::<IPFSLength>::truncate_from("footprint_account_ipfs");

        documentation_ipfses.insert(footprint_account_ipfs);

        let carbon_footprint_account = CarbonFootprintAccountInfo {
            documentation_ipfses,
            carbon_footprint_surplus: BalanceOf::<Test>::from(0u32),
            carbon_footprint_deficit: BalanceOf::<Test>::from(1000u32),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
        };

        CarbonFootprintAccounts::<Test>::insert(alice(), carbon_footprint_account);

        // Insert carbon credit batch
        let batch_ipfs = BoundedString::<IPFSLength>::truncate_from("batch_ipfs");
        let project_hash = generate_hash(bob());

        let batch = CarbonCreditBatchInfo {
            documentation_ipfs: batch_ipfs,
            project_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: BalanceOf::<Test>::from(200u32),
            penalty_repay_price: BalanceOf::<Test>::from(20u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<Test>>::new(),
        };

        let batch_hash = generate_hash(alice());

        CarbonCreditBatches::<Test>::insert(batch_hash, batch);

        // Insert carbon credit holdings
        let holdings = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<Test>::from(110u32),
            unavailable_amount: BalanceOf::<Test>::from(20u32),
        };

        CarbonCreditHoldings::<Test>::insert(batch_hash, alice(), holdings);

        let amount_to_retire = BalanceOf::<Test>::from(200u32);

        // Check for NotEnoughtAvailableCredits error
        assert_err!(
            Veles::retire_carbon_credits(
                RuntimeOrigin::signed(alice()),
                batch_hash,
                amount_to_retire,
            ),
            Error::<Test>::NotEnoughtAvailableCredits
        );
    });
}

#[test]
fn retire_carbon_credits_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert carbon footprint account
        let mut documentation_ipfses = BTreeSet::<BoundedString<IPFSLength>>::new();
        let footprint_account_ipfs =
            BoundedString::<IPFSLength>::truncate_from("footprint_account_ipfs");

        documentation_ipfses.insert(footprint_account_ipfs);

        let carbon_footprint_account = CarbonFootprintAccountInfo {
            documentation_ipfses: documentation_ipfses.clone(),
            carbon_footprint_surplus: BalanceOf::<Test>::from(0u32),
            carbon_footprint_deficit: BalanceOf::<Test>::from(1000u32),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
        };

        CarbonFootprintAccounts::<Test>::insert(alice(), carbon_footprint_account);

        // Insert carbon credit batch
        let batch_ipfs = BoundedString::<IPFSLength>::truncate_from("batch_ipfs");
        let project_hash = generate_hash(bob());

        let batch = CarbonCreditBatchInfo {
            documentation_ipfs: batch_ipfs,
            project_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: BalanceOf::<Test>::from(200u32),
            penalty_repay_price: BalanceOf::<Test>::from(20u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<Test>>::new(),
        };

        let batch_hash = generate_hash(alice());

        CarbonCreditBatches::<Test>::insert(batch_hash, batch);

        // Insert carbon credit holdings
        let holdings = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<Test>::from(110u32),
            unavailable_amount: BalanceOf::<Test>::from(20u32),
        };

        CarbonCreditHoldings::<Test>::insert(batch_hash, alice(), holdings);

        let amount_to_retire = BalanceOf::<Test>::from(50u32);

        // Successfully retire carbon credits
        assert_ok!(Veles::retire_carbon_credits(
            RuntimeOrigin::signed(alice()),
            batch_hash,
            amount_to_retire,
        ));

        // Check carbon credit holdings
        let holdings = CarbonCreditHoldings::<Test>::get(batch_hash, alice()).unwrap();

        assert_eq!(holdings.available_amount, BalanceOf::<Test>::from(60u32));
        assert_eq!(holdings.unavailable_amount, BalanceOf::<Test>::from(20u32));

        // Check carbon footprint account
        let carbon_footprint_account = CarbonFootprintAccounts::<Test>::get(alice()).unwrap();

        assert_eq!(
            carbon_footprint_account.documentation_ipfses,
            documentation_ipfses
        );
        assert_eq!(
            carbon_footprint_account.carbon_footprint_surplus,
            BalanceOf::<Test>::from(0u32)
        );
        assert_eq!(
            carbon_footprint_account.carbon_footprint_deficit,
            BalanceOf::<Test>::from(950u32)
        );
        assert_eq!(
            carbon_footprint_account.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );

        // Check carbon credit retirement info
        let retirement_hash = generate_hash(alice());

        let retirement = CarbonCreditRetirements::<Test>::get(retirement_hash).unwrap();

        assert_eq!(retirement.carbon_footprint_account, alice());
        assert_eq!(retirement.batch_hash, batch_hash);
        assert_eq!(retirement.credit_amount, BalanceOf::<Test>::from(50u32));
        assert_eq!(
            retirement.retirement_date,
            <mock::Test as pallet::Config>::Time::now()
        );
    });
}

#[test]
fn repay_project_owner_debts_project_owner_doesnt_exist() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Check for ProjectOwnerDoesntExist error
        assert_err!(
            Veles::repay_project_owner_debts(RuntimeOrigin::signed(alice()),),
            Error::<Test>::ProjectOwnerDoesntExist
        );
    });
}

#[test]
fn repay_project_owner_debts_project_owner_doesnt_have_any_debts() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(alice(), project_owner);

        // Check for ProjectOwnerDoesntHaveAnyDebts error
        assert_err!(
            Veles::repay_project_owner_debts(RuntimeOrigin::signed(alice()),),
            Error::<Test>::ProjectOwnerDoesntHaveAnyDebts
        );
    });
}

#[test]
fn repay_project_owner_debts_insufficient_funds() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(alice(), project_owner);

        // Insert project owner debts
        let mut debts = BTreeMap::<AccountIdOf<Test>, BalanceOf<Test>>::new();

        debts.insert(bob(), BalanceOf::<Test>::from(20u32));
        debts.insert(charlie(), BalanceOf::<Test>::from(30u32));

        ProjectOwnerDebts::<Test>::insert(alice(), debts);

        // Check for InsufficientFunds error
        assert_err!(
            Veles::repay_project_owner_debts(RuntimeOrigin::signed(alice()),),
            Error::<Test>::InsufficientFunds
        );
    });
}

#[test]
fn repay_project_owner_debts_ok() {
    new_test_ext().execute_with(|| {
        // Go past genesis block so events get deposited
        run_to_block(1);

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(charlie(), project_owner);

        // Insert project owner debts
        let mut debts = BTreeMap::<AccountIdOf<Test>, BalanceOf<Test>>::new();

        debts.insert(alice(), BalanceOf::<Test>::from(20u32));
        debts.insert(bob(), BalanceOf::<Test>::from(30u32));

        ProjectOwnerDebts::<Test>::insert(charlie(), debts);

        // Check balances before extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            5000
        );
        assert_eq!(pallet_balances::Pallet::<Test>::free_balance(alice()), 1);
        assert_eq!(pallet_balances::Pallet::<Test>::free_balance(bob()), 100);

        // Check debt storage
        assert_eq!(ProjectOwnerDebts::<Test>::contains_key(charlie()), true);

        // Successfully pay off project owner debts
        assert_ok!(Veles::repay_project_owner_debts(RuntimeOrigin::signed(
            charlie()
        ),));

        // Check debt storage
        assert_eq!(ProjectOwnerDebts::<Test>::contains_key(charlie()), false);

        // Check balances after extrinsic call
        assert_eq!(
            pallet_balances::Pallet::<Test>::free_balance(charlie()),
            4950
        );
        assert_eq!(pallet_balances::Pallet::<Test>::free_balance(alice()), 21);
        assert_eq!(pallet_balances::Pallet::<Test>::free_balance(bob()), 130);
    });
}

// Utility functions tests

#[test]
pub fn has_vote_passed_ok() {
    new_test_ext().execute_with(|| {
        // Example 1
        assert_eq!(Veles::has_vote_passed(6, 4), true);
        assert_eq!(Veles::has_vote_passed(6, 1), false);
        assert_eq!(Veles::has_vote_passed(6, 5), true);

        // Example 2
        let new_pass_ration = ProportionStructure {
            proportion_part: 10,
            upper_limit_part: 0,
        };
        VotePassRatio::<Test>::set(new_pass_ration);

        assert_eq!(Veles::has_vote_passed(6, 4), true);
        assert_eq!(Veles::has_vote_passed(6, 5), true);
        assert_eq!(Veles::has_vote_passed(3, 1), false);

        // // Example 3
        let new_pass_ration = ProportionStructure {
            proportion_part: 1,
            upper_limit_part: 1,
        };
        VotePassRatio::<Test>::set(new_pass_ration);

        assert_eq!(Veles::has_vote_passed(6, 4), false);
        assert_eq!(Veles::has_vote_passed(6, 6), true);
        assert_eq!(Veles::has_vote_passed(2, 1), false);
    });
}

// Offchain worker tests

#[test]
pub fn update_carbon_footprint_report_new_account_ok() {
    new_test_ext().execute_with(|| {
        // Insert carbon footprint report
        let mut votes_for = BTreeSet::<AccountId>::new();
        votes_for.insert(bob());

        let report_info = CarbonFootprintReportInfo {
            cf_account: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            carbon_footprint_surplus: BalanceOf::<Test>::from(0u32),
            carbon_footprint_deficit: BalanceOf::<Test>::from(100u32),
            votes_for: BTreeSet::<AccountId>::new(),
            votes_against: BTreeSet::<AccountId>::new(),
            voting_active: true,
        };

        let report_ipfs = BoundedString::<IPFSLength>::truncate_from("report_ipfs");

        CarbonFootprintReports::<Test>::insert(report_ipfs.clone(), report_info);

        // Successfully update carbon footprint report
        assert_ok!(Veles::update_carbon_footprint_report(
            RuntimeOrigin::signed(charlie()),
            report_ipfs.clone()
        ));

        // Check if voting has closed
        let report = CarbonFootprintReports::<Test>::get(report_ipfs.clone()).unwrap();

        assert_eq!(report.voting_active, false);

        // Check if carbon footprint account has been saved
        let account = CarbonFootprintAccounts::<Test>::get(alice()).unwrap();

        assert_eq!(account.documentation_ipfses.contains(&report_ipfs), true);
        assert_eq!(account.carbon_footprint_surplus, 0);
        assert_eq!(account.carbon_footprint_deficit, 100);
        assert_eq!(
            account.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );
    });
}

#[test]
pub fn update_carbon_footprint_report_old_account_ok() {
    new_test_ext().execute_with(|| {
        // Insert carbon footprint account
        let mut documentation_ipfses = BTreeSet::<BoundedString<IPFSLength>>::new();
        let report_1_ipfs = BoundedString::<IPFSLength>::truncate_from("report_1_ipfs");
        documentation_ipfses.insert(report_1_ipfs.clone());

        let cf_account = CarbonFootprintAccountInfo {
            documentation_ipfses: documentation_ipfses,
            carbon_footprint_surplus: BalanceOf::<Test>::from(50u32),
            carbon_footprint_deficit: BalanceOf::<Test>::from(0u32),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
        };

        CarbonFootprintAccounts::<Test>::insert(alice(), cf_account);

        // Insert carbon footprint report
        let mut votes_for = BTreeSet::<AccountId>::new();
        votes_for.insert(bob());

        let report_info = CarbonFootprintReportInfo {
            cf_account: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            carbon_footprint_surplus: BalanceOf::<Test>::from(0u32),
            carbon_footprint_deficit: BalanceOf::<Test>::from(100u32),
            votes_for: BTreeSet::<AccountId>::new(),
            votes_against: BTreeSet::<AccountId>::new(),
            voting_active: true,
        };

        let report_2_ipfs = BoundedString::<IPFSLength>::truncate_from("report_2_ipfs");

        CarbonFootprintReports::<Test>::insert(report_2_ipfs.clone(), report_info);

        // Successfully update carbon footprint report
        assert_ok!(Veles::update_carbon_footprint_report(
            RuntimeOrigin::signed(charlie()),
            report_2_ipfs.clone()
        ));

        // Check if voting has closed
        let report = CarbonFootprintReports::<Test>::get(report_2_ipfs.clone()).unwrap();

        assert_eq!(report.voting_active, false);

        // Check if carbon footprint account has been saved
        let account = CarbonFootprintAccounts::<Test>::get(alice()).unwrap();

        assert_eq!(account.documentation_ipfses.contains(&report_1_ipfs), true);
        assert_eq!(account.documentation_ipfses.contains(&report_2_ipfs), true);
        assert_eq!(account.carbon_footprint_surplus, 0);
        assert_eq!(account.carbon_footprint_deficit, 50);
        assert_eq!(
            account.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );
    });
}

#[test]
pub fn update_project_proposal_ok() {
    new_test_ext().execute_with(|| {
        // Insert carbon footprint report
        let mut votes_for = BTreeSet::<AccountId>::new();
        votes_for.insert(bob());

        let project_hash = generate_hash(alice());

        let proposal = ProjectProposalInfo {
            project_owner: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            project_hash: project_hash,
            votes_for: votes_for,
            votes_against: BTreeSet::<AccountId>::new(),
            voting_active: true,
        };

        let proposal_ipfs = BoundedString::<IPFSLength>::truncate_from("proposal_ipfs");

        ProjectProposals::<Test>::insert(proposal_ipfs.clone(), proposal);

        // Successfully update project proposal
        assert_ok!(Veles::update_project_proposal(
            RuntimeOrigin::signed(charlie()),
            proposal_ipfs.clone()
        ));

        // Check if voting has closed
        let proposal = ProjectProposals::<Test>::get(proposal_ipfs.clone()).unwrap();

        assert_eq!(proposal.voting_active, false);

        // Check if project has been saved
        let project = Projects::<Test>::get(project_hash).unwrap();

        assert_eq!(project.documentation_ipfs, proposal_ipfs);
        assert_eq!(project.project_owner, alice());
        assert_eq!(
            project.creation_date,
            <mock::Test as pallet::Config>::Time::now()
        );
        assert_eq!(project.penalty_level, 0);
        assert_eq!(project.penalty_timeout, BlockNumber::<Test>::from(0u32));
    });
}

#[test]
pub fn update_project_penalty_level_zero_penalty_level_ok() {
    new_test_ext().execute_with(|| {
        // Insert project
        let project_hash = generate_hash(alice());

        let project_info = ProjectInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from("project_ipfs"),
            project_owner: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            penalty_level: 1,
            penalty_timeout: BlockNumber::<Test>::from(120u32),
        };

        Projects::<Test>::insert(project_hash, project_info);

        // Successfully update project penalty level
        assert_ok!(Veles::update_project_penalty_level(
            RuntimeOrigin::signed(alice()),
            project_hash
        ));

        // Check if project penalty level has been updated
        let project = Projects::<Test>::get(project_hash).unwrap();

        assert_eq!(project.penalty_level, 0);
        assert_eq!(project.penalty_timeout, 0);
    });
}

#[test]
pub fn update_project_penalty_level_non_zero_penalty_level_ok() {
    new_test_ext().execute_with(|| {
        // Insert project
        let project_hash = generate_hash(alice());

        let project_info = ProjectInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from("project_ipfs"),
            project_owner: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            penalty_level: 2,
            penalty_timeout: BlockNumber::<Test>::from(320u32),
        };

        Projects::<Test>::insert(project_hash, project_info);

        // Successfully update project penalty level
        assert_ok!(Veles::update_project_penalty_level(
            RuntimeOrigin::signed(alice()),
            project_hash
        ));

        // Check if project penalty level has been updated
        let project = Projects::<Test>::get(project_hash).unwrap();

        assert_eq!(project.penalty_level, 1);
        assert_eq!(project.penalty_timeout, 446400);
    });
}

#[test]
pub fn update_validator_penalty_level_zero_penalty_level_ok() {
    new_test_ext().execute_with(|| {
        // Insert validator
        let validator_info = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from("documentation_ipfs"),
            penalty_level: 1,
            penalty_timeout: BlockNumber::<Test>::from(120u32),
        };

        Validators::<Test>::insert(alice(), validator_info);

        // Successfully update validator penalty level
        assert_ok!(Veles::update_validator_penalty_level(
            RuntimeOrigin::signed(alice()),
            alice()
        ));

        // Check if validator penalty level has been updated
        let validator = Validators::<Test>::get(alice()).unwrap();

        assert_eq!(validator.penalty_level, 0);
        assert_eq!(validator.penalty_timeout, 0);
    });
}

#[test]
pub fn update_validator_penalty_level_non_zero_penalty_level_ok() {
    new_test_ext().execute_with(|| {
        // Insert validator
        let validator_info = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from("documentation_ipfs"),
            penalty_level: 2,
            penalty_timeout: BlockNumber::<Test>::from(120u32),
        };

        Validators::<Test>::insert(alice(), validator_info);

        // Successfully update validator penalty level
        assert_ok!(Veles::update_validator_penalty_level(
            RuntimeOrigin::signed(alice()),
            alice()
        ));

        // Check if validator penalty level has been updated
        let validator = Validators::<Test>::get(alice()).unwrap();

        assert_eq!(validator.penalty_level, 1);
        assert_eq!(validator.penalty_timeout, 446400);
    });
}

#[test]
pub fn update_project_owner_penalty_level_zero_penalty_level_ok() {
    new_test_ext().execute_with(|| {
        // Insert project owner
        let project_owner_info = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from("documentation_ipfs"),
            penalty_level: 1,
            penalty_timeout: BlockNumber::<Test>::from(120u32),
        };

        ProjectOwners::<Test>::insert(alice(), project_owner_info);

        // Successfully update project owner penalty level
        assert_ok!(Veles::update_project_owner_penalty_level(
            RuntimeOrigin::signed(alice()),
            alice()
        ));

        // Check if project owner penalty level has been updated
        let project_owner_info = ProjectOwners::<Test>::get(alice()).unwrap();

        assert_eq!(project_owner_info.penalty_level, 0);
        assert_eq!(project_owner_info.penalty_timeout, 0);
    });
}

#[test]
pub fn update_project_owner_penalty_level_non_zero_penalty_level_ok() {
    new_test_ext().execute_with(|| {
        // Insert project owner
        let project_owner_info = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from("documentation_ipfs"),
            penalty_level: 2,
            penalty_timeout: BlockNumber::<Test>::from(120u32),
        };

        ProjectOwners::<Test>::insert(alice(), project_owner_info);

        // Successfully update project owner penalty level
        assert_ok!(Veles::update_project_owner_penalty_level(
            RuntimeOrigin::signed(alice()),
            alice()
        ));

        // Check if project owner penalty level has been updated
        let project_owner_info = ProjectOwners::<Test>::get(alice()).unwrap();

        assert_eq!(project_owner_info.penalty_level, 1);
        assert_eq!(project_owner_info.penalty_timeout, 446400);
    });
}

#[test]
pub fn update_carbon_credit_sale_order_ok() {
    new_test_ext().execute_with(|| {
        // Insert trader account
        let mut new_traders = TraderAccounts::<Test>::get();
        new_traders.insert(alice());
        TraderAccounts::<Test>::set(new_traders);

        // Insert carbon credit holdings
        let batch_hash = generate_hash(alice());

        let credit_holdings = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<Test>::from(20u32),
            unavailable_amount: BalanceOf::<Test>::from(15u32),
        };

        CarbonCreditHoldings::<Test>::insert(batch_hash, alice(), credit_holdings);

        // Insert sale order
        let sale_order = CarbonCreditSaleOrderInfo {
            batch_hash: batch_hash,
            credit_amount: BalanceOf::<Test>::from(10u32),
            credit_price: BalanceOf::<Test>::from(5u32),
            seller: alice(),
            buyer: alice(),
            sale_active: true,
            sale_timeout: BlockNumber::<Test>::from(10u32),
        };

        let sale_hash = generate_hash(charlie());

        CarbonCreditSaleOrders::<Test>::insert(sale_hash, sale_order);

        // Successfully update carbon credit sale order
        assert_ok!(Veles::update_carbon_credit_sale_order(
            RuntimeOrigin::signed(alice()),
            sale_hash
        ));

        // Check if the carbon credit sale order has been updated
        let sale_order = CarbonCreditSaleOrders::<Test>::get(sale_hash).unwrap();

        assert_eq!(sale_order.sale_active, false);

        // Check if the carbon credit holdings have been updated
        let credit_holdings = CarbonCreditHoldings::<Test>::get(batch_hash, alice()).unwrap();

        assert_eq!(
            credit_holdings.available_amount,
            BalanceOf::<Test>::from(30u32)
        );
        assert_eq!(
            credit_holdings.unavailable_amount,
            BalanceOf::<Test>::from(5u32)
        );
    });
}

#[test]
pub fn update_carbon_credit_batch_proposal_ok() {
    new_test_ext().execute_with(|| {
        // Insert project owner
        let project_owner_info = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from("documentation_ipfs"),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        ProjectOwners::<Test>::insert(alice(), project_owner_info);

        // Insert project
        let project_hash = generate_hash(bob());

        let project_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("project_documentation_ipfs");

        let project = ProjectInfo {
            documentation_ipfs: project_documentation_ipfs,
            project_owner: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Projects::<Test>::insert(project_hash, project);

        // Insert carbon credit batch proposal
        let proposal_ipfs = BoundedString::<IPFSLength>::truncate_from("proposal_ipfs");

        let batch_hash = generate_hash(charlie());

        let mut votes_for = BTreeSet::<AccountId>::new();
        votes_for.insert(bob());

        let proposal = CarbonCreditBatchProposalInfo {
            project_hash,
            batch_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: 100u32.into(),
            penalty_repay_price: 5u32.into(),
            votes_for: votes_for,
            votes_against: BTreeSet::<AccountId>::new(),
            voting_active: true,
        };

        CarbonCreditBatchProposals::<Test>::insert(proposal_ipfs.clone(), proposal);

        // Successfully update carbon credit batch proposal
        assert_ok!(Veles::update_carbon_credit_batch_proposal(
            RuntimeOrigin::signed(alice()),
            proposal_ipfs.clone()
        ));

        // Check if the carbon credit batch proposal has been updated
        let proposal = CarbonCreditBatchProposals::<Test>::get(proposal_ipfs).unwrap();

        assert_eq!(proposal.voting_active, false);

        // Chech if the carbon credit holdings has been updated
        let credit_holdings = CarbonCreditHoldings::<Test>::get(batch_hash, alice()).unwrap();

        assert_eq!(
            credit_holdings.available_amount,
            BalanceOf::<Test>::from(100u32)
        );
        assert_eq!(
            credit_holdings.unavailable_amount,
            BalanceOf::<Test>::from(0u32)
        );
    });
}

#[test]
pub fn update_complaint_for_account_project_owner_zero_level_ok() {
    new_test_ext().execute_with(|| {
        // Insert project owner
        let project_owner_info = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from("documentation_ipfs"),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        ProjectOwners::<Test>::insert(alice(), project_owner_info);

        // Insert complaint for account type
        let complaint_ipfs = BoundedString::<IPFSLength>::truncate_from("complaint_ipfs");

        let mut votes_for = BTreeSet::<AccountId>::new();
        votes_for.insert(charlie());

        let complaint = ComplaintAccountBasedInfo {
            complaint_proposer: bob(),
            complaint_type: ComplaintType::ProjectOwnerComplaint,
            complaint_for: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            votes_for: votes_for,
            votes_against: BTreeSet::<AccountIdOf<Test>>::new(),
            complaint_active: true,
        };

        ComplaintsForAccounts::<Test>::insert(complaint_ipfs.clone(), complaint);

        // Successfully update complaint for account
        assert_ok!(Veles::update_complaint_for_account(
            RuntimeOrigin::signed(alice()),
            complaint_ipfs.clone()
        ));

        // Check if the complaint has been updated
        let complaint = ComplaintsForAccounts::<Test>::get(complaint_ipfs.clone()).unwrap();

        assert_eq!(complaint.complaint_active, false);

        // Check if the project owner has been updated
        let project_owner_info = ProjectOwners::<Test>::get(alice()).unwrap();

        assert_eq!(project_owner_info.penalty_level, 1);
        assert_eq!(project_owner_info.penalty_timeout, 446400);

        // Check if the penalty timeouts have updated
        let penalty_timeouts = PenaltyTimeoutsAccounts::<Test>::get(446400).unwrap();

        assert_eq!(penalty_timeouts.contains(&alice()), true);
    });
}

#[test]
pub fn update_complaint_for_account_project_owner_non_zero_level_ok() {
    new_test_ext().execute_with(|| {
        // Insert project owner
        let project_owner_info = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from("documentation_ipfs"),
            penalty_level: 1,
            penalty_timeout: BlockNumber::<Test>::from(120u32),
        };

        ProjectOwners::<Test>::insert(alice(), project_owner_info);

        // Insert complaint for account type
        let complaint_ipfs = BoundedString::<IPFSLength>::truncate_from("complaint_ipfs");

        let mut votes_for = BTreeSet::<AccountId>::new();
        votes_for.insert(charlie());

        let complaint = ComplaintAccountBasedInfo {
            complaint_proposer: bob(),
            complaint_type: ComplaintType::ProjectOwnerComplaint,
            complaint_for: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            votes_for: votes_for,
            votes_against: BTreeSet::<AccountIdOf<Test>>::new(),
            complaint_active: true,
        };

        ComplaintsForAccounts::<Test>::insert(complaint_ipfs.clone(), complaint);

        // Insert penalty timeout
        let mut penalty_accounts = BTreeSet::<AccountIdOf<Test>>::new();
        penalty_accounts.insert(alice());

        PenaltyTimeoutsAccounts::<Test>::insert(120, penalty_accounts);

        // Successfully update complaint for account
        assert_ok!(Veles::update_complaint_for_account(
            RuntimeOrigin::signed(alice()),
            complaint_ipfs.clone()
        ));

        // Check if the complaint has been updated
        let complaint = ComplaintsForAccounts::<Test>::get(complaint_ipfs.clone()).unwrap();

        assert_eq!(complaint.complaint_active, false);

        // Check if the project owner has been updated
        let project_owner_info = ProjectOwners::<Test>::get(alice()).unwrap();

        assert_eq!(project_owner_info.penalty_level, 2);
        assert_eq!(project_owner_info.penalty_timeout, 446400);

        // Check if the new penalty timeouts have updated
        let penalty_timeouts = PenaltyTimeoutsAccounts::<Test>::get(446400).unwrap();

        assert_eq!(penalty_timeouts.contains(&alice()), true);

        // Check if the old penalty timeouts have updated
        let penalty_timeouts = PenaltyTimeoutsAccounts::<Test>::get(120).unwrap();

        assert_eq!(penalty_timeouts.contains(&alice()), false);
    });
}

#[test]
pub fn update_complaint_for_account_validator_zero_level_ok() {
    new_test_ext().execute_with(|| {
        // Insert validator
        let validator_info = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from("documentation_ipfs"),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Validators::<Test>::insert(alice(), validator_info);

        // Insert complaint for account type
        let complaint_ipfs = BoundedString::<IPFSLength>::truncate_from("complaint_ipfs");

        let mut votes_for = BTreeSet::<AccountId>::new();
        votes_for.insert(charlie());

        let complaint = ComplaintAccountBasedInfo {
            complaint_proposer: bob(),
            complaint_type: ComplaintType::ValidatorComplaint,
            complaint_for: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            votes_for: votes_for,
            votes_against: BTreeSet::<AccountIdOf<Test>>::new(),
            complaint_active: true,
        };

        ComplaintsForAccounts::<Test>::insert(complaint_ipfs.clone(), complaint);

        // Successfully update complaint for account
        assert_ok!(Veles::update_complaint_for_account(
            RuntimeOrigin::signed(alice()),
            complaint_ipfs.clone()
        ));

        // Check if the complaint has been updated
        let complaint = ComplaintsForAccounts::<Test>::get(complaint_ipfs.clone()).unwrap();

        assert_eq!(complaint.complaint_active, false);

        // Check if the project owner has been updated
        let validator_info = Validators::<Test>::get(alice()).unwrap();

        assert_eq!(validator_info.penalty_level, 1);
        assert_eq!(validator_info.penalty_timeout, 446400);

        // Check if the penalty timeouts have updated
        let penalty_timeouts = PenaltyTimeoutsAccounts::<Test>::get(446400).unwrap();

        assert_eq!(penalty_timeouts.contains(&alice()), true);
    });
}

#[test]
pub fn update_complaint_for_account_validator_non_zero_level_ok() {
    new_test_ext().execute_with(|| {
        // Insert validator
        let validator_info = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<IPFSLength>::truncate_from("documentation_ipfs"),
            penalty_level: 1,
            penalty_timeout: BlockNumber::<Test>::from(120u32),
        };

        Validators::<Test>::insert(alice(), validator_info);

        // Insert complaint for account type
        let complaint_ipfs = BoundedString::<IPFSLength>::truncate_from("complaint_ipfs");

        let mut votes_for = BTreeSet::<AccountId>::new();
        votes_for.insert(charlie());

        let complaint = ComplaintAccountBasedInfo {
            complaint_proposer: bob(),
            complaint_type: ComplaintType::ValidatorComplaint,
            complaint_for: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            votes_for: votes_for,
            votes_against: BTreeSet::<AccountIdOf<Test>>::new(),
            complaint_active: true,
        };

        ComplaintsForAccounts::<Test>::insert(complaint_ipfs.clone(), complaint);

        // Insert penalty timeout
        let mut penalty_accounts = BTreeSet::<AccountIdOf<Test>>::new();
        penalty_accounts.insert(alice());

        PenaltyTimeoutsAccounts::<Test>::insert(120, penalty_accounts);

        // Successfully update complaint for account
        assert_ok!(Veles::update_complaint_for_account(
            RuntimeOrigin::signed(alice()),
            complaint_ipfs.clone()
        ));

        // Check if the complaint has been updated
        let complaint = ComplaintsForAccounts::<Test>::get(complaint_ipfs.clone()).unwrap();

        assert_eq!(complaint.complaint_active, false);

        // Check if the project owner has been updated
        let validator_info = Validators::<Test>::get(alice()).unwrap();

        assert_eq!(validator_info.penalty_level, 2);
        assert_eq!(validator_info.penalty_timeout, 446400);

        // Check if the new penalty timeouts have updated
        let penalty_timeouts = PenaltyTimeoutsAccounts::<Test>::get(446400).unwrap();

        assert_eq!(penalty_timeouts.contains(&alice()), true);

        // Check if the old penalty timeouts have updated
        let penalty_timeouts = PenaltyTimeoutsAccounts::<Test>::get(120).unwrap();

        assert_eq!(penalty_timeouts.contains(&alice()), false);
    });
}

#[test]
pub fn update_complaint_for_hash_project_zero_level_ok() {
    new_test_ext().execute_with(|| {
        // Insert project
        let project_hash = generate_hash(alice());

        let project_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("project_documentation_ipfs");

        let project_info = ProjectInfo {
            documentation_ipfs: project_documentation_ipfs,
            project_owner: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Projects::<Test>::insert(project_hash, project_info);

        // Insert complaint for hash type
        let complaint_ipfs = BoundedString::<IPFSLength>::truncate_from("complaint_ipfs");

        let mut votes_for = BTreeSet::<AccountId>::new();
        votes_for.insert(charlie());

        let complaint = ComplaintHashBasedInfo {
            complaint_proposer: bob(),
            complaint_type: ComplaintType::ProjectComplaint,
            complaint_for: project_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            votes_for: votes_for,
            votes_against: BTreeSet::<AccountIdOf<Test>>::new(),
            complaint_active: true,
        };

        ComplaintsForHashes::<Test>::insert(complaint_ipfs.clone(), complaint);

        // Successfully update complaint for hash
        assert_ok!(Veles::update_complaint_for_hash(
            RuntimeOrigin::signed(alice()),
            complaint_ipfs.clone()
        ));

        // Check if the complaint has been updated
        let complaint = ComplaintsForHashes::<Test>::get(complaint_ipfs.clone()).unwrap();

        assert_eq!(complaint.complaint_active, false);

        // Check if the project has been updated
        let project_info = Projects::<Test>::get(project_hash).unwrap();

        assert_eq!(project_info.penalty_level, 1);
        assert_eq!(project_info.penalty_timeout, 446400);

        // Check if the penalty timeouts have updated
        let penalty_timeouts = PenaltyTimeoutsHashes::<Test>::get(446400).unwrap();

        assert_eq!(penalty_timeouts.contains(&project_hash), true);
    });
}

#[test]
pub fn update_complaint_for_hash_project_non_zero_level_ok() {
    new_test_ext().execute_with(|| {
        // Insert project
        let project_hash = generate_hash(alice());

        let project_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("project_documentation_ipfs");

        let project_info = ProjectInfo {
            documentation_ipfs: project_documentation_ipfs,
            project_owner: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            penalty_level: 1,
            penalty_timeout: BlockNumber::<Test>::from(120u32),
        };

        Projects::<Test>::insert(project_hash, project_info);

        // Insert complaint for hash type
        let complaint_ipfs = BoundedString::<IPFSLength>::truncate_from("complaint_ipfs");

        let mut votes_for = BTreeSet::<AccountId>::new();
        votes_for.insert(charlie());

        let complaint = ComplaintHashBasedInfo {
            complaint_proposer: bob(),
            complaint_type: ComplaintType::ProjectComplaint,
            complaint_for: project_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            votes_for: votes_for,
            votes_against: BTreeSet::<AccountIdOf<Test>>::new(),
            complaint_active: true,
        };

        ComplaintsForHashes::<Test>::insert(complaint_ipfs.clone(), complaint);

        // Insert penalty timeout
        let mut penalty_hashes = BTreeSet::<H256>::new();
        penalty_hashes.insert(project_hash);

        PenaltyTimeoutsHashes::<Test>::insert(120, penalty_hashes);

        // Successfully update complaint for hash
        assert_ok!(Veles::update_complaint_for_hash(
            RuntimeOrigin::signed(alice()),
            complaint_ipfs.clone()
        ));

        // Check if the complaint has been updated
        let complaint = ComplaintsForHashes::<Test>::get(complaint_ipfs.clone()).unwrap();

        assert_eq!(complaint.complaint_active, false);

        // Check if the project has been updated
        let project_info = Projects::<Test>::get(project_hash).unwrap();

        assert_eq!(project_info.penalty_level, 2);
        assert_eq!(project_info.penalty_timeout, 446400);

        // Check if the new penalty timeouts have updated
        let penalty_timeouts = PenaltyTimeoutsHashes::<Test>::get(446400).unwrap();

        assert_eq!(penalty_timeouts.contains(&project_hash), true);

        // Check if the old penalty timeouts have updated
        let penalty_timeouts = PenaltyTimeoutsHashes::<Test>::get(120).unwrap();

        assert_eq!(penalty_timeouts.contains(&project_hash), false);
    });
}

#[test]
pub fn update_complaint_for_hash_carbon_credit_batch_ok() {
    new_test_ext().execute_with(|| {
        let project_hash = generate_hash(alice());
        let batch_hash = generate_hash(bob());

        // Insert project owner
        let owner_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: 0,
        };

        ProjectOwners::<Test>::insert(alice(), project_owner);

        // Insert project
        let project_documentation =
            BoundedString::<IPFSLength>::truncate_from("project_documentation");

        let project = ProjectInfo {
            documentation_ipfs: project_documentation,
            project_owner: alice(),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<Test>::from(0u32),
        };

        Projects::<Test>::insert(project_hash, project);

        // Insert carbon credit batch
        let batch_documentation_ipfs =
            BoundedString::<IPFSLength>::truncate_from("batch_documentation_ipfs");

        let batch = CarbonCreditBatchInfo {
            documentation_ipfs: batch_documentation_ipfs,
            project_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            credit_amount: BalanceOf::<Test>::from(10000u32),
            penalty_repay_price: BalanceOf::<Test>::from(2u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<Test>>::new(),
        };

        CarbonCreditBatches::<Test>::insert(batch_hash, batch);

        // Insert carbon credit holdings (owner)
        let credit_holdings = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<Test>::from(120u32),
            unavailable_amount: BalanceOf::<Test>::from(10u32),
        };

        CarbonCreditHoldings::<Test>::insert(batch_hash, alice(), credit_holdings);

        // Insert carbon footprint account (#1)
        let mut documentation_ipfses_1 = BTreeSet::<BoundedString<IPFSLength>>::new();
        let documentation_ipfs_1 =
            BoundedString::<IPFSLength>::truncate_from("documentation_ipfs_1");

        documentation_ipfses_1.insert(documentation_ipfs_1);

        let carbon_footprint_account_1 = CarbonFootprintAccountInfo {
            documentation_ipfses: documentation_ipfses_1,
            carbon_footprint_surplus: BalanceOf::<Test>::from(50u32),
            carbon_footprint_deficit: BalanceOf::<Test>::from(0u32),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
        };

        CarbonFootprintAccounts::<Test>::insert(bob(), carbon_footprint_account_1);

        // Insert carbon footprint account (#2)
        let mut documentation_ipfses_2 = BTreeSet::<BoundedString<IPFSLength>>::new();
        let documentation_ipfs_2 =
            BoundedString::<IPFSLength>::truncate_from("documentation_ipfs_2");

        documentation_ipfses_2.insert(documentation_ipfs_2);

        let carbon_footprint_account_2 = CarbonFootprintAccountInfo {
            documentation_ipfses: documentation_ipfses_2,
            carbon_footprint_surplus: BalanceOf::<Test>::from(0u32),
            carbon_footprint_deficit: BalanceOf::<Test>::from(1000u32),
            creation_date: <mock::Test as pallet::Config>::Time::now(),
        };

        CarbonFootprintAccounts::<Test>::insert(charlie(), carbon_footprint_account_2);

        // Insert retirement (#1)
        let retirement_hash_1 = generate_hash(dave());

        let retirement_1 = CarbonCreditRetirementInfo {
            carbon_footprint_account: bob(),
            batch_hash: batch_hash,
            credit_amount: BalanceOf::<Test>::from(100u32),
            retirement_date: <mock::Test as pallet::Config>::Time::now(),
        };

        CarbonCreditRetirements::<Test>::insert(retirement_hash_1, retirement_1);

        // Insert retirement (#2)
        let retirement_hash_2 = generate_hash(fred());

        let retirement_2 = CarbonCreditRetirementInfo {
            carbon_footprint_account: charlie(),
            batch_hash: batch_hash,
            credit_amount: BalanceOf::<Test>::from(123u32),
            retirement_date: <mock::Test as pallet::Config>::Time::now(),
        };

        CarbonCreditRetirements::<Test>::insert(retirement_hash_2, retirement_2);

        // Insert carbon credit holdings (trader #1)
        let credit_holdings_1 = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<Test>::from(100u32),
            unavailable_amount: BalanceOf::<Test>::from(0u32),
        };

        CarbonCreditHoldings::<Test>::insert(batch_hash, dave(), credit_holdings_1);

        // Insert carbon credit holdings (trader #2)
        let credit_holdings_2 = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<Test>::from(0u32),
            unavailable_amount: BalanceOf::<Test>::from(250u32),
        };

        CarbonCreditHoldings::<Test>::insert(batch_hash, fred(), credit_holdings_2);

        // Insert carbon credit holdings (trader #3)
        let credit_holdings_3 = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<Test>::from(300u32),
            unavailable_amount: BalanceOf::<Test>::from(50u32),
        };

        CarbonCreditHoldings::<Test>::insert(batch_hash, george(), credit_holdings_3);

        // Insert complaint for hash type
        let complaint_ipfs = BoundedString::<IPFSLength>::truncate_from("complaint_ipfs");

        let mut votes_for = BTreeSet::<AccountId>::new();
        votes_for.insert(hank());

        let complaint = ComplaintHashBasedInfo {
            complaint_proposer: ian(),
            complaint_type: ComplaintType::CarbonCreditBatchComplaint,
            complaint_for: batch_hash,
            creation_date: <mock::Test as pallet::Config>::Time::now(),
            votes_for: votes_for,
            votes_against: BTreeSet::<AccountIdOf<Test>>::new(),
            complaint_active: true,
        };

        ComplaintsForHashes::<Test>::insert(complaint_ipfs.clone(), complaint);

        // Successfully update complaint for hash
        assert_ok!(Veles::update_complaint_for_hash(
            RuntimeOrigin::signed(alice()),
            complaint_ipfs.clone()
        ));

        // Check carbon credit batch
        let batch_info = CarbonCreditBatches::<Test>::get(batch_hash).unwrap();

        assert_eq!(batch_info.status, CarbonCreditBatchStatus::Redacted);

        // Check carbon footprint balances
        let carbon_footprint_account_1 = CarbonFootprintAccounts::<Test>::get(bob()).unwrap();

        assert_eq!(
            carbon_footprint_account_1.carbon_footprint_surplus,
            BalanceOf::<Test>::from(0u32)
        );
        assert_eq!(
            carbon_footprint_account_1.carbon_footprint_deficit,
            BalanceOf::<Test>::from(50u32)
        );

        let carbon_footprint_account_2 = CarbonFootprintAccounts::<Test>::get(charlie()).unwrap();

        assert_eq!(
            carbon_footprint_account_2.carbon_footprint_surplus,
            BalanceOf::<Test>::from(0u32)
        );
        assert_eq!(
            carbon_footprint_account_2.carbon_footprint_deficit,
            BalanceOf::<Test>::from(1123u32)
        );

        // Check debts
        assert_eq!(ProjectOwnerDebts::<Test>::contains_key(&alice()), true);

        let debts = ProjectOwnerDebts::<Test>::get(alice());

        assert_eq!(debts.len(), 6);
        assert_eq!(debts.contains_key(&bob()), true);
        assert_eq!(debts.contains_key(&charlie()), true);
        assert_eq!(debts.contains_key(&dave()), true);
        assert_eq!(debts.contains_key(&fred()), true);
        assert_eq!(debts.contains_key(&george()), true);
        assert_eq!(debts.contains_key(&pallet_id()), true);

        assert_eq!(*debts.get(&bob()).unwrap(), BalanceOf::<Test>::from(200u32));
        assert_eq!(
            *debts.get(&charlie()).unwrap(),
            BalanceOf::<Test>::from(246u32)
        );
        assert_eq!(
            *debts.get(&dave()).unwrap(),
            BalanceOf::<Test>::from(200u32)
        );
        assert_eq!(
            *debts.get(&fred()).unwrap(),
            BalanceOf::<Test>::from(500u32)
        );
        assert_eq!(
            *debts.get(&george()).unwrap(),
            BalanceOf::<Test>::from(700u32)
        );
        assert_eq!(
            *debts.get(&pallet_id()).unwrap(),
            BalanceOf::<Test>::from(260u32)
        );
    });
}
