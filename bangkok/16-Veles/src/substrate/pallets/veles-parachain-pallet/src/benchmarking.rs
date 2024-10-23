#![cfg(feature = "runtime-benchmarks")]

use super::*;

use crate::Pallet as Veles;
use codec::Decode;
use frame_benchmarking::benchmarks;
use frame_support::traits::Time;
use frame_system::{EventRecord, RawOrigin};

fn alice<T: Config>() -> T::AccountId {
    let bytes = [1u8; 32];

    T::AccountId::decode(&mut &bytes[..]).unwrap()
}

fn bob<T: Config>() -> T::AccountId {
    let bytes = [2u8; 32];

    T::AccountId::decode(&mut &bytes[..]).unwrap()
}

fn charlie<T: Config>() -> T::AccountId {
    let bytes = [3u8; 32];

    T::AccountId::decode(&mut &bytes[..]).unwrap()
}

fn dave<T: Config>() -> T::AccountId {
    let bytes = [4u8; 32];

    T::AccountId::decode(&mut &bytes[..]).unwrap()
}

fn fred<T: Config>() -> T::AccountId {
    let bytes = [5u8; 32];

    T::AccountId::decode(&mut &bytes[..]).unwrap()
}

pub fn george<T: Config>() -> T::AccountId {
    let bytes = [6u8; 32];

    T::AccountId::decode(&mut &bytes[..]).unwrap()
}

pub fn hank<T: Config>() -> T::AccountId {
    let bytes = [7u8; 32];

    T::AccountId::decode(&mut &bytes[..]).unwrap()
}

pub fn ian<T: Config>() -> T::AccountId {
    let bytes = [8u8; 32];

    T::AccountId::decode(&mut &bytes[..]).unwrap()
}

pub fn generate_hash<T: Config>(user: AccountIdOf<T>) -> H256 {
    let nonce = frame_system::Pallet::<T>::account_nonce(&user);
    let now = T::Time::now();

    let encoded: [u8; 32] = (&user, nonce, now).using_encoded(blake2_256);

    let hash = H256::from(encoded);

    hash
}

fn assert_last_event<T: Config>(generic_event: <T as Config>::RuntimeEvent) {
    let events = frame_system::Pallet::<T>::events();
    let system_event: <T as frame_system::Config>::RuntimeEvent = generic_event.into();

    let EventRecord { event, .. } = &events[events.len() - 1];

    assert_eq!(event, &system_event);
}

