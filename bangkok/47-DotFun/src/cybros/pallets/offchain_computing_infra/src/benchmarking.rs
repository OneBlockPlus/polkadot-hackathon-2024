// This file is part of Cybros.

// Copyright (C) Jun Jiang.
// SPDX-License-Identifier: AGPL-3.0-only

// Cybros is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Cybros is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with Cybros.  If not, see <http://www.gnu.org/licenses/>.

//! Benchmarking setup for pallet-offchain_computing_infra

// Only enable this module for benchmarking.
#![cfg(feature = "runtime-benchmarks")]

use frame_benchmarking::{account, impl_benchmark_test_suite, v2::*, whitelisted_caller};
use frame_support::{
	assert_ok, fail,
	traits::{fungible::Mutate, tokens::Fortitude},
};
use frame_system::{pallet_prelude::BlockNumberFor, Account, RawOrigin};
use sp_runtime::{
	app_crypto::{sr25519, KeyTypeId, RuntimePublic},
	SaturatedConversion, Saturating,
};

use primitives::{AttestationMethod, OnlinePayload};

use super::*;
use crate::Pallet as OffchainComputingInfra;

const DOLLARS: u128 = 1_000_000_000_000;
const WORKER_KEY_TYPE: KeyTypeId = KeyTypeId(*b"work");

fn add_mock_impl<T: Config>(owner: &T::AccountId) -> T::ImplId {
	let reserved_deposit = T::RegisterImplDeposit::get();
	let owner_balance = reserved_deposit
		.saturating_add((11 * DOLLARS).saturated_into::<BalanceOf<T>>())
		.saturating_add(T::Currency::minimum_balance());
	T::Currency::set_balance(&owner, owner_balance);

	assert_ok!(OffchainComputingInfra::<T>::register_impl(
		RawOrigin::Signed(owner.clone()).into(),
		AttestationMethod::OptOut,
	));

	let impl_info = Impls::<T>::iter_values().last().expect("Should have an impl");

	assert_ok!(OffchainComputingInfra::<T>::register_impl_build(
		RawOrigin::Signed(owner.clone()).into(),
		impl_info.id.clone(),
		1u32,
		None
	));

	impl_info.id
}

fn mock_online_payload_and_attestation<T: Config>(
	_worker_public: &sr25519::Public,
	impl_id: T::ImplId,
) -> (OnlinePayload<T::ImplId>, Attestation) {
	let payload = OnlinePayload::<T::ImplId> {
		impl_id: impl_id.clone(),
		impl_spec_version: 1,
		impl_build_version: 1,
		impl_build_magic_bytes: Default::default(),
	};

	let attestation = Attestation::OptOut;

	(payload, attestation)
}

fn add_mock_worker<T: Config>(
	worker_public: &sr25519::Public,
	owner: &T::AccountId,
	impl_id: T::ImplId,
) -> T::AccountId {
	let worker = T::AccountId::decode(&mut worker_public.encode().as_slice()).unwrap();
	let reserved_deposit = T::RegisterWorkerDeposit::get();

	let owner_balance =
		reserved_deposit.saturating_add((100 * DOLLARS).saturated_into::<BalanceOf<T>>());
	T::Currency::set_balance(&owner, owner_balance);

	let initial_deposit =
		reserved_deposit.saturating_add((11 * DOLLARS).saturated_into::<BalanceOf<T>>());

	assert_ok!(OffchainComputingInfra::<T>::register_worker(
		RawOrigin::Signed(owner.clone()).into(),
		T::Lookup::unlookup(worker.clone()),
		impl_id,
		initial_deposit
	));
	assert_eq!(Workers::<T>::contains_key(&worker), true);

	worker
}

fn add_mock_online_worker<T: Config>(
	worker_public: &sr25519::Public,
	owner: &T::AccountId,
	impl_id: Option<T::ImplId>,
) -> T::AccountId {
	let impl_id = impl_id.unwrap_or_else(|| add_mock_impl::<T>(owner));
	let worker = add_mock_worker::<T>(worker_public, owner, impl_id.clone());

	let (payload, attestation) = mock_online_payload_and_attestation::<T>(worker_public, impl_id);
	assert_ok!(OffchainComputingInfra::<T>::online(
		RawOrigin::Signed(worker.clone()).into(),
		payload,
		attestation
	));

	let worker_info = Workers::<T>::get(&worker).expect("WorkerInfo should has value");
	assert_eq!(worker_info.attestation_method, Some(AttestationMethod::OptOut));

	worker
}

#[benchmarks]
mod benchmarks {
	use super::*;

