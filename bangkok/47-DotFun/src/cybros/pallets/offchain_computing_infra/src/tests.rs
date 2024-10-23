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

#[allow(unused)]
use crate::{mock::*, BalanceOf, Config, Error, Event as OffchainComputingInfraEvent, Workers};
#[allow(unused)]
use frame_support::{assert_err, assert_noop, assert_ok};
#[allow(unused)]
use frame_system::Account;
#[allow(unused)]
use primitives::*;

#[allow(unused)]
const ALICE: AccountId = 1;
#[allow(unused)]
const ALICE_WORKER: AccountId = 2;
#[allow(unused)]
const BOB: AccountId = 3;
#[allow(unused)]
const BOB_WORKER: AccountId = 4;

type ImplId = u32;
type WorkerInfo =
	primitives::WorkerInfo<<Test as frame_system::Config>::AccountId, BalanceOf<Test>, ImplId>;

fn last_event() -> OffchainComputingInfraEvent<Test> {
	System::events()
		.into_iter()
		.map(|r| r.event)
		.filter_map(|e| {
			if let RuntimeEvent::OffchainComputingInfra(inner) = e {
				Some(inner)
			} else {
				None
			}
		})
		.last()
		.expect("Must have an event")
}

fn mock_impl_and_build(owner: AccountId) -> (ImplId, ImplSpecVersion) {
	assert_ok!(OffchainComputingInfra::register_impl(
		RuntimeOrigin::signed(owner),
		AttestationMethod::OptOut,
	));

	let OffchainComputingInfraEvent::ImplRegistered {
		owner: actual_owner,
		attestation_method: actual_attestation_method,
		impl_id,
	} = last_event()
	else {
		panic!("The last event must be `ImplRegistered`");
	};

	assert_eq!(actual_owner, owner);
	assert_eq!(actual_attestation_method, AttestationMethod::OptOut);

	(impl_id, 1)
}

fn register_worker_for(
	owner: AccountId,
	worker: AccountId,
	impl_id: ImplId,
	initial_deposit: Balance,
) -> WorkerInfo {
	let owner_balance = Balances::free_balance(owner);

	assert_ok!(OffchainComputingInfra::register_worker(
		RuntimeOrigin::signed(owner),
		worker,
		impl_id,
		initial_deposit
	));

	let worker_info = Workers::<Test>::get(worker).unwrap();

	assert_eq!(worker_info.status, WorkerStatus::Registered);
	assert_eq!(Balances::free_balance(owner), owner_balance.saturating_sub(initial_deposit));
	assert_eq!(Balances::reserved_balance(worker), worker_info.deposit);
	assert_eq!(Balances::free_balance(worker), initial_deposit.saturating_sub(worker_info.deposit));

	worker_info
}

#[test]
fn register_worker_works() {
	new_test_ext().execute_with(|| {
		set_balance(ALICE, 201 * DOLLARS);

		run_to_block(1);

		let (impl_id, _impl_build_version) = mock_impl_and_build(ALICE);

		run_to_block(2);

		register_worker_for(ALICE, ALICE_WORKER, impl_id, 101 * DOLLARS);

		assert_noop!(
			OffchainComputingInfra::register_worker(
				RuntimeOrigin::signed(ALICE),
				ALICE_WORKER,
				impl_id,
				11 * DOLLARS
			),
			Error::<Test>::InitialBalanceTooLow
		);

		assert_noop!(
			OffchainComputingInfra::register_worker(
				RuntimeOrigin::signed(ALICE),
				ALICE_WORKER,
				impl_id,
				101 * DOLLARS
			),
			Error::<Test>::AlreadyRegistered
		);
	});
}

#[test]
fn deregister_worker_works() {
	new_test_ext().execute_with(|| {
		set_balance(ALICE, 201 * DOLLARS);

		run_to_block(1);

		let (impl_id, _impl_build_version) = mock_impl_and_build(ALICE);
		register_worker_for(ALICE, ALICE_WORKER, impl_id, 101 * DOLLARS);

		run_to_block(2);

		assert_ok!(OffchainComputingInfra::deregister_worker(
			RuntimeOrigin::signed(ALICE),
			ALICE_WORKER
		));

		assert_eq!(Balances::free_balance(ALICE), 200 * DOLLARS);
		assert!(!Account::<Test>::contains_key(ALICE_WORKER));
	});
}
