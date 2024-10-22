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

use frame_support::dispatch::DispatchResult;
use primitives::{OfflineReason, OnlinePayload, VerifiedAttestation};

/// Trait describing something that implements a hook for any operations to perform when a staker is
/// slashed.
pub trait OffchainWorkerLifecycleHooks<AccountId, ImplId> {
	/// A hook for checking the worker whether can online,
	/// can use for add extra conditions check, if returns error, the worker will not be online
	fn can_online(
		worker: &AccountId,
		payload: &OnlinePayload<ImplId>,
		verified_attestation: &VerifiedAttestation,
	) -> DispatchResult;

	/// A hook after the worker transited to online status,
	/// can use for add additional business logic, e.g. assign job, reserve more money
	fn after_online(worker: &AccountId);

	/// A hook for checking the worker whether can offline,
	/// can use for add extra conditions check,
	/// if returns error (e.g. still have job running), the worker will not be offline
	fn can_offline(worker: &AccountId) -> bool;

	/// A hook after the worker transited to unresponsive status,
	/// can use for add additional business logic, e.g. un-reserve money
	fn after_unresponsive(worker: &AccountId);

	/// A hook before the worker transited to offline status,
	/// can use for add additional business logic, e.g. un-reserve money
	fn before_offline(worker: &AccountId, reason: OfflineReason);

	/// A hook after the worker update its attestation,
	/// Can use for if interest in payload's custom field
	fn after_refresh_attestation(
		worker: &AccountId,
		payload: &OnlinePayload<ImplId>,
		verified_attestation: &VerifiedAttestation,
	);

	/// A hook after the worker transited to requesting offline status,
	/// can use for add additional business logic, e.g. stop assigning job
	fn after_requesting_offline(worker: &AccountId);

	/// A hook for checking the worker whether can deregister,
	/// can use for add extra conditions check,
	/// if returns error (e.g. still have job running), the worker will not be deregistered
	fn can_deregister(worker: &AccountId) -> bool;

	/// A hook before the worker deregister
	fn before_deregister(worker: &AccountId);
}

impl<AccountId, ImplId> OffchainWorkerLifecycleHooks<AccountId, ImplId> for () {
	fn can_online(
		_: &AccountId,
		_: &OnlinePayload<ImplId>,
		_: &VerifiedAttestation,
	) -> DispatchResult {
		Ok(())
	}

	fn after_online(_: &AccountId) {
		// Do nothing
	}

	fn can_offline(_: &AccountId) -> bool {
		true
	}

	fn after_unresponsive(_: &AccountId) {
		// Do nothing
	}

	fn before_offline(_: &AccountId, _: OfflineReason) {
		// Do nothing
	}

	fn after_refresh_attestation(
		_: &AccountId,
		_: &OnlinePayload<ImplId>,
		_: &VerifiedAttestation,
	) {
		// Do nothing
	}

	fn after_requesting_offline(_: &AccountId) {
		// Do nothing
	}

	fn can_deregister(_: &AccountId) -> bool {
		true
	}

	fn before_deregister(_: &AccountId) {
		// Do nothing
	}
}