	#[benchmark]
	fn register_worker() -> Result<(), BenchmarkError> {
		let owner: T::AccountId = whitelisted_caller();
		let impl_id = add_mock_impl::<T>(&owner);
		let worker = account::<T::AccountId>("worker", 0, 0);

		let initial_balance = T::RegisterWorkerDeposit::get()
			.saturating_add((1 * DOLLARS).saturated_into::<BalanceOf<T>>());
		let balance =
			initial_balance.saturating_add((100 * DOLLARS).saturated_into::<BalanceOf<T>>());
		T::Currency::set_balance(&owner, balance);

		#[extrinsic_call]
		_(
			RawOrigin::Signed(owner.clone()),
			T::Lookup::unlookup(worker.clone()),
			impl_id,
			initial_balance,
		);

		let worker_info = Workers::<T>::get(&worker).expect("WorkerInfo should has value");
		assert_eq!(worker_info.owner, owner);
		assert_eq!(
			T::Currency::balance_on_hold(&HoldReason::WorkerRegistrationReserve.into(), &worker),
			T::RegisterWorkerDeposit::get()
		);
		assert_eq!(worker_info.status, WorkerStatus::Registered);

		Ok(())
	}

	#[benchmark]
	fn deregister_worker() -> Result<(), BenchmarkError> {
		let owner: T::AccountId = whitelisted_caller();
		let impl_id = add_mock_impl::<T>(&owner);
		let worker_public = sr25519::Public::generate_pair(WORKER_KEY_TYPE, None);
		let worker = add_mock_worker::<T>(&worker_public, &owner, impl_id);

		#[extrinsic_call]
		_(RawOrigin::Signed(owner.clone()), T::Lookup::unlookup(worker.clone()));

		assert_eq!(Workers::<T>::contains_key(&worker), false);
		assert_eq!(Account::<T>::contains_key(&worker), false);

		Ok(())
	}

	#[benchmark]
	fn transfer_to_worker() -> Result<(), BenchmarkError> {
		let owner: T::AccountId = whitelisted_caller();
		let impl_id = add_mock_impl::<T>(&owner);
		let worker_public = sr25519::Public::generate_pair(WORKER_KEY_TYPE, None);
		let worker = add_mock_worker::<T>(&worker_public, &owner, impl_id);

		let worker_balance =
			T::Currency::reducible_balance(&worker, Preservation::Preserve, Fortitude::Polite);
		let amount = (10 * DOLLARS).saturated_into::<BalanceOf<T>>();

		#[extrinsic_call]
		_(RawOrigin::Signed(owner.clone()), T::Lookup::unlookup(worker.clone()), amount);

		assert_eq!(
			T::Currency::reducible_balance(&worker, Preservation::Preserve, Fortitude::Polite),
			worker_balance.saturating_add(amount)
		);

		Ok(())
	}

	#[benchmark]
	fn withdraw_from_worker() -> Result<(), BenchmarkError> {
		let owner: T::AccountId = whitelisted_caller();
		let impl_id = add_mock_impl::<T>(&owner);
		let worker_public = sr25519::Public::generate_pair(WORKER_KEY_TYPE, None);
		let worker = add_mock_worker::<T>(&worker_public, &owner, impl_id);

		let worker_balance =
			T::Currency::reducible_balance(&worker, Preservation::Preserve, Fortitude::Polite);
		let amount = (10 * DOLLARS).saturated_into::<BalanceOf<T>>();

		#[extrinsic_call]
		_(RawOrigin::Signed(owner.clone()), T::Lookup::unlookup(worker.clone()), amount);

		assert_eq!(
			T::Currency::reducible_balance(&worker, Preservation::Preserve, Fortitude::Polite),
			worker_balance.saturating_sub(amount)
		);

		Ok(())
	}

	#[benchmark]
	fn online() -> Result<(), BenchmarkError> {
		let owner: T::AccountId = whitelisted_caller();
		let impl_id = add_mock_impl::<T>(&owner);
		let worker_public = sr25519::Public::generate_pair(WORKER_KEY_TYPE, None);
		let worker = add_mock_worker::<T>(&worker_public, &owner, impl_id.clone());
		let (payload, attestation) =
			mock_online_payload_and_attestation::<T>(&worker_public, impl_id);

		#[extrinsic_call]
		_(RawOrigin::Signed(worker.clone()), payload, attestation);

		let worker_info = Workers::<T>::get(&worker).expect("WorkerInfo should has value");
		assert_eq!(worker_info.attestation_method, Some(AttestationMethod::OptOut));
		assert_eq!(worker_info.status, WorkerStatus::Online);

		Ok(())
	}

	#[benchmark]
	fn refresh_attestation() -> Result<(), BenchmarkError> {
		let owner: T::AccountId = whitelisted_caller();
		let impl_id = add_mock_impl::<T>(&owner);
		let worker_public = sr25519::Public::generate_pair(WORKER_KEY_TYPE, None);
		let worker = add_mock_online_worker::<T>(&worker_public, &owner, Some(impl_id.clone()));
		let (payload, attestation) =
			mock_online_payload_and_attestation::<T>(&worker_public, impl_id);
		let now = T::UnixTime::now().as_secs().saturated_into::<u64>();

		// Hack here
		Workers::<T>::try_mutate(&worker, |worker_info| {
			let Some(worker_info) = worker_info else { return Err("must not null") };

			worker_info.attestation_expires_at = Some(now + 100);
			worker_info.attested_at = Some(now - 100);

			Ok(())
		})?;

		#[extrinsic_call]
		_(RawOrigin::Signed(worker.clone()), payload, attestation);

		let worker_info = Workers::<T>::get(&worker).expect("WorkerInfo should has value");
		assert_eq!(worker_info.attestation_method, Some(AttestationMethod::OptOut));
		assert!(worker_info.attested_at.expect("attest_at must have value") >= now);

		Ok(())
	}

