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
use sp_runtime::{traits::Zero, Saturating};

impl<T: Config> Pallet<T> {
	// TODO: Will be replaced by scheduler.
	pub(crate) fn do_take_job(
		pool_id: T::PoolId,
		maybe_job_id: Option<T::JobId>,
		worker: T::AccountId,
		now: u64,
		processing: bool,
		expires_in: u64,
	) -> DispatchResult {
		Self::ensure_subscribed_worker(&pool_id, &worker)?;
		let worker_info =
			PalletInfra::<T>::worker_info(&worker).ok_or(Error::<T>::WorkerNotFound)?;
		let worker_impl_spec_version =
			worker_info.impl_spec_version.ok_or(Error::<T>::InternalError)?;

		let current_assigned_jobs_count = CounterForWorkerAssignedJobs::<T>::get(&worker);
		ensure!(
			current_assigned_jobs_count < T::MaxAssignedJobsPerWorker::get(),
			Error::<T>::WorkerAssignedJobsLimitExceeded
		);

		// TODO: the current design has thundering herd problem, but it's OK for now.
		let mut job = 'block: {
			if let Some(job_id) = maybe_job_id {
				break 'block Jobs::<T>::get(&pool_id, &job_id).ok_or(Error::<T>::JobNotFound)
			}

			let job_id =
				AssignableJobs::<T>::iter_key_prefix((pool_id.clone(), worker_impl_spec_version))
					.next()
					.ok_or(Error::<T>::NoAssignableJob)?;
			Jobs::<T>::get(&pool_id, &job_id).ok_or(Error::<T>::JobNotFound)
		}?;
		ensure!(worker_impl_spec_version == job.impl_spec_version, Error::<T>::ImplMismatched);
		AssignableJobs::<T>::remove((pool_id.clone(), job.impl_spec_version, job.id.clone()));

		// It is possible to get a expired job, but actually it is a soft expiring
		// Comment this because current `expires_at` actually a soft expiring
		// Self::ensure_job_not_expired(&job, now)?;

		ensure!(job.assignee.is_none(), Error::<T>::JobAlreadyAssigned);
		job.assignee = Some(worker.clone());
		job.assigned_at = Some(now);

		// job.expires_at = now + expires_in; // Not sure we need to expand expiring time
		if processing {
			job.status = JobStatus::Processing;
			job.processing_at = Some(now);
			job.expires_at = now + expires_in;
		}

		let job_id = job.id.clone();
		CounterForWorkerAssignedJobs::<T>::insert(&worker, current_assigned_jobs_count + 1);
		Jobs::<T>::insert(&pool_id, &job_id, job);

