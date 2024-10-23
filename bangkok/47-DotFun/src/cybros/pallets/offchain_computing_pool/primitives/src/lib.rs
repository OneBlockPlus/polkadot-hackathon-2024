// This file is part of Cybros.

// Copyright (C) Jun Jiang.
// SPDX-License-Identifier: GPL-3.0-or-later WITH Classpath-exception-2.0

// Cybros is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Cybros is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with Cybros.  If not, see <http://www.gnu.org/licenses/>.

#![cfg_attr(not(feature = "std"), no_std)]

use scale_codec::{Decode, Encode, MaxEncodedLen};
use scale_info::TypeInfo;
use sp_core::{bounded::BoundedVec, ConstU32};

pub use base_primitives::*;

pub type UniqueTrackId = BoundedVec<u8, ConstU32<16>>;

#[derive(Clone, Decode, Encode, MaxEncodedLen, Eq, PartialEq, Debug, TypeInfo, Default)]
pub enum ApplicableScope {
	/// Only the owner could use the implementations.
	#[default]
	Owner,
	/// Anyone could use.
	Public,
	/// Require the user in the allow list.
	AllowList,
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, Debug, TypeInfo, MaxEncodedLen)]
pub struct JobPolicy<PoolId, BlockNumber, AccountId> {
	/// Policy's id
	pub id: PoolId,
	/// This policy is available to use
	pub enabled: bool,
	/// Who can applicable with the policy
	pub applicable_scope: ApplicableScope,
	/// When the policy starts.
	pub start_block: Option<BlockNumber>,
	/// When the policy ends.
	pub end_block: Option<BlockNumber>,
	// TODO：rates strategy
	// TODO: allow create scheduled job and rule
	pub settlement_contract: Option<AccountId>,
	pub jobs_count: u32,
}

// TODO: Rates strategy (bound to JobPolicy), e.g. Pay a constant or by duration of processing fee
// for each job, pay to worker or the owner TODO: WorkerPolicy: How to slashing, max processing
// duration, and etc.

#[derive(Clone, Encode, Decode, Eq, PartialEq, Debug, TypeInfo, MaxEncodedLen)]
pub enum JobScheduler {
	/// DemoOnly
	DemoOnly
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, Debug, TypeInfo, MaxEncodedLen)]
pub enum JobDestroyReason {
	Safe,
	Force,
	Completed,
	Expired,
}

/// Information about a pool.
#[derive(Clone, Encode, Decode, Eq, PartialEq, Debug, TypeInfo, MaxEncodedLen)]
pub struct PoolInfo<PoolId, AccountId, Balance, ImplId> {
	/// Pool's id
	pub id: PoolId,
	/// Pool's owner.
	pub owner: AccountId,
	/// The total balance deposited by the owner for all the storage data associated with this
	/// pool. Used by `destroy`.
	pub owner_deposit: Balance,
	/// The implementation id
	pub impl_id: ImplId,
	/// How to schedule jobs
	pub job_scheduler: JobScheduler,
	/// Allow to create new job
	pub create_job_enabled: bool,
	/// Auto destroy processed job
	pub auto_destroy_processed_job_enabled: bool,
	/// Minimum impl spec version
	pub min_impl_spec_version: ImplSpecVersion,
	/// Maximum impl spec version
	pub max_impl_spec_version: ImplSpecVersion,
	/// The total number of outstanding job policies of this pool.
	pub job_policies_count: u32,
	/// The total number of outstanding jobs of this pool.
	pub jobs_count: u32,
	/// The total number of outstanding workers of this pool.
	pub workers_count: u32,
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, Debug, TypeInfo, MaxEncodedLen)]
pub enum JobStatus {
	/// Initial status, the job is pending to be processed
	Pending,
	/// The worker is processing the job
	Processing,
	/// Ending status, the worker processed the job
	Processed,
	/// Ending status, the worker can't process the job (e.g. force offline)
	Discarded,
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, Debug, TypeInfo, MaxEncodedLen)]
pub enum JobResult {
	///  and report success
	Success,
	/// Ending status, the worker processed the item and report failed
	Fail,
	/// Ending status, the error occurred when processing the job, the error not relates to the
	/// worker itself
	Error,
	/// Ending status, the error occurred when processing the job, the error relates to the worker
	/// itself
	Panic,
}

// TODO: Idea: JobType: info will copy to Job, advanceable, creatable, minimum_deposit (more than
// actual will save to surplus_deposit)

#[derive(Clone, Encode, Decode, Eq, PartialEq, Debug, TypeInfo, MaxEncodedLen)]
pub struct JobInfo<JobId, PolicyId, AccountId, Balance> {
	pub id: JobId,
	pub unique_track_id: Option<UniqueTrackId>,
	pub policy_id: PolicyId,
	pub depositor: AccountId,
	pub deposit: Balance,
	pub beneficiary: AccountId,
	pub impl_build_version: Option<ImplBuildVersion>,
	/// The implementation spec version
	pub impl_spec_version: ImplSpecVersion,
	pub status: JobStatus,
	pub result: Option<JobResult>,
	/// This is soft expiring time, which means even the job has expired,
	/// worker can still process it, and earning from it,
	/// But other can destroy the job
	pub expires_at: u64,
	pub created_at: u64,
	pub assignee: Option<AccountId>,
	pub assigned_at: Option<u64>,
	pub processing_at: Option<u64>,
	pub ended_at: Option<u64>,
}