benchmarks! {
    update_vote_pass_ratio {
        let user = alice::<T>();
        let new_proportion_part = 2u16;
        let	new_upper_limit_part = 3u16;

        let mut authorities = AuthorityAccounts::<T>::get();
        authorities.insert(user.clone());
        AuthorityAccounts::<T>::set(authorities);
    } : {
        Veles::<T>::update_vote_pass_ratio(
            RawOrigin::Signed(user.clone()).into(),
            new_proportion_part,
            new_upper_limit_part,
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::VotePassRatioUpdated(new_proportion_part, new_upper_limit_part).into());
    }

    update_penalty_levels {
        let user = alice::<T>();
        let new_proportion_part = 2u16;
        let	new_upper_limit_part = 3u16;

        let mut authorities = AuthorityAccounts::<T>::get();
        authorities.insert(user.clone());
        AuthorityAccounts::<T>::set(authorities);
    } : {
        Veles::<T>::update_vote_pass_ratio(
            RawOrigin::Signed(user.clone()).into(),
            new_proportion_part,
            new_upper_limit_part,
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::VotePassRatioUpdated(new_proportion_part, new_upper_limit_part).into());
    }

    update_beneficiary_splits {
        let user = alice::<T>();

        let mut new_beneficiary_splits = BTreeMap::<u8, BalanceOf<T>>::new();
        new_beneficiary_splits.insert(0, 4500u32.into());
        new_beneficiary_splits.insert(1, 1500u32.into());
        new_beneficiary_splits.insert(2, 3000u32.into());

        let mut authorities = AuthorityAccounts::<T>::get();
        authorities.insert(user.clone());
        AuthorityAccounts::<T>::set(authorities);
    } : {
        Veles::<T>::update_beneficiary_splits(
            RawOrigin::Signed(user.clone()).into(),
            new_beneficiary_splits.clone(),
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::BeneficiarySplitsUpdated(new_beneficiary_splits).into());
    }

    update_time_value {
        let user = alice::<T>();

        let time_type = TimeType::SalesTimeout;
        let new_time_value = BlockNumber::<T>::from(1u32);

        let mut authorities = AuthorityAccounts::<T>::get();
        authorities.insert(user.clone());
        AuthorityAccounts::<T>::set(authorities);
    } : {
        Veles::<T>::update_time_value(
            RawOrigin::Signed(user.clone()).into(),
            time_type.clone(),
            new_time_value,
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::TimeValueUpdated(time_type, new_time_value).into());
    }

    update_fee_value {
        let user = alice::<T>();

        let fee_type = FeeType::ProjectValidatorAccountFee;
        let new_fee_value = BalanceOf::<T>::from(1u32);

        let mut authorities = AuthorityAccounts::<T>::get();
        authorities.insert(user.clone());
        AuthorityAccounts::<T>::set(authorities);
    } : {
        Veles::<T>::update_fee_value(
            RawOrigin::Signed(user.clone()).into(),
            fee_type.clone(),
            new_fee_value,
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::FeeValueUpdated(fee_type, new_fee_value).into());
    }

    register_for_trader_account {
        let mut pallet_fees = PalletFeeValues::<T>::get();
        pallet_fees = FeeValues {
            trader_account_fee: BalanceOf::<T>::from(0u32),
            ..pallet_fees
        };
        PalletFeeValues::<T>::set(pallet_fees);

        let user = alice::<T>();
    } : {
        Veles::<T>::register_for_trader_account(
            RawOrigin::Signed(user.clone()).into(),
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::TraderAccountRegistered(user).into());
    }

    register_for_project_validator_account {
        let mut pallet_fees = PalletFeeValues::<T>::get();
        pallet_fees = FeeValues {
            project_validator_account_fee: BalanceOf::<T>::from(0u32),
            ..pallet_fees
        };
        PalletFeeValues::<T>::set(pallet_fees);

        let user = alice::<T>();
        let documentation_ipfs = BoundedString::<T::IPFSLength>::truncate_from("documentation_ipfs");
    } : {
        Veles::<T>::register_for_project_validator_account(
            RawOrigin::Signed(user.clone()).into(),
            documentation_ipfs.clone(),
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::ProjectValidatorAccountRegistered(
                user,
                documentation_ipfs,
            ).into());
    }

    register_for_project_owner_account {
        let mut pallet_fees = PalletFeeValues::<T>::get();
        pallet_fees = FeeValues {
            project_owner_account_fee: BalanceOf::<T>::from(0u32),
            ..pallet_fees
        };
        PalletFeeValues::<T>::set(pallet_fees);

        let user = alice::<T>();
        let documentation_ipfs = BoundedString::<T::IPFSLength>::truncate_from("documentation_ipfs");
    } : {
        Veles::<T>::register_for_project_owner_account(
            RawOrigin::Signed(user.clone()).into(),
            documentation_ipfs.clone(),
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::ProjectOwnerAccountRegistered(
                user,
                documentation_ipfs,
            ).into());
    }

    submit_carbon_footprint_report {
        let mut pallet_fees = PalletFeeValues::<T>::get();
        pallet_fees = FeeValues {
            carbon_footprint_report_fee: BalanceOf::<T>::from(0u32),
            ..pallet_fees
        };
        PalletFeeValues::<T>::set(pallet_fees);

        let user = alice::<T>();
        let documentation_ipfs = BoundedString::<T::IPFSLength>::truncate_from("documentation_ipfs");
        let carbon_footprint_surplus = BalanceOf::<T>::from(100u32);
        let carbon_footprint_deficit = BalanceOf::<T>::from(0u32);
    } : {
        Veles::<T>::submit_carbon_footprint_report(
            RawOrigin::Signed(user.clone()).into(),
            documentation_ipfs.clone(),
            carbon_footprint_surplus,
            carbon_footprint_deficit,
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::CarbonFootprintReportSubmitted(user.clone(), documentation_ipfs).into());
    }

    cast_vote {
        let mut pallet_fees = PalletFeeValues::<T>::get();
        pallet_fees = FeeValues {
            voting_fee: BalanceOf::<T>::from(0u32),
            ..pallet_fees
        };
        PalletFeeValues::<T>::set(pallet_fees);

        let validator_info = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<T::IPFSLength>::truncate_from("validator_ipfs"),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };
        Validators::<T>::insert(alice::<T>(), validator_info);

        let complaint_ipfs = BoundedString::<T::IPFSLength>::truncate_from("complaint_ipfs");
        let complaint_info = ComplaintAccountBasedInfo {
            complaint_proposer: bob::<T>(),
            complaint_type: ComplaintType::ValidatorComplaint,
            complaint_for: charlie::<T>(),
            creation_date: T::Time::now(),
            votes_for: BTreeSet::<AccountIdOf<T>>::new(),
            votes_against: BTreeSet::<AccountIdOf<T>>::new(),
            complaint_active: true,
        };
        ComplaintsForAccounts::<T>::insert(complaint_ipfs.clone(), complaint_info);

        let user = alice::<T>();
        let vote_type = VoteType::ComplaintVote;
        let ipfs = complaint_ipfs;
        let vote = true;
    } : {
        Veles::<T>::cast_vote(
            RawOrigin::Signed(user.clone()).into(),
            vote_type.clone(),
            ipfs.clone(),
            vote,
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::SuccessfulVote(user.clone(), ipfs.clone(), vote_type, vote).into());
    }

    propose_project {
        let mut pallet_fees = PalletFeeValues::<T>::get();
        pallet_fees = FeeValues {
            project_proposal_fee: BalanceOf::<T>::from(0u32),
            ..pallet_fees
        };
        PalletFeeValues::<T>::set(pallet_fees);

        let owner_ipfs = BoundedString::<T::IPFSLength>::truncate_from("owner_ipfs");
        let owner_info = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_ipfs,
            penalty_level: 0,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };

        ProjectOwners::<T>::insert(alice::<T>(), owner_info);

        let user = alice::<T>();
        let proposal_ipfs = BoundedString::<T::IPFSLength>::truncate_from("proposal_ipfs");
    } : {
        Veles::<T>::propose_project(
            RawOrigin::Signed(user.clone()).into(),
            proposal_ipfs.clone()
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::ProjectProposalCreated(user.clone(), proposal_ipfs).into());
    }

    propose_carbon_credit_batch {
        let mut pallet_fees = PalletFeeValues::<T>::get();
        pallet_fees = FeeValues {
            carbon_credit_batch_fee: BalanceOf::<T>::from(0u32),
            ..pallet_fees
        };
        PalletFeeValues::<T>::set(pallet_fees);

        let owner_ipfs = BoundedString::<T::IPFSLength>::truncate_from("owner_ipfs");
        let owner_info = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_ipfs,
            penalty_level: 0,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };

        ProjectOwners::<T>::insert(alice::<T>(), owner_info);

        let project_hash = generate_hash::<T>(alice::<T>());

        let project_ipfs = BoundedString::<T::IPFSLength>::truncate_from("project_ipfs");
        let project_info = ProjectInfo {
            documentation_ipfs: project_ipfs,
            project_owner: alice::<T>(),
            creation_date: T::Time::now(),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };

        Projects::<T>::insert(project_hash, project_info);

        let user = alice::<T>();
        let credit_amount = BalanceOf::<T>::from(100u32);
        let penalty_repay_price = BalanceOf::<T>::from(10u32);
        let proposal_ipfs = BoundedString::<T::IPFSLength>::truncate_from("proposal_ipfs");
    } : {
        Veles::<T>::propose_carbon_credit_batch(
            RawOrigin::Signed(user.clone()).into(),
            project_hash,
            credit_amount,
            penalty_repay_price,
            proposal_ipfs.clone(),
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::CarbonCreditBatchProposalCreated(user.clone(), proposal_ipfs).into());
    }

    create_sale_order {
        let mut traders = BTreeSet::<AccountIdOf<T>>::new();
        traders.insert(alice::<T>());

        TraderAccounts::<T>::set(traders);

        let batch_ipfs = BoundedString::<T::IPFSLength>::truncate_from("batch_ipfs");

        let project_hash = generate_hash::<T>(alice::<T>());

        let batch_info = CarbonCreditBatchInfo {
            documentation_ipfs: batch_ipfs,
            project_hash,
            creation_date: T::Time::now(),
            credit_amount: BalanceOf::<T>::from(100u32),
            penalty_repay_price: BalanceOf::<T>::from(1u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<T>>::new(),
        };

        let batch_hash = generate_hash::<T>(bob::<T>());

        CarbonCreditBatches::<T>::insert(batch_hash, batch_info);

        let credit_holdings = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<T>::from(40u32),
            unavailable_amount: BalanceOf::<T>::from(0u32),
        };

        CarbonCreditHoldings::<T>::insert(batch_hash, alice::<T>(), credit_holdings.clone());

        let user = alice::<T>();
        let credit_price = BalanceOf::<T>::from(10u32);
        let credit_amount = BalanceOf::<T>::from(5u32);
    } : {
        Veles::<T>::create_sale_order(
            RawOrigin::Signed(user.clone()).into(),
            batch_hash,
            credit_price,
            credit_amount,
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::CarbonCreditSaleOrderCreated(
                user,
                batch_hash,
                credit_amount,
                credit_price,
            ).into());
    }

    complete_sale_order {
        let mut traders = BTreeSet::<AccountIdOf<T>>::new();
        traders.insert(charlie::<T>());

        TraderAccounts::<T>::set(traders);

        let validator_1 = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<T::IPFSLength>::truncate_from("validator_1"),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };

        let validator_2 = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<T::IPFSLength>::truncate_from("validator_2"),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };

        Validators::<T>::insert(dave::<T>(), validator_1);
        Validators::<T>::insert(fred::<T>(), validator_2);

        let owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<T::IPFSLength>::truncate_from("owner"),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };

        ProjectOwners::<T>::insert(alice::<T>(), owner);

        let project = ProjectInfo {
            documentation_ipfs: BoundedString::<T::IPFSLength>::truncate_from("project"),
            project_owner: alice::<T>(),
            creation_date: T::Time::now(),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };

        let project_hash = generate_hash::<T>(alice::<T>());

        Projects::<T>::insert(project_hash, project);

        let mut validator_benefactors = BTreeSet::<AccountIdOf<T>>::new();
        validator_benefactors.insert(dave::<T>());
        validator_benefactors.insert(fred::<T>());

        let credit_batch = CarbonCreditBatchInfo {
            documentation_ipfs: BoundedString::<T::IPFSLength>::truncate_from("batch"),
            project_hash,
            creation_date: T::Time::now(),
            credit_amount: BalanceOf::<T>::from(100u32),
            penalty_repay_price: BalanceOf::<T>::from(10u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors,
        };

        let batch_hash = generate_hash::<T>(bob::<T>());

        CarbonCreditBatches::<T>::insert(batch_hash, credit_batch);

        let credit_holdings = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<T>::from(50u32),
            unavailable_amount: BalanceOf::<T>::from(20u32),
        };

        CarbonCreditHoldings::<T>::insert(batch_hash, bob::<T>(), credit_holdings);

        let timeout_block = BlockNumber::<T>::from(100u32);

        let sale_order = CarbonCreditSaleOrderInfo {
            batch_hash,
            credit_amount: BalanceOf::<T>::from(10u32),
            credit_price: BalanceOf::<T>::from(5u32),
            seller: bob::<T>(),
            buyer: bob::<T>(),
            sale_active: true,
            sale_timeout: timeout_block,
        };

        let sale_hash = generate_hash::<T>(bob::<T>());

        CarbonCreditSaleOrders::<T>::insert(sale_hash, sale_order);

        let mut sale_timeouts = BTreeSet::<H256>::new();
        sale_timeouts.insert(sale_hash);

        SaleOrderTimeouts::<T>::insert(timeout_block, sale_timeouts);

        let _ = T::Currency::deposit_creating(&charlie::<T>(), BalanceOf::<T>::from(1000u32));

        let user = charlie::<T>();
    } : {
        Veles::<T>::complete_sale_order(
            RawOrigin::Signed(user.clone()).into(),
            sale_hash,
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::CarbonCreditSaleOrderCompleted(user, sale_hash).into());
    }

    close_sale_order {
        let mut traders = BTreeSet::<AccountIdOf<T>>::new();
        traders.insert(bob::<T>());

        TraderAccounts::<T>::set(traders);

        let batch = CarbonCreditBatchInfo {
            documentation_ipfs: BoundedString::<T::IPFSLength>::truncate_from(
                "batch_documentation_ipfs",
            ),
            project_hash: generate_hash::<T>(charlie::<T>()),
            creation_date: T::Time::now(),
            credit_amount: BalanceOf::<T>::from(100u32),
            penalty_repay_price: BalanceOf::<T>::from(10u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<T>>::new(),
        };

        let batch_hash = generate_hash::<T>(alice::<T>());

        CarbonCreditBatches::<T>::insert(batch_hash, batch);

        let credit_holdings = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<T>::from(50u32),
            unavailable_amount: BalanceOf::<T>::from(20u32),
        };

        CarbonCreditHoldings::<T>::insert(batch_hash, bob::<T>(), credit_holdings);

        let timeout_block = BlockNumber::<T>::from(100u32);

        let sale_order = CarbonCreditSaleOrderInfo {
            batch_hash,
            credit_amount: BalanceOf::<T>::from(10u32),
            credit_price: BalanceOf::<T>::from(5u32),
            seller: bob::<T>(),
            buyer: bob::<T>(),
            sale_active: true,
            sale_timeout: timeout_block,
        };

        let sale_hash = generate_hash::<T>(bob::<T>());

        CarbonCreditSaleOrders::<T>::insert(sale_hash, sale_order);

        let mut sale_timeouts = BTreeSet::<H256>::new();
        sale_timeouts.insert(sale_hash);

        SaleOrderTimeouts::<T>::insert(timeout_block, sale_timeouts);

        let user = bob::<T>();
    } : {
        Veles::<T>::close_sale_order(
            RawOrigin::Signed(user.clone()).into(),
            sale_hash,
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::CarbonCreditSaleOrderClosed(user, sale_hash).into());
    }

    open_account_complaint {
        let mut pallet_fees = PalletFeeValues::<T>::get();
        pallet_fees = FeeValues {
            complaint_fee: BalanceOf::<T>::from(0u32),
            ..pallet_fees
        };
        PalletFeeValues::<T>::set(pallet_fees);

        let validator_documentation =
            BoundedString::<T::IPFSLength>::truncate_from("validator_documentation");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };

        Validators::<T>::insert(charlie::<T>(), validator);

        let owner_documentation = BoundedString::<T::IPFSLength>::truncate_from("owner_documentation");

        let owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };

        ProjectOwners::<T>::insert(bob::<T>(), owner);

        let project_documentation =
            BoundedString::<T::IPFSLength>::truncate_from("project_documentation");

        let project = ProjectInfo {
            documentation_ipfs: project_documentation,
            project_owner: bob::<T>(),
            creation_date: T::Time::now(),
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };

        let project_hash = generate_hash::<T>(alice::<T>());

        Projects::<T>::insert(project_hash, project);

        let batch_documentation = BoundedString::<T::IPFSLength>::truncate_from("batch_documentation");

        let batch = CarbonCreditBatchInfo {
            documentation_ipfs: batch_documentation,
            project_hash,
            creation_date: T::Time::now(),
            credit_amount: BalanceOf::<T>::from(100u32),
            penalty_repay_price: BalanceOf::<T>::from(5u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<T>>::new(),
        };

        let batch_hash = generate_hash::<T>(bob::<T>());

        CarbonCreditBatches::<T>::insert(batch_hash, batch);

        let complaint_documentation =
            BoundedString::<T::IPFSLength>::truncate_from("complaint_documentation");
        let complaint_for = bob::<T>();
        let complaint_type = ComplaintType::ProjectOwnerComplaint;

        let user = charlie::<T>();
    } : {
        Veles::<T>::open_account_complaint(
            RawOrigin::Signed(user.clone()).into(),
            complaint_documentation.clone(),
            complaint_for.clone(),
            complaint_type.clone(),
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::AccountComplaintOpened(
                user,
                complaint_for,
                complaint_type,
                complaint_documentation,
            ).into());
    }

    open_hash_complaint {
        let mut pallet_fees = PalletFeeValues::<T>::get();
        pallet_fees = FeeValues {
            complaint_fee: BalanceOf::<T>::from(0u32),
            ..pallet_fees
        };
        PalletFeeValues::<T>::set(pallet_fees);

        let validator_documentation =
            BoundedString::<T::IPFSLength>::truncate_from("validator_documentation");

        let validator = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: validator_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };

        Validators::<T>::insert(charlie::<T>(), validator);

        let owner_documentation = BoundedString::<T::IPFSLength>::truncate_from("owner_documentation");

        let owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation,
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };

        ProjectOwners::<T>::insert(bob::<T>(), owner);

        let project_documentation =
            BoundedString::<T::IPFSLength>::truncate_from("project_documentation");

        let project = ProjectInfo {
            documentation_ipfs: project_documentation,
            project_owner: bob::<T>(),
            creation_date: T::Time::now(),
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };

        let project_hash = generate_hash::<T>(alice::<T>());

        Projects::<T>::insert(project_hash, project);

        let batch_documentation = BoundedString::<T::IPFSLength>::truncate_from("batch_documentation");

        let batch = CarbonCreditBatchInfo {
            documentation_ipfs: batch_documentation,
            project_hash,
            creation_date: T::Time::now(),
            credit_amount: BalanceOf::<T>::from(100u32),
            penalty_repay_price: BalanceOf::<T>::from(5u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<T>>::new(),
        };

        let batch_hash = generate_hash::<T>(bob::<T>());

        CarbonCreditBatches::<T>::insert(batch_hash, batch);

        let complaint_documentation =
            BoundedString::<T::IPFSLength>::truncate_from("complaint_documentation");
        let complaint_for = project_hash;
        let complaint_type = ComplaintType::ProjectComplaint;

        let user = charlie::<T>();
    } : {
        Veles::<T>::open_hash_complaint(
            RawOrigin::Signed(user.clone()).into(),
            complaint_documentation.clone(),
            complaint_for.clone(),
            complaint_type.clone(),
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::HashComplaintOpened(
            user,
            complaint_for,
            complaint_type,
            complaint_documentation,
        ).into());
    }

    retire_carbon_credits {
        let mut documentation_ipfses = BTreeSet::<BoundedString<T::IPFSLength>>::new();
        let footprint_account_ipfs =
            BoundedString::<T::IPFSLength>::truncate_from("footprint_account_ipfs");

        documentation_ipfses.insert(footprint_account_ipfs);

        let carbon_footprint_account = CarbonFootprintAccountInfo {
            documentation_ipfses: documentation_ipfses.clone(),
            carbon_footprint_surplus: BalanceOf::<T>::from(0u32),
            carbon_footprint_deficit: BalanceOf::<T>::from(1000u32),
            creation_date: T::Time::now(),
        };

        CarbonFootprintAccounts::<T>::insert(alice::<T>(), carbon_footprint_account);

        let batch_ipfs = BoundedString::<T::IPFSLength>::truncate_from("batch_ipfs");
        let project_hash = generate_hash::<T>(bob::<T>());

        let batch = CarbonCreditBatchInfo {
            documentation_ipfs: batch_ipfs,
            project_hash,
            creation_date: T::Time::now(),
            credit_amount: BalanceOf::<T>::from(200u32),
            penalty_repay_price: BalanceOf::<T>::from(20u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<T>>::new(),
        };

        let batch_hash = generate_hash::<T>(alice::<T>());

        CarbonCreditBatches::<T>::insert(batch_hash, batch);

        let holdings = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<T>::from(110u32),
            unavailable_amount: BalanceOf::<T>::from(20u32),
        };

        CarbonCreditHoldings::<T>::insert(batch_hash, alice::<T>(), holdings);

        let user = alice::<T>();
        let amount_to_retire = BalanceOf::<T>::from(50u32);
    } : {
        Veles::<T>::retire_carbon_credits(
            RawOrigin::Signed(user.clone()).into(),
            batch_hash,
            amount_to_retire,
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::CarbonCreditsHaveBeenRetired(
            user,
            batch_hash,
            amount_to_retire,
        ).into());
    }

    repay_project_owner_debts {
        let owner_documentation_ipfs =
            BoundedString::<T::IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };

        ProjectOwners::<T>::insert(charlie::<T>(), project_owner);

        let mut debts = BTreeMap::<AccountIdOf<T>, BalanceOf<T>>::new();

        debts.insert(alice::<T>(), BalanceOf::<T>::from(20u32));
        debts.insert(bob::<T>(), BalanceOf::<T>::from(30u32));

        ProjectOwnerDebts::<T>::insert(charlie::<T>(), debts);

        let _ = T::Currency::deposit_creating(&charlie::<T>(), BalanceOf::<T>::from(1000u32));

        let user = charlie::<T>();
    } : {
        Veles::<T>::repay_project_owner_debts(
            RawOrigin::Signed(user.clone()).into(),
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::ProjectOwnerDebtsHaveBeenRepaid(user).into());
    }

    update_pallet_base_time {
        let new_pallet_base_time = BlockNumber::<T>::from(100u32);
    } : {
        Veles::<T>::update_pallet_base_time(
            RawOrigin::Signed(alice::<T>()).into(),
            new_pallet_base_time
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::BasePalletTimeUpdated(new_pallet_base_time).into());
    }

    update_carbon_footprint_report {
        let mut documentation_ipfses = BTreeSet::<BoundedString<T::IPFSLength>>::new();
        let report_1_ipfs = BoundedString::<T::IPFSLength>::truncate_from("report_1_ipfs");
        documentation_ipfses.insert(report_1_ipfs.clone());

        let cf_account = CarbonFootprintAccountInfo {
            documentation_ipfses: documentation_ipfses,
            carbon_footprint_surplus: BalanceOf::<T>::from(50u32),
            carbon_footprint_deficit: BalanceOf::<T>::from(0u32),
            creation_date: T::Time::now(),
        };

        CarbonFootprintAccounts::<T>::insert(alice::<T>(), cf_account);

        let mut votes_for = BTreeSet::<AccountIdOf<T>>::new();
        votes_for.insert(bob::<T>());

        let report_info = CarbonFootprintReportInfo {
            cf_account: alice::<T>(),
            creation_date: T::Time::now(),
            carbon_footprint_surplus: BalanceOf::<T>::from(0u32),
            carbon_footprint_deficit: BalanceOf::<T>::from(100u32),
            votes_for: BTreeSet::<AccountIdOf<T>>::new(),
            votes_against: BTreeSet::<AccountIdOf<T>>::new(),
            voting_active: true,
        };

        let report_2_ipfs = BoundedString::<T::IPFSLength>::truncate_from("report_2_ipfs");

        CarbonFootprintReports::<T>::insert(report_2_ipfs.clone(), report_info);
    } : {
        Veles::<T>::update_carbon_footprint_report(
            RawOrigin::Signed(alice::<T>()).into(),
            report_2_ipfs.clone()
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::CarbonFootprintReportUpdated(report_2_ipfs).into());
    }

    update_project_proposal {
        let mut votes_for = BTreeSet::<AccountIdOf<T>>::new();
        votes_for.insert(bob::<T>());

        let project_hash = generate_hash::<T>(alice::<T>());

        let proposal = ProjectProposalInfo {
            project_owner: alice::<T>(),
            creation_date: T::Time::now(),
            project_hash: project_hash,
            votes_for: votes_for,
            votes_against: BTreeSet::<AccountIdOf<T>>::new(),
            voting_active: true,
        };

        let proposal_ipfs = BoundedString::<T::IPFSLength>::truncate_from("proposal_ipfs");

        ProjectProposals::<T>::insert(proposal_ipfs.clone(), proposal);
    } : {
        Veles::<T>::update_project_proposal(
            RawOrigin::Signed(alice::<T>()).into(),
            proposal_ipfs.clone()
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::ProjectProposalUpdated(proposal_ipfs).into());
    }

    update_carbon_credit_batch_proposal {
        let project_owner_info = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<T::IPFSLength>::truncate_from("documentation_ipfs"),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };

        ProjectOwners::<T>::insert(alice::<T>(), project_owner_info);

        let project_hash = generate_hash::<T>(bob::<T>());

        let project_documentation_ipfs =
            BoundedString::<T::IPFSLength>::truncate_from("project_documentation_ipfs");

        let project = ProjectInfo {
            documentation_ipfs: project_documentation_ipfs,
            project_owner: alice::<T>(),
            creation_date: T::Time::now(),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };

        Projects::<T>::insert(project_hash, project);

        let proposal_ipfs = BoundedString::<T::IPFSLength>::truncate_from("proposal_ipfs");

        let batch_hash = generate_hash::<T>(charlie::<T>());

        let mut votes_for = BTreeSet::<AccountIdOf<T>>::new();
        votes_for.insert(bob::<T>());

        let proposal = CarbonCreditBatchProposalInfo {
            project_hash,
            batch_hash,
            creation_date: T::Time::now(),
            credit_amount: 100u32.into(),
            penalty_repay_price: 5u32.into(),
            votes_for: votes_for,
            votes_against: BTreeSet::<AccountIdOf<T>>::new(),
            voting_active: true,
        };

        CarbonCreditBatchProposals::<T>::insert(proposal_ipfs.clone(), proposal);
    } : {
        Veles::<T>::update_carbon_credit_batch_proposal(
            RawOrigin::Signed(alice::<T>()).into(),
            proposal_ipfs.clone()
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::CarbonCreditBatchProposalUpdated(proposal_ipfs).into());
    }

    update_carbon_credit_sale_order {
        let mut new_traders = TraderAccounts::<T>::get();
        new_traders.insert(alice::<T>());
        TraderAccounts::<T>::set(new_traders);

        let batch_hash = generate_hash::<T>(alice::<T>());

        let credit_holdings = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<T>::from(20u32),
            unavailable_amount: BalanceOf::<T>::from(15u32),
        };

        CarbonCreditHoldings::<T>::insert(batch_hash, alice::<T>(), credit_holdings);

        let sale_order = CarbonCreditSaleOrderInfo {
            batch_hash: batch_hash,
            credit_amount: BalanceOf::<T>::from(10u32),
            credit_price: BalanceOf::<T>::from(5u32),
            seller: alice::<T>(),
            buyer: alice::<T>(),
            sale_active: true,
            sale_timeout: BlockNumber::<T>::from(10u32),
        };

        let sale_hash = generate_hash::<T>(bob::<T>());

        CarbonCreditSaleOrders::<T>::insert(sale_hash, sale_order);
    } : {
        Veles::<T>::update_carbon_credit_sale_order(
            RawOrigin::Signed(alice::<T>()).into(),
            sale_hash
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::CarbonCreditSaleOrderUpdated(sale_hash).into());
    }

    update_complaint_for_account {
        let project_owner_info = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<T::IPFSLength>::truncate_from("documentation_ipfs"),
            penalty_level: 1,
            penalty_timeout: BlockNumber::<T>::from(120u32),
        };

        ProjectOwners::<T>::insert(alice::<T>(), project_owner_info);

        let complaint_ipfs = BoundedString::<T::IPFSLength>::truncate_from("complaint_ipfs");

        let mut votes_for = BTreeSet::<AccountIdOf<T>>::new();
        votes_for.insert(charlie::<T>());

        let complaint = ComplaintAccountBasedInfo {
            complaint_proposer: bob::<T>(),
            complaint_type: ComplaintType::ProjectOwnerComplaint,
            complaint_for: alice::<T>(),
            creation_date: T::Time::now(),
            votes_for: votes_for,
            votes_against: BTreeSet::<AccountIdOf<T>>::new(),
            complaint_active: true,
        };

        ComplaintsForAccounts::<T>::insert(complaint_ipfs.clone(), complaint);

        let mut penalty_accounts = BTreeSet::<AccountIdOf<T>>::new();
        penalty_accounts.insert(alice::<T>());

        PenaltyTimeoutsAccounts::<T>::insert(BlockNumber::<T>::from(120u32), penalty_accounts);
    } : {
        Veles::<T>::update_complaint_for_account(
            RawOrigin::Signed(alice::<T>()).into(),
            complaint_ipfs.clone()
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::AccountComplaintUpdated(complaint_ipfs.clone()).into());
    }

    update_complaint_for_hash {
        let project_hash = generate_hash::<T>(alice::<T>());
        let batch_hash = generate_hash::<T>(bob::<T>());

        let owner_documentation_ipfs =
            BoundedString::<T::IPFSLength>::truncate_from("owner_documentation_ipfs");

        let project_owner = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: owner_documentation_ipfs.clone(),
            penalty_level: 0,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };

        ProjectOwners::<T>::insert(alice::<T>(), project_owner);

        let project_documentation =
            BoundedString::<T::IPFSLength>::truncate_from("project_documentation");

        let project = ProjectInfo {
            documentation_ipfs: project_documentation,
            project_owner: alice::<T>(),
            creation_date: T::Time::now(),
            penalty_level: 0u8,
            penalty_timeout: BlockNumber::<T>::from(0u32),
        };

        Projects::<T>::insert(project_hash, project);

        let batch_documentation_ipfs =
            BoundedString::<T::IPFSLength>::truncate_from("batch_documentation_ipfs");

        let batch = CarbonCreditBatchInfo {
            documentation_ipfs: batch_documentation_ipfs,
            project_hash,
            creation_date: T::Time::now(),
            credit_amount: BalanceOf::<T>::from(10000u32),
            penalty_repay_price: BalanceOf::<T>::from(2u32),
            status: CarbonCreditBatchStatus::Active,
            validator_benefactors: BTreeSet::<AccountIdOf<T>>::new(),
        };

        CarbonCreditBatches::<T>::insert(batch_hash, batch);

        let credit_holdings = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<T>::from(120u32),
            unavailable_amount: BalanceOf::<T>::from(10u32),
        };

        CarbonCreditHoldings::<T>::insert(batch_hash, alice::<T>(), credit_holdings);

        let mut documentation_ipfses_1 = BTreeSet::<BoundedString<T::IPFSLength>>::new();
        let documentation_ipfs_1 = BoundedString::<T::IPFSLength>::truncate_from("documentation_ipfs_1");

        documentation_ipfses_1.insert(documentation_ipfs_1);

        let carbon_footprint_account_1 = CarbonFootprintAccountInfo {
            documentation_ipfses: documentation_ipfses_1,
            carbon_footprint_surplus: BalanceOf::<T>::from(50u32),
            carbon_footprint_deficit: BalanceOf::<T>::from(0u32),
            creation_date: T::Time::now(),
        };

        CarbonFootprintAccounts::<T>::insert(bob::<T>(), carbon_footprint_account_1);

        let mut documentation_ipfses_2 = BTreeSet::<BoundedString<T::IPFSLength>>::new();
        let documentation_ipfs_2 = BoundedString::<T::IPFSLength>::truncate_from("documentation_ipfs_2");

        documentation_ipfses_2.insert(documentation_ipfs_2);

        let carbon_footprint_account_2 = CarbonFootprintAccountInfo {
            documentation_ipfses: documentation_ipfses_2,
            carbon_footprint_surplus: BalanceOf::<T>::from(0u32),
            carbon_footprint_deficit: BalanceOf::<T>::from(1000u32),
            creation_date: T::Time::now(),
        };

        CarbonFootprintAccounts::<T>::insert(charlie::<T>(), carbon_footprint_account_2);

        let retirement_hash_1 = generate_hash::<T>(dave::<T>());

        let retirement_1 = CarbonCreditRetirementInfo {
            carbon_footprint_account: bob::<T>(),
            batch_hash: batch_hash,
            credit_amount: BalanceOf::<T>::from(100u32),
            retirement_date: T::Time::now(),
        };

        CarbonCreditRetirements::<T>::insert(retirement_hash_1, retirement_1);

        let retirement_hash_2 = generate_hash::<T>(fred::<T>());

        let retirement_2 = CarbonCreditRetirementInfo {
            carbon_footprint_account: charlie::<T>(),
            batch_hash: batch_hash,
            credit_amount: BalanceOf::<T>::from(123u32),
            retirement_date: T::Time::now(),
        };

        CarbonCreditRetirements::<T>::insert(retirement_hash_2, retirement_2);

        let credit_holdings_1 = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<T>::from(100u32),
            unavailable_amount: BalanceOf::<T>::from(0u32),
        };

        CarbonCreditHoldings::<T>::insert(batch_hash, dave::<T>(), credit_holdings_1);

        let credit_holdings_2 = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<T>::from(0u32),
            unavailable_amount: BalanceOf::<T>::from(250u32),
        };

        CarbonCreditHoldings::<T>::insert(batch_hash, fred::<T>(), credit_holdings_2);

        let credit_holdings_3 = CarbonCreditHoldingsInfo {
            available_amount: BalanceOf::<T>::from(300u32),
            unavailable_amount: BalanceOf::<T>::from(50u32),
        };

        CarbonCreditHoldings::<T>::insert(batch_hash, george::<T>(), credit_holdings_3);

        let complaint_ipfs = BoundedString::<T::IPFSLength>::truncate_from("complaint_ipfs");

        let mut votes_for = BTreeSet::<AccountIdOf<T>>::new();
        votes_for.insert(hank::<T>());

        let complaint = ComplaintHashBasedInfo {
            complaint_proposer: ian::<T>(),
            complaint_type: ComplaintType::CarbonCreditBatchComplaint,
            complaint_for: batch_hash,
            creation_date: T::Time::now(),
            votes_for: votes_for,
            votes_against: BTreeSet::<AccountIdOf<T>>::new(),
            complaint_active: true,
        };

        ComplaintsForHashes::<T>::insert(complaint_ipfs.clone(), complaint);
    } : {
        Veles::<T>::update_complaint_for_hash(
            RawOrigin::Signed(alice::<T>()).into(),
            complaint_ipfs.clone()
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::HashComplaintUpdated(complaint_ipfs).into());
    }

    update_project_owner_penalty_level {
        let project_owner_info = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<T::IPFSLength>::truncate_from("documentation_ipfs"),
            penalty_level: 1,
            penalty_timeout: BlockNumber::<T>::from(120u32),
        };

        ProjectOwners::<T>::insert(alice::<T>(), project_owner_info);
    } : {
        Veles::<T>::update_project_owner_penalty_level(
            RawOrigin::Signed(alice::<T>()).into(),
            alice::<T>()
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::ProjectOwnerPenaltyLevelUpdated(alice::<T>()).into());
    }

    update_validator_penalty_level {
        let validator_info = ProjectValidatorOrProjectOwnerInfo {
            documentation_ipfs: BoundedString::<T::IPFSLength>::truncate_from("documentation_ipfs"),
            penalty_level: 1,
            penalty_timeout: BlockNumber::<T>::from(120u32),
        };

        Validators::<T>::insert(alice::<T>(), validator_info);
    } : {
        Veles::<T>::update_validator_penalty_level(
            RawOrigin::Signed(alice::<T>()).into(),
            alice::<T>()
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::ValidatorPenaltyLevelUpdated(alice::<T>()).into());
    }

    update_project_penalty_level {
        let project_hash = generate_hash::<T>(alice::<T>());

        let project_info = ProjectInfo {
            documentation_ipfs: BoundedString::<T::IPFSLength>::truncate_from("project_ipfs"),
            project_owner: alice::<T>(),
            creation_date: T::Time::now(),
            penalty_level: 1,
            penalty_timeout: BlockNumber::<T>::from(120u32),
        };

        Projects::<T>::insert(project_hash, project_info);
    } : {
        Veles::<T>::update_project_penalty_level(
            RawOrigin::Signed(alice::<T>()).into(),
            project_hash
        ).unwrap();
    } verify {
        assert_last_event::<T>(Event::<T>::ProjectPenaltyLevelUpdated(project_hash).into());
    }

    impl_benchmark_test_suite!(
        Pallet,
        crate::mock::ExtBuilder::default().build(),
        crate::mock::Runtime,
    );
}