		let Some(impl_build_version) = worker_info.impl_build_version else {
			return Err(Error::<T>::InternalError.into())
		};
		Self::deposit_event(Event::JobAssigned {
			pool_id: pool_id.clone(),
			job_id: job_id.clone(),
			assignee: worker,
			impl_build_version,
		});
		if processing {
			Self::deposit_event(Event::JobStatusUpdated {
				pool_id,
				job_id,
				status: JobStatus::Processing,
			});
		}
		Ok(())
	}

	pub(crate) fn do_resign_job(
		pool_id: T::PoolId,
		job_id: T::JobId,
		worker: T::AccountId,
	) -> DispatchResult {
		Self::ensure_worker_in_pool(&pool_id, &worker)?;

		let mut job = Jobs::<T>::get(&pool_id, &job_id).ok_or(Error::<T>::JobNotFound)?;
		ensure!(
			!matches!(job.status, JobStatus::Processing | JobStatus::Processed),
			Error::<T>::JobAssigneeLocked
		);
		Self::ensure_job_assignee(&job, &worker)?;

		job.impl_build_version = None;
		job.assignee = None;
		job.assigned_at = None;

		CounterForWorkerAssignedJobs::<T>::try_mutate(
			&worker,
			|counter| -> Result<(), DispatchError> {
				*counter -= 1;
				Ok(())
			},
		)?;
		AssignableJobs::<T>::insert((pool_id.clone(), job.impl_spec_version, job_id.clone()), ());

		Jobs::<T>::insert(&pool_id, &job_id, job);

		Self::deposit_event(Event::JobResigned { pool_id, job_id });
		Ok(())
	}

	#[allow(clippy::too_many_arguments)]
	pub(crate) fn do_submit_job_result(
		pool_id: T::PoolId,
		job_id: T::JobId,
		worker: T::AccountId,
		result: JobResult,
		output_data: Option<BoundedVec<u8, T::OutputLimit>>,
		proof_data: Option<BoundedVec<u8, T::ProofLimit>>,
		now: u64,
		expires_in: u64,
	) -> DispatchResult {
		let mut job = Jobs::<T>::get(&pool_id, &job_id).ok_or(Error::<T>::JobNotFound)?;
		ensure!(
			matches!(job.status, JobStatus::Pending | JobStatus::Processing),
			Error::<T>::JobIsProcessed
		);
		// Comment this because current `expires_at` actually a soft expiring
		// Self::ensure_job_not_expired(&task, now)?;
		Self::ensure_job_assignee(&job, &worker)?;

		job.expires_at = now + expires_in;
		job.status = JobStatus::Processed;
		job.result = Some(result.clone());
		job.ended_at = Some(now);

		if let Some(output_data) = output_data.clone() {
			let deposit = T::JobStorageDepositPerByte::get()
				.saturating_mul(((output_data.len()) as u32).into());
			let depositor = job.assignee.clone().ok_or(Error::<T>::NoPermission)?;
			<T as Config>::Currency::hold(
				&HoldReason::JobStorageReserve.into(),
				&depositor,
				deposit,
			)?;

			let output_entry = ChainStoredData::<T::AccountId, BalanceOf<T>, T::OutputLimit> {
				depositor,
				actual_deposit: deposit,
				surplus_deposit: Zero::zero(),
				data: output_data.clone(),
			};
			JobOutputs::<T>::insert(&pool_id, &job_id, output_entry);
		}
		if let Some(proof_data) = proof_data.clone() {
			let deposit = T::JobStorageDepositPerByte::get()
				.saturating_mul(((proof_data.len()) as u32).into());
			let depositor = job.assignee.clone().ok_or(Error::<T>::NoPermission)?;
			<T as Config>::Currency::hold(
				&HoldReason::JobStorageReserve.into(),
				&depositor,
				deposit,
			)?;

			let proof_entry = ChainStoredData::<T::AccountId, BalanceOf<T>, T::ProofLimit> {
				depositor,
				actual_deposit: deposit,
				surplus_deposit: Zero::zero(),
				data: proof_data.clone(),
			};
			JobProofs::<T>::insert(&pool_id, &job_id, proof_entry);
		}

		CounterForWorkerAssignedJobs::<T>::try_mutate(
			&worker,
			|counter| -> Result<(), DispatchError> {
				*counter -= 1;
				Ok(())
			},
		)?;

		Self::deposit_event(Event::JobResultUpdated {
			pool_id: pool_id.clone(),
			job_id: job_id.clone(),
			result,
			output: output_data,
			proof: proof_data,
		});
		Self::deposit_event(Event::JobStatusUpdated {
			pool_id: pool_id.clone(),
			job_id: job_id.clone(),
			status: JobStatus::Processed,
		});

		let pool_info = Pools::<T>::get(pool_id.clone()).ok_or(Error::<T>::PoolNotFound)?;
		if pool_info.auto_destroy_processed_job_enabled {
			Self::do_actual_destroy_job(pool_id, job, worker, JobDestroyReason::Completed)?
		} else {
			Jobs::<T>::insert(&pool_id, &job_id, job);
		}

		Ok(())
	}
}