	// This is the slow path,
	// worker shall offline immediately instead of becoming `RequestingOffline`
	#[benchmark]
	fn request_offline() -> Result<(), BenchmarkError> {
		let owner: T::AccountId = whitelisted_caller();
		let worker_public = sr25519::Public::generate_pair(WORKER_KEY_TYPE, None);
		let worker = add_mock_online_worker::<T>(&worker_public, &owner, None);

		#[extrinsic_call]
		_(RawOrigin::Signed(worker.clone()));

		let worker_info = Workers::<T>::get(&worker).expect("WorkerInfo should has value");
		assert_eq!(worker_info.status, WorkerStatus::Offline);

		Ok(())
	}

	// This is the slow path,
	// worker shall offline immediately instead of becoming `RequestingOffline`
	#[benchmark]
	fn request_offline_for() -> Result<(), BenchmarkError> {
		let owner: T::AccountId = whitelisted_caller();
		let worker_public = sr25519::Public::generate_pair(WORKER_KEY_TYPE, None);
		let worker = add_mock_online_worker::<T>(&worker_public, &owner, None);

		#[extrinsic_call]
		_(RawOrigin::Signed(owner.clone()), T::Lookup::unlookup(worker.clone()));

		let worker_info = Workers::<T>::get(&worker).expect("WorkerInfo should has value");
		assert_eq!(worker_info.status, WorkerStatus::Offline);

		Ok(())
	}

	#[benchmark]
	fn force_offline() -> Result<(), BenchmarkError> {
		let owner: T::AccountId = whitelisted_caller();
		let worker_public = sr25519::Public::generate_pair(WORKER_KEY_TYPE, None);
		let worker = add_mock_online_worker::<T>(&worker_public, &owner, None);

		#[extrinsic_call]
		_(RawOrigin::Signed(worker.clone()));

		let worker_info = Workers::<T>::get(&worker).expect("WorkerInfo should has value");
		assert_eq!(worker_info.status, WorkerStatus::Offline);

		Ok(())
	}

	#[benchmark]
	fn force_offline_for() -> Result<(), BenchmarkError> {
		let owner: T::AccountId = whitelisted_caller();
		let worker_public = sr25519::Public::generate_pair(WORKER_KEY_TYPE, None);
		let worker = add_mock_online_worker::<T>(&worker_public, &owner, None);

		#[extrinsic_call]
		_(RawOrigin::Signed(owner.clone()), T::Lookup::unlookup(worker.clone()));

		let worker_info = Workers::<T>::get(&worker).expect("WorkerInfo should has value");
		assert_eq!(worker_info.status, WorkerStatus::Offline);

		Ok(())
	}

	// This is the normal path
	#[benchmark]
	fn heartbeat() -> Result<(), BenchmarkError> {
		let owner: T::AccountId = whitelisted_caller();
		let worker_public = sr25519::Public::generate_pair(WORKER_KEY_TYPE, None);
		let worker = add_mock_online_worker::<T>(&worker_public, &owner, None);

		let stage = FlipOrFlop::<T>::get();
		// Simulate to the next stage
		match stage {
			FlipFlopStage::Flip => {
				assert_eq!(FlopSet::<T>::contains_key(&worker), true);
				FlopSet::<T>::insert(&worker, BlockNumberFor::<T>::zero());
				FlipOrFlop::<T>::set(FlipFlopStage::Flop);
			},
			FlipFlopStage::Flop => {
				assert_eq!(FlipSet::<T>::contains_key(&worker), true);
				FlipSet::<T>::insert(&worker, BlockNumberFor::<T>::zero());
				FlipOrFlop::<T>::set(FlipFlopStage::Flip);
			},
			_ => fail!("Other stages is unexpected"),
		};

		#[extrinsic_call]
		_(RawOrigin::Signed(worker.clone()));

		let stage = FlipOrFlop::<T>::get();
		match stage {
			FlipFlopStage::Flip => {
				assert_eq!(FlipSet::<T>::contains_key(&worker), false);
				assert_eq!(FlopSet::<T>::contains_key(&worker), true);
			},
			FlipFlopStage::Flop => {
				assert_eq!(FlipSet::<T>::contains_key(&worker), true);
				assert_eq!(FlopSet::<T>::contains_key(&worker), false);
			},
			_ => fail!("Other stages is unexpected"),
		};

		Ok(())
	}

	// TODO: benchmark other paths of heartbeat

	// This line generates test cases for benchmarking, and could be run by:
	//   `cargo test --features runtime-benchmarks`
	impl_benchmark_test_suite! {
		OffchainComputingInfra,
		crate::mock::new_test_ext(),
		crate::mock::Test
	}
}
