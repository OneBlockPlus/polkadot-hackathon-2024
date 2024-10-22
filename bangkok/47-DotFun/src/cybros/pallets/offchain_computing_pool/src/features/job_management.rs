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

use crate::*;
use frame_support::pallet_prelude::*;
use frame_system::pallet_prelude::*;
use sp_runtime::{traits::Zero, Saturating};

impl<T: Config> Pallet<T> {
	#[allow(clippy::too_many_arguments)]
	pub(crate) fn do_create_job(
		pool_info: PoolInfo<T::PoolId, T::AccountId, BalanceOf<T>, T::ImplId>,
		policy_info: JobPolicy<T::PolicyId, BlockNumberFor<T>, T::AccountId>,
		job_id: T::JobId,
		unique_track_id: Option<UniqueTrackId>,
		beneficiary: T::AccountId,
		depositor: T::AccountId,
		impl_spec_version: ImplSpecVersion,
		input_data: Option<BoundedVec<u8, T::InputLimit>>,
		now: u64,
		expires_in: Option<u64>,
	) -> DispatchResult {
		ensure!(
			impl_spec_version >= pool_info.min_impl_spec_version &&
				impl_spec_version <= pool_info.max_impl_spec_version,
			Error::<T>::UnsupportedImplSpecVersion
		);

		let expires_in = expires_in.unwrap_or(T::DefaultJobExpiresIn::get());
		ensure!(expires_in >= T::MinJobExpiresIn::get(), Error::<T>::ExpiresInTooSmall);
		ensure!(expires_in <= T::MaxJobExpiresIn::get(), Error::<T>::ExpiresInTooLarge);

		ensure!(!Jobs::<T>::contains_key(&pool_info.id, &job_id), Error::<T>::JobIdTaken);

		let job_deposit = T::JobCreationDeposit::get();
		<T as Config>::Currency::hold(
			&HoldReason::JobDepositorReserve.into(),
			&depositor,
			job_deposit,
		)?;

		let input_deposit = T::JobStorageDepositPerByte::get().saturating_mul(
			(input_data.as_ref().map(|x| x.len()).unwrap_or_default() as u32).into(),
		);
		<T as Config>::Currency::hold(
			&HoldReason::JobStorageReserve.into(),
			&depositor,
			input_deposit,
		)?;

		let expires_at = now + expires_in;
		let job = JobInfo::<T::JobId, T::PolicyId, T::AccountId, BalanceOf<T>> {
			id: job_id.clone(),
			unique_track_id: unique_track_id.clone(),
			policy_id: policy_info.id.clone(),
			depositor: depositor.clone(),
			deposit: job_deposit,
			beneficiary: beneficiary.clone(),
			impl_build_version: None,
			impl_spec_version,
			status: JobStatus::Pending,
			result: None,
			expires_at,
			created_at: now,
			assignee: None,
			assigned_at: None,
			processing_at: None,
			ended_at: None,
		};
		Jobs::<T>::insert(&pool_info.id, &job_id, job);
		if let Some(unique_track_id) = unique_track_id.clone() {
			IndexedJobs::<T>::insert(&pool_info.id, unique_track_id, job_id.clone())
		}

		if let Some(input_data) = input_data.clone() {
			let input = ChainStoredData::<T::AccountId, BalanceOf<T>, T::InputLimit> {
				depositor: depositor.clone(),
				actual_deposit: input_deposit,
				surplus_deposit: Zero::zero(),
				data: input_data.clone(),
			};
			JobInputs::<T>::insert(&pool_info.id, &job_id, input);
		}

		// TODO:
		// if let Some(settlement_contract) = policy_info.settlement_contract {
		// 	use pallet_contracts::{CollectEvents, DebugInfo, Determinism};
		//
		// 	// Amount to transfer to the message. Not gonna transfer anything here, so we'll
		// 	// leave this as `0`.
		// 	let value: ContractBalanceOf<T> = Default::default();
		//
		// 	// You'll have to play around with this depending on your contract. I don't recommend
		// 	// hard coding it but for demo purposes this'll do the trick
		// 	let gas_limit = Weight::zero();
		//
		// 	// Remember, we pulled this out from the `metadata.json` file.
		// 	//
		// 	// Again, probably shouldn't be hardcoded but :shrug:
		// 	let mut selector: Vec<u8> = [0x00, 0x00, 0x00, 0x01].into();
		//
		// 	let mut data = Vec::new();
		// 	data.append(&mut selector);
		// 	data.append(&mut pool_info.id.clone());
		// 	data.append(&mut job.id.clone());
		//
		// 	pallet_contracts::Pallet::<T>::bare_call(
		// 		depositor,
		// 		settlement_contract,
		// 		value,
		// 		gas_limit,
		// 		None,
		// 		data,
		// 		DebugInfo::Skip,
		// 		CollectEvents::Skip,
		// 		Determinism::Enforced,
		// 	).result?;
		// }

		let mut new_pool_info = pool_info.clone();
		new_pool_info.jobs_count += 1;
		Pools::<T>::insert(&pool_info.id, new_pool_info);

		let mut new_policy_info = policy_info.clone();
		new_policy_info.jobs_count += 1;
		JobPolicies::<T>::insert(&pool_info.id, &policy_info.id, new_policy_info);

		AssignableJobs::<T>::insert((pool_info.id.clone(), impl_spec_version, job_id.clone()), ());
		AccountBeneficialJobs::<T>::insert(
			(beneficiary.clone(), pool_info.id.clone(), job_id.clone()),
			(),
		);

		Self::deposit_event(Event::JobCreated {
			pool_id: pool_info.id,
			job_id,
			unique_track_id,
			policy_id: policy_info.id,
			depositor,
			beneficiary,
			impl_spec_version,
			input: input_data,
			expires_in,
		});
		Ok(())
	}

	pub(crate) fn do_destroy_job(
		who: T::AccountId,
		pool_id: T::PoolId,
		job_id: T::JobId,
		reason: JobDestroyReason,
	) -> DispatchResult {
		let job = Jobs::<T>::get(&pool_id, &job_id).ok_or(Error::<T>::JobNotFound)?;

		if reason == JobDestroyReason::Safe {
			Self::ensure_job_beneficiary_or_depositor(&who, &job)?;
		}

		ensure!(
			matches!(job.status, JobStatus::Pending | JobStatus::Processed | JobStatus::Discarded),
			Error::<T>::JobIsProcessing
		);

		Self::do_actual_destroy_job(pool_id, job, who, reason)
	}

	pub(crate) fn do_destroy_expired_job(
		pool_id: T::PoolId,
		job_id: T::JobId,
		destroyer: T::AccountId,
		now: u64,
	) -> DispatchResult {
		let job = Jobs::<T>::get(&pool_id, &job_id).ok_or(Error::<T>::JobNotFound)?;
		Self::ensure_job_expired(&job, now)?;

		Self::do_actual_destroy_job(pool_id, job, destroyer, JobDestroyReason::Expired)?;

		Ok(())
	}

	pub(crate) fn do_actual_destroy_job(
		pool_id: T::PoolId,
		job: JobInfo<T::JobId, T::PolicyId, T::AccountId, BalanceOf<T>>,
		destroyer: T::AccountId,
		reason: JobDestroyReason,
	) -> DispatchResult {
		let job_id = job.id;
		let unique_track_id = job.unique_track_id;

		<T as Config>::Currency::release(
			&HoldReason::JobDepositorReserve.into(),
			&job.depositor,
			job.deposit,
			Precision::BestEffort,
		)?;
		if let Some(input_entry) = JobInputs::<T>::take(&pool_id, &job_id) {
			let deposit = input_entry.actual_deposit.saturating_add(input_entry.surplus_deposit);
			<T as Config>::Currency::release(
				&HoldReason::JobStorageReserve.into(),
				&input_entry.depositor,
				deposit,
				Precision::BestEffort,
			)?;
		}
		if let Some(output_entry) = JobOutputs::<T>::take(&pool_id, &job_id) {
			let deposit = output_entry.actual_deposit.saturating_add(output_entry.surplus_deposit);
			<T as Config>::Currency::release(
				&HoldReason::JobStorageReserve.into(),
				&output_entry.depositor,
				deposit,
				Precision::BestEffort,
			)?;
		}
		if let Some(proof_entry) = JobProofs::<T>::take(&pool_id, &job_id) {
			let deposit = proof_entry.actual_deposit.saturating_add(proof_entry.surplus_deposit);
			<T as Config>::Currency::release(
				&HoldReason::JobStorageReserve.into(),
				&proof_entry.depositor,
				deposit,
				Precision::BestEffort,
			)?;
		}

		if let Some(unique_track_id) = unique_track_id.clone() {
			IndexedJobs::<T>::remove(&pool_id, unique_track_id);
		}
		Jobs::<T>::remove(&pool_id, &job_id);
		Jobs::<T>::remove(&pool_id, &job_id);

		Pools::<T>::try_mutate_exists(&pool_id, |pool_info| -> Result<(), DispatchError> {
			let Some(pool_info) = pool_info else { return Err(Error::<T>::PoolNotFound.into()) };

			pool_info.jobs_count -= 1;

			Ok(())
		})?;

		JobPolicies::<T>::try_mutate_exists(
			&pool_id,
			&job.policy_id,
			|policy_info| -> Result<(), DispatchError> {
				let Some(policy_info) = policy_info else {
					return Err(Error::<T>::PoolNotFound.into())
				};

				policy_info.jobs_count -= 1;

				Ok(())
			},
		)?;

		if job.status == JobStatus::Pending {
			AssignableJobs::<T>::remove((pool_id.clone(), job.impl_spec_version, job_id.clone()));
		} else if job.status == JobStatus::Processing || job.status == JobStatus::Discarded {
			if let Some(worker) = &job.assignee {
				CounterForWorkerAssignedJobs::<T>::try_mutate(
					worker,
					|counter| -> Result<(), DispatchError> {
						*counter -= 1;
						Ok(())
					},
				)?;
			}
		}
		AccountBeneficialJobs::<T>::remove((
			job.beneficiary.clone(),
			pool_id.clone(),
			job_id.clone(),
		));

		Self::deposit_event(Event::JobDestroyed {
			pool_id,
			job_id,
			unique_track_id,
			destroyer,
			reason,
		});
		Ok(())
	}
}
