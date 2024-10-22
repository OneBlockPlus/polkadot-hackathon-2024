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

#![cfg_attr(not(feature = "std"), no_std)]

extern crate alloc;

mod features;

#[cfg(test)]
mod mock;
#[cfg(test)]
mod tests;

pub use pallet::*;
pub use primitives::*;

/// The log target of this pallet.
pub const LOG_TARGET: &str = "runtime::offchain-computing_pool";

// Syntactic sugar for logging.
#[macro_export]
macro_rules! log {
	($level:tt, $patter:expr $(, $values:expr)* $(,)?) => {
		log::$level!(
			target: $crate::LOG_TARGET,
			concat!("[{:?}] ", $patter), <frame_system::Pallet<T>>::block_number() $(, $values)*
		)
	};
}

use alloc::vec::Vec;
use frame_support::{
	traits::{Incrementable, UnixTime},
	transactional,
};
use sp_runtime::{
	traits::{AtLeast32BitUnsigned, StaticLookup},
	SaturatedConversion,
};

pub(crate) use frame_support::traits::{
	fungible::{
		Inspect as InspectFungible, InspectHold as InspectHoldFungible, Mutate as MutateFungible,
		MutateHold as MutateHoldFungible,
	},
	tokens::Precision,
};
pub(crate) use frame_system::pallet_prelude::BlockNumberFor;
pub(crate) use pallet_offchain_computing_infra::OffchainWorkerLifecycleHooks;

pub(crate) type PalletInfra<T> = pallet_offchain_computing_infra::Pallet<T>;

pub(crate) type AccountIdLookupOf<T> = <<T as frame_system::Config>::Lookup as StaticLookup>::Source;
pub(crate) type BalanceOf<T> =
	<<T as Config>::Currency as InspectFungible<<T as frame_system::Config>::AccountId>>::Balance;
pub(crate) type ContractBalanceOf<T> =
	<<T as pallet_contracts::Config>::Currency as InspectFungible<<T as frame_system::Config>::AccountId>>::Balance;

#[frame_support::pallet]
pub mod pallet {
	use super::*;
	use frame_support::pallet_prelude::*;
	use frame_system::pallet_prelude::*;
	use core::fmt::Display;

	/// The current storage version.
	const STORAGE_VERSION: StorageVersion = StorageVersion::new(1);

	#[pallet::pallet]
	#[pallet::storage_version(STORAGE_VERSION)]
	pub struct Pallet<T>(_);

	/// Configure the pallet by specifying the parameters and types on which it depends.
	#[pallet::config]
	pub trait Config: frame_system::Config + pallet_contracts::Config + pallet_offchain_computing_infra::Config {
		/// Because this pallet emits events, it depends on the runtime definition of an event.
		type RuntimeEvent: From<Event<Self>>
			+ IsType<<Self as frame_system::Config>::RuntimeEvent>
			+ TryInto<Event<Self>>;

		/// Overarching hold reason.
		type RuntimeHoldReason: From<HoldReason>;

		/// The system's currency for payment.
		type Currency: InspectFungible<Self::AccountId>
			+ MutateFungible<Self::AccountId>
			+ InspectHoldFungible<Self::AccountId>
			+ MutateHoldFungible<Self::AccountId, Reason = <Self as Config>::RuntimeHoldReason>;

		/// Identifier for the jobs' pool.
		type PoolId: Member
			+ Parameter
			+ MaxEncodedLen
			+ Display
			+ AtLeast32BitUnsigned
			+ Incrementable;

		/// The type used to identify a job within a pool.
		type JobId: Member
			+ Parameter
			+ MaxEncodedLen
			+ Display
			+ AtLeast32BitUnsigned
			+ Incrementable;

		/// The type used to identify a policy within a pool.
		type PolicyId: Member
			+ Parameter
			+ MaxEncodedLen
			+ Display
			+ AtLeast32BitUnsigned
			+ Incrementable;

		/// Standard collection creation is only allowed if the origin attempting it and the
		/// collection are in this set.
		type CreatePoolOrigin: EnsureOrigin<Self::RuntimeOrigin, Success = Self::AccountId>;

		/// The basic amount of funds that must be reserved for pool.
		#[pallet::constant]
		type PoolCreationDeposit: Get<BalanceOf<Self>>;

		/// The basic amount of funds that must be reserved for a job.
		#[pallet::constant]
		type JobCreationDeposit: Get<BalanceOf<Self>>;

		/// The basic amount of funds that must be reserved when adding metadata to your item.
		#[pallet::constant]
		type JobStorageDepositPerByte: Get<BalanceOf<Self>>;

		/// The basic amount of funds that must be reserved when adding metadata to your item.
		#[pallet::constant]
		type PoolMetadataDepositBase: Get<BalanceOf<Self>>;

		#[pallet::constant]
		type PoolMetadataDepositPerByte: Get<BalanceOf<Self>>;

		/// The limit of jobs a worker could be assigned
		#[pallet::constant]
		type MaxAssignedJobsPerWorker: Get<u32>;

		/// The limit of pools a worker could be subscribed
		#[pallet::constant]
		type MaxSubscribedPoolsPerWorker: Get<u32>;

		/// The limit of policies of a pool
		#[pallet::constant]
		type MaxPoliciesPerPool: Get<u32>;

		/// The limit of jobs in a pool
		#[pallet::constant]
		type MaxJobsPerPool: Get<u32>;

		/// The limit of workers in a pool
		#[pallet::constant]
		type MaxWorkersPerPool: Get<u32>;

		/// The min `expires_in` can be set
		#[pallet::constant]
		type MinJobExpiresIn: Get<u64>;

		/// The max `expires_in` can be set
		#[pallet::constant]
		type MaxJobExpiresIn: Get<u64>;

		/// The default `expires_in` if not given
		#[pallet::constant]
		type DefaultJobExpiresIn: Get<u64>;

		/// The maximum length of pool's metadata stored on-chain.
		#[pallet::constant]
		type PoolMetadataLimit: Get<u32>;

		/// The maximum length of input stored on-chain.
		#[pallet::constant]
		type InputLimit: Get<u32>;

		/// The maximum length of processed output stored on-chain.
		#[pallet::constant]
		type OutputLimit: Get<u32>;

		/// The maximum length of proof stored on-chain.
		#[pallet::constant]
		type ProofLimit: Get<u32>;

		// TODO: Support to create new job by off-chain pre-sign message
		// /// Off-Chain signature type.
		// ///
		// /// Can verify whether an `Self::OffchainPublic` created a signature.
		// type OffchainSignature: Verify<Signer = Self::OffchainPublic> + Parameter;
		//
		// /// Off-Chain public key.
		// ///
		// /// Must identify as an on-chain `Self::AccountId`.
		// type OffchainPublic: IdentifyAccount<AccountId = Self::AccountId>;
	}

	#[pallet::event]
	#[pallet::generate_deposit(pub(super) fn deposit_event)]
	pub enum Event<T: Config> {
		PoolCreated {
			owner: T::AccountId,
			pool_id: T::PoolId,
			impl_id: T::ImplId,
			job_scheduler: JobScheduler,
			create_job_enabled: bool,
			auto_destroy_processed_job_enabled: bool,
		},
		PoolDestroyed {
			pool_id: T::PoolId,
		},
		PoolMetadataUpdated {
			pool_id: T::PoolId,
			metadata: BoundedVec<u8, T::PoolMetadataLimit>,
		},
		PoolMetadataRemoved {
			pool_id: T::PoolId,
		},
		PoolSettingsUpdated {
			pool_id: T::PoolId,
			min_impl_spec_version: ImplSpecVersion,
			max_impl_spec_version: ImplSpecVersion,
			job_scheduler: JobScheduler,
			create_job_enabled: bool,
			auto_destroy_processed_job_enabled: bool,
		},
		JobPolicyCreated {
			pool_id: T::PoolId,
			policy_id: T::PolicyId,
			applicable_scope: ApplicableScope,
			start_block: Option<BlockNumberFor<T>>,
			end_block: Option<BlockNumberFor<T>>,
			settlement_contract: Option<T::AccountId>,
		},
		AccountAuthorized {
			pool_id: T::PoolId,
			policy_id: T::PolicyId,
			account: T::AccountId,
		},
		AccountRevoked {
			pool_id: T::PoolId,
			policy_id: T::PolicyId,
			account: T::AccountId,
		},
		JobPolicyDestroyed {
			pool_id: T::PoolId,
			policy_id: T::PolicyId,
		},
		JobPolicyEnablementUpdated {
			pool_id: T::PoolId,
			policy_id: T::PolicyId,
			enabled: bool,
		},
		WorkerAuthorized {
			pool_id: T::PoolId,
			worker: T::AccountId,
		},
		WorkerRevoked {
			pool_id: T::PoolId,
			worker: T::AccountId,
		},
		WorkerSubscribed {
			worker: T::AccountId,
			pool_id: T::PoolId,
		},
		WorkerUnsubscribed {
			worker: T::AccountId,
			pool_id: T::PoolId,
		},
		JobCreated {
			pool_id: T::PoolId,
			job_id: T::JobId,
			unique_track_id: Option<UniqueTrackId>,
			policy_id: T::PolicyId,
			depositor: T::AccountId,
			beneficiary: T::AccountId,
			impl_spec_version: ImplSpecVersion,
			input: Option<BoundedVec<u8, T::InputLimit>>,
			expires_in: u64,
		},
		JobDestroyed {
			pool_id: T::PoolId,
			job_id: T::JobId,
			unique_track_id: Option<UniqueTrackId>,
			destroyer: T::AccountId,
			reason: JobDestroyReason,
		},
		JobAssigned {
			pool_id: T::PoolId,
			job_id: T::JobId,
			assignee: T::AccountId,
			impl_build_version: ImplBuildVersion,
		},
		JobResigned {
			pool_id: T::PoolId,
			job_id: T::JobId,
		},
		JobStatusUpdated {
			pool_id: T::PoolId,
			job_id: T::JobId,
			status: JobStatus,
		},
		JobResultUpdated {
			pool_id: T::PoolId,
			job_id: T::JobId,
			result: JobResult,
			output: Option<BoundedVec<u8, T::OutputLimit>>,
			proof: Option<BoundedVec<u8, T::ProofLimit>>,
		},
	}

	// Errors inform users that something went wrong.
	#[pallet::error]
	pub enum Error<T> {
		InternalError,
		PoolIdTaken,
		PolicyIdTaken,
		JobIdTaken,
		PoolNotEmpty,
		NoPermission,
		WorkerNotFound,
		WorkerNotInThePool,
		WorkerNotSubscribeThePool,
		PoolNotFound,
		PoolCreateNewJobUnavailable,
		JobPolicyScopeNotAllowList,
		JobPoliciesPerPoolLimitExceeded,
		JobPolicyNotApplicable,
		JobPolicyUnavailable,
		JobPolicyNotFound,
		JobPolicyStillInUse,
		ExpiresInTooSmall,
		ExpiresInTooLarge,
		WorkerAlreadyAuthorized,
		WorkerAlreadySubscribed,
		WorkerSubscribedPoolsLimitExceeded,
		ImplMismatched,
		ImplNotFound,
		TasksPerPoolLimitExceeded,
		JobNotFound,
		WorkerAssignedJobsLimitExceeded,
		NoAssignableJob,
		UniqueTrackIdNotUnique,
		JobIsProcessing,
		JobIsProcessed,
		JobAssigneeLocked,
		JobStillValid,
		JobExpired,
		JobAlreadyAssigned,
		UnsupportedImplSpecVersion,
		InvalidImplSpecVersionRange,
		SettlementContractNotFound,
		SettlementContractCallFailed,
	}

	#[pallet::composite_enum]
	pub enum HoldReason {
		PoolCreationReserve,
		PoolMetadataStorageReserve,
		JobDepositorReserve,
		JobStorageReserve,
	}

	/// Pools info.
	#[pallet::storage]
	pub type Pools<T: Config> = CountedStorageMap<
		_,
		Blake2_128Concat,
		T::PoolId,
		PoolInfo<T::PoolId, T::AccountId, BalanceOf<T>, T::ImplId>,
	>;

	/// Metadata of a pool.
	#[pallet::storage]
	pub type PoolMetadata<T: Config> = StorageMap<
		_,
		Blake2_128Concat,
		T::PoolId,
		ChainStoredData<T::AccountId, BalanceOf<T>, T::PoolMetadataLimit>,
		OptionQuery,
	>;

	/// Jobs policies
	#[pallet::storage]
	pub type JobPolicies<T: Config> = StorageDoubleMap<
		_,
		Blake2_128Concat,
		T::PoolId,
		Blake2_128Concat,
		T::PolicyId,
		JobPolicy<T::PolicyId, BlockNumberFor<T>, T::AccountId>,
		OptionQuery,
	>;

	/// Allow accounts list of job policy
	#[pallet::storage]
	pub type JobPolicyAuthorizedAccounts<T: Config> = StorageNMap<
		_,
		(
			NMapKey<Blake2_128Concat, T::PoolId>,
			NMapKey<Blake2_128Concat, T::PolicyId>,
			NMapKey<Blake2_128Concat, T::AccountId>,
		),
		(),
		OptionQuery,
	>;

	/// Workers of pools
	#[pallet::storage]
	pub type PoolAuthorizedWorkers<T: Config> = StorageDoubleMap<
		_,
		Blake2_128Concat,
		T::AccountId,
		Blake2_128Concat,
		T::PoolId,
		(),
		OptionQuery,
	>;

	#[pallet::storage]
	pub type WorkerSubscribedPools<T: Config> = StorageDoubleMap<
		_,
		Blake2_128Concat,
		T::AccountId,
		Blake2_128Concat,
		T::PoolId,
		(),
		OptionQuery,
	>;

	/// Jobs info.
	#[pallet::storage]
	pub type Jobs<T: Config> = StorageDoubleMap<
		_,
		Blake2_128Concat,
		T::PoolId,
		Blake2_128Concat,
		T::JobId,
		JobInfo<T::JobId, T::PolicyId, T::AccountId, BalanceOf<T>>,
		OptionQuery,
	>;

	#[pallet::storage]
	pub type IndexedJobs<T: Config> = StorageDoubleMap<
		_,
		Blake2_128Concat,
		T::PoolId,
		Blake2_128Concat,
		UniqueTrackId,
		T::JobId,
		OptionQuery,
	>;

	#[pallet::storage]
	pub type JobInputs<T: Config> = StorageDoubleMap<
		_,
		Blake2_128Concat,
		T::PoolId,
		Blake2_128Concat,
		T::JobId,
		ChainStoredData<T::AccountId, BalanceOf<T>, T::InputLimit>,
		OptionQuery,
	>;

	#[pallet::storage]
	pub type JobOutputs<T: Config> = StorageDoubleMap<
		_,
		Blake2_128Concat,
		T::PoolId,
		Blake2_128Concat,
		T::JobId,
		ChainStoredData<T::AccountId, BalanceOf<T>, T::OutputLimit>,
		OptionQuery,
	>;

	#[pallet::storage]
	pub type JobProofs<T: Config> = StorageDoubleMap<
		_,
		Blake2_128Concat,
		T::PoolId,
		Blake2_128Concat,
		T::JobId,
		ChainStoredData<T::AccountId, BalanceOf<T>, T::ProofLimit>,
		OptionQuery,
	>;

	/// Stores the `PoolId` that is going to be used for the next pool.
	/// This gets incremented whenever a new pool is created.
	#[pallet::storage]
	pub type NextPoolId<T: Config> = StorageValue<_, T::PoolId, OptionQuery>;

	/// Stores the `JobId` that is going to be used for the next job.
	/// This gets incremented whenever a new job is created.
	#[pallet::storage]
	pub type NextJobPolicyId<T: Config> =
		StorageMap<_, Blake2_128Concat, T::PoolId, T::PolicyId, OptionQuery>;

	/// Stores the `JobId` that is going to be used for the next job.
	/// This gets incremented whenever a new job is created.
	#[pallet::storage]
	pub type NextJobId<T: Config> =
		StorageMap<_, Blake2_128Concat, T::PoolId, T::JobId, OptionQuery>;

	/// The pools owned by any given account; set out this way so that pools owned by
	/// a single account can be enumerated.
	#[pallet::storage]
	pub type AccountOwningPools<T: Config> = StorageDoubleMap<
		_,
		Blake2_128Concat,
		T::AccountId,
		Blake2_128Concat,
		T::PoolId,
		(),
		OptionQuery,
	>;

	/// The jobs held by any given account; set out this way so that jobs owned by a single
	/// account can be enumerated.
	#[pallet::storage]
	pub type AccountBeneficialJobs<T: Config> = StorageNMap<
		_,
		(
			NMapKey<Blake2_128Concat, T::AccountId>, // Beneficiary
			NMapKey<Blake2_128Concat, T::PoolId>,
			NMapKey<Blake2_128Concat, T::JobId>,
		),
		(),
		OptionQuery,
	>;

	#[pallet::storage]
	pub type WorkerAssignedJobs<T: Config> = StorageNMap<
		_,
		(
			NMapKey<Blake2_128Concat, T::AccountId>, // owner
			NMapKey<Blake2_128Concat, T::PoolId>,
			NMapKey<Blake2_128Concat, T::JobId>,
		),
		(),
		OptionQuery,
	>;

	#[pallet::storage]
	pub type AssignableJobs<T: Config> = StorageNMap<
		_,
		(
			NMapKey<Blake2_128Concat, T::PoolId>,
			NMapKey<Blake2_128Concat, ImplSpecVersion>,
			NMapKey<Blake2_128Concat, T::JobId>,
		),
		(),
		OptionQuery,
	>;

	#[pallet::storage]
	pub type CounterForWorkerAddedPools<T: Config> =
		StorageMap<_, Blake2_128Concat, T::AccountId, u32, ValueQuery>;

	#[pallet::storage]
	pub type CounterForWorkerSubscribedPools<T: Config> =
		StorageMap<_, Blake2_128Concat, T::AccountId, u32, ValueQuery>;

	#[pallet::storage]
	pub type CounterForWorkerAssignedJobs<T: Config> =
		StorageMap<_, Blake2_128Concat, T::AccountId, u32, ValueQuery>;

	#[pallet::call]
	impl<T: Config> Pallet<T> {
		#[transactional]
		#[pallet::call_index(0)]
		#[pallet::weight({0})]
		pub fn create_pool(
			origin: OriginFor<T>,
			impl_id: T::ImplId,
			job_scheduler: JobScheduler,
			create_job_enabled: bool,
			auto_destroy_processed_job_enabled: bool,
		) -> DispatchResult {
			let owner = T::CreatePoolOrigin::ensure_origin(origin)?;
			let pool_id = NextPoolId::<T>::get().unwrap_or(101u32.into());

			Self::do_create_pool(
				owner,
				pool_id.clone(),
				impl_id,
				job_scheduler,
				create_job_enabled,
				auto_destroy_processed_job_enabled,
			)?;

			let next_id = pool_id.increment();
			NextPoolId::<T>::set(next_id);

			Ok(())
		}

		#[transactional]
		#[pallet::call_index(1)]
		#[pallet::weight({0})]
		pub fn destroy_pool(origin: OriginFor<T>, pool_id: T::PoolId) -> DispatchResult {
			let who = ensure_signed(origin)?;

			Self::do_destroy_pool(who, pool_id)
		}

		#[transactional]
		#[pallet::call_index(2)]
		#[pallet::weight({0})]
		pub fn update_pool_metadata(
			origin: OriginFor<T>,
			pool_id: T::PoolId,
			metadata: Option<BoundedVec<u8, T::PoolMetadataLimit>>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let pool_info = Pools::<T>::get(&pool_id).ok_or(Error::<T>::PoolNotFound)?;
			Self::ensure_pool_owner(&who, &pool_info)?;

			if let Some(metadata) = metadata {
				Self::do_update_pool_metadata(pool_info, metadata)
			} else {
				Self::do_remove_pool_metadata(pool_info)
			}
		}

		#[transactional]
		#[pallet::call_index(3)]
		#[pallet::weight({0})]
		pub fn update_pool_settings(
			origin: OriginFor<T>,
			pool_id: T::PoolId,
			min_impl_spec_version: ImplSpecVersion,
			max_impl_spec_version: ImplSpecVersion,
			job_scheduler: JobScheduler,
			create_job_enabled: bool,
			auto_destroy_processed_job_enabled: bool,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let pool_info = Pools::<T>::get(&pool_id).ok_or(Error::<T>::PoolNotFound)?;
			Self::ensure_pool_owner(&who, &pool_info)?;

			Self::do_update_pool_settings(
				pool_info,
				min_impl_spec_version,
				max_impl_spec_version,
				job_scheduler,
				create_job_enabled,
				auto_destroy_processed_job_enabled,
			)
		}

		#[transactional]
		#[pallet::call_index(4)]
		#[pallet::weight({0})]
		pub fn create_job_policy(
			origin: OriginFor<T>,
			pool_id: T::PoolId,
			applicable_scope: ApplicableScope,
			start_block: Option<BlockNumberFor<T>>,
			end_block: Option<BlockNumberFor<T>>,
			settlement_contract: Option<T::AccountId>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let pool_info = Pools::<T>::get(&pool_id).ok_or(Error::<T>::PoolNotFound)?;
			Self::ensure_pool_owner(&who, &pool_info)?;

			ensure!(
				pool_info.job_policies_count <= T::MaxPoliciesPerPool::get(),
				Error::<T>::JobPoliciesPerPoolLimitExceeded
			);

			let policy_id = NextJobPolicyId::<T>::get(&pool_id).unwrap_or(1u32.into());
			Self::do_create_job_policy(
				pool_info,
				policy_id.clone(),
				applicable_scope,
				start_block,
				end_block,
				settlement_contract,
			)?;

			let next_id = policy_id.increment();
			NextJobPolicyId::<T>::set(&pool_id, next_id);

			Ok(())
		}

		#[transactional]
		#[pallet::call_index(5)]
		#[pallet::weight({0})]
		pub fn authorize_account(
			origin: OriginFor<T>,
			pool_id: T::PoolId,
			policy_id: T::PolicyId,
			account: AccountIdLookupOf<T>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let pool_info = Pools::<T>::get(&pool_id).ok_or(Error::<T>::PoolNotFound)?;
			Self::ensure_pool_owner(&who, &pool_info)?;

			let account = T::Lookup::lookup(account.clone())?;

			Self::do_authorize_account(pool_id, policy_id, account)
		}

		#[transactional]
		#[pallet::call_index(6)]
		#[pallet::weight({0})]
		pub fn revoke_account(
			origin: OriginFor<T>,
			pool_id: T::PoolId,
			policy_id: T::PolicyId,
			account: AccountIdLookupOf<T>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let pool_info = Pools::<T>::get(&pool_id).ok_or(Error::<T>::PoolNotFound)?;
			Self::ensure_pool_owner(&who, &pool_info)?;

			let account = T::Lookup::lookup(account.clone())?;

			Self::do_revoke_account(pool_id, policy_id, account)
		}

		#[transactional]
		#[pallet::call_index(7)]
		#[pallet::weight({0})]
		pub fn destroy_job_policy(
			origin: OriginFor<T>,
			pool_id: T::PoolId,
			policy_id: T::PolicyId,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let pool_info = Pools::<T>::get(&pool_id).ok_or(Error::<T>::PoolNotFound)?;
			Self::ensure_pool_owner(&who, &pool_info)?;

			Self::do_destroy_job_policy(pool_info, policy_id)
		}

		#[transactional]
		#[pallet::call_index(8)]
		#[pallet::weight({0})]
		pub fn update_job_policy_enablement(
			origin: OriginFor<T>,
			pool_id: T::PoolId,
			policy_id: T::PolicyId,
			enabled: bool,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let pool_info = Pools::<T>::get(&pool_id).ok_or(Error::<T>::PoolNotFound)?;
			Self::ensure_pool_owner(&who, &pool_info)?;

			Self::do_update_job_policy_enablement(pool_id, policy_id, enabled)
		}

		#[transactional]
		#[pallet::call_index(9)]
		#[pallet::weight({0})]
		pub fn authorize_worker(
			origin: OriginFor<T>,
			pool_id: T::PoolId,
			worker: AccountIdLookupOf<T>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let pool_info = Pools::<T>::get(&pool_id).ok_or(Error::<T>::PoolNotFound)?;
			Self::ensure_pool_owner(&who, &pool_info)?;

			let worker = T::Lookup::lookup(worker.clone())?;

			Self::do_authorize_worker(pool_info, worker)
		}

		#[transactional]
		#[pallet::call_index(10)]
		#[pallet::weight({0})]
		pub fn revoke_worker(
			origin: OriginFor<T>,
			pool_id: T::PoolId,
			worker: AccountIdLookupOf<T>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;
			let worker = T::Lookup::lookup(worker)?;

			let pool_info = Pools::<T>::get(&pool_id).ok_or(Error::<T>::PoolNotFound)?;
			let worker_info =
				PalletInfra::<T>::worker_info(&worker).ok_or(Error::<T>::WorkerNotFound)?;

			let pool_owner = pool_info.owner.clone();
			let worker_owner = worker_info.owner;
			ensure!(pool_owner == who || worker_owner == who, Error::<T>::NoPermission);

			Self::do_revoke_worker(pool_info, worker)
		}

		#[transactional]
		#[pallet::call_index(11)]
		#[pallet::weight({0})]
		pub fn subscribe_pool(origin: OriginFor<T>, pool_id: T::PoolId) -> DispatchResult {
			let who = ensure_signed(origin)?;

			Self::do_subscribe_pool(who, pool_id)
		}

		#[transactional]
		#[pallet::call_index(12)]
		#[pallet::weight({0})]
		pub fn unsubscribe_pool(origin: OriginFor<T>, pool_id: T::PoolId) -> DispatchResult {
			let who = ensure_signed(origin)?;

			Self::do_unsubscribe_pool(who, pool_id)
		}

		#[transactional]
		#[pallet::call_index(13)]
		#[pallet::weight({0})]
		pub fn create_job(
			origin: OriginFor<T>,
			pool_id: T::PoolId,
			policy_id: T::PolicyId,
			unique_track_id: Option<UniqueTrackId>,
			beneficiary: Option<AccountIdLookupOf<T>>,
			impl_spec_version: ImplSpecVersion,
			input: Option<BoundedVec<u8, T::InputLimit>>,
			soft_expires_in: Option<u64>,
			// TODO: Tips?
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let pool_info = Pools::<T>::get(&pool_id).ok_or(Error::<T>::PoolNotFound)?;
			ensure!(pool_info.create_job_enabled, Error::<T>::PoolCreateNewJobUnavailable);
			ensure!(
				pool_info.jobs_count <= T::MaxJobsPerPool::get(),
				Error::<T>::TasksPerPoolLimitExceeded
			);

			if let Some(unique_track_id) = unique_track_id.clone() {
				ensure!(
					!IndexedJobs::<T>::contains_key(&pool_id, unique_track_id),
					Error::<T>::UniqueTrackIdNotUnique
				);
			}

			let beneficiary = if let Some(beneficiary) = beneficiary {
				T::Lookup::lookup(beneficiary)?
			} else {
				who.clone()
			};

			let policy =
				JobPolicies::<T>::get(&pool_id, &policy_id).ok_or(Error::<T>::JobPolicyNotFound)?;
			ensure!(policy.enabled, Error::<T>::JobPolicyUnavailable);
			let current_block = frame_system::Pallet::<T>::block_number();
			if let Some(start_block) = policy.start_block {
				ensure!(current_block >= start_block, Error::<T>::JobPolicyNotApplicable);
			}
			if let Some(end_block) = policy.end_block {
				ensure!(current_block <= end_block, Error::<T>::JobPolicyNotApplicable);
			}
			match policy.applicable_scope {
				ApplicableScope::Owner => {
					ensure!(pool_info.owner == who, Error::<T>::JobPolicyNotApplicable)
				},
				ApplicableScope::Public => {},
				ApplicableScope::AllowList => {
					ensure!(
						JobPolicyAuthorizedAccounts::<T>::contains_key((pool_id.clone(), policy_id.clone(), who.clone())),
						Error::<T>::JobPolicyNotApplicable
					)
				},
			};

			let job_id = NextJobId::<T>::get(&pool_id).unwrap_or(1u32.into());
			let now = T::UnixTime::now().as_secs().saturated_into::<u64>();
			Self::do_create_job(
				pool_info,
				policy,
				job_id.clone(),
				unique_track_id,
				beneficiary,
				who,
				impl_spec_version,
				input,
				now,
				soft_expires_in,
			)?;

			let next_id = job_id.increment();
			NextJobId::<T>::set(&pool_id, next_id);

			Ok(())
		}

		#[transactional]
		#[pallet::call_index(14)]
		#[pallet::weight({0})]
		pub fn destroy_job(
			origin: OriginFor<T>,
			pool_id: T::PoolId,
			job_id: T::JobId,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			Self::do_destroy_job(who, pool_id, job_id, JobDestroyReason::Safe)
		}

		#[transactional]
		#[pallet::call_index(15)]
		#[pallet::weight({0})]
		pub fn destroy_expired_job(
			origin: OriginFor<T>,
			pool_id: T::PoolId,
			job_id: T::JobId,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let now = T::UnixTime::now().as_secs().saturated_into::<u64>();
			Self::do_destroy_expired_job(pool_id, job_id, who, now)
		}

		#[transactional]
		#[pallet::call_index(16)]
		#[pallet::weight({0})]
		pub fn take_job(
			origin: OriginFor<T>,
			pool_id: T::PoolId,
			job_id: Option<T::JobId>,
			processing: bool,
			soft_expires_in: Option<u64>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let now = T::UnixTime::now().as_secs().saturated_into::<u64>();
			let expires_in = soft_expires_in.unwrap_or(T::DefaultJobExpiresIn::get());

			Self::do_take_job(pool_id, job_id, who, now, processing, expires_in)
		}

		#[transactional]
		#[pallet::call_index(17)]
		#[pallet::weight({0})]
		pub fn resign_job(
			origin: OriginFor<T>,
			pool_id: T::PoolId,
			job_id: T::JobId,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			Self::do_resign_job(pool_id, job_id, who)
		}

		#[transactional]
		#[pallet::call_index(18)]
		#[pallet::weight({0})]
		pub fn submit_job_result(
			origin: OriginFor<T>,
			pool_id: T::PoolId,
			job_id: T::JobId,
			result: JobResult,
			output: Option<BoundedVec<u8, T::OutputLimit>>,
			proof: Option<BoundedVec<u8, T::ProofLimit>>,
			soft_expires_in: Option<u64>,
		) -> DispatchResult {
			let who = ensure_signed(origin)?;

			let now = T::UnixTime::now().as_secs().saturated_into::<u64>();
			let expires_in = soft_expires_in.unwrap_or(T::DefaultJobExpiresIn::get());
			Self::do_submit_job_result(pool_id, job_id, who, result, output, proof, now, expires_in)
		}

		#[pallet::call_index(19)]
		#[pallet::weight({0})]
		pub fn test_call_contract(
			origin: OriginFor<T>,
			dest: AccountIdLookupOf<T>, // <- This is the address of the deployed contract we're calling
		) -> DispatchResult {
			use pallet_contracts::{CollectEvents, DebugInfo, Determinism};

			let who = ensure_signed(origin)?;
			let dest = T::Lookup::lookup(dest)?;

			// Amount to transfer to the message. Not gonna transfer anything here, so we'll
			// leave this as `0`.
			let value: ContractBalanceOf<T> = Default::default();

			// You'll have to play around with this depending on your contract. I don't recommend
			// hardcoding it but for demo purposes this'll do the trick
			let gas_limit: Weight = Weight::from_parts(1_000_000_000u64, u64::from(T::MaxCodeLen::get()) * 2);

			// Remember, we pulled this out from the `metadata.json` file.
			//
			// Again, probably shouldn't be hardcoded but :shrug:
			let mut selector: Vec<u8> = [0x00, 0x00, 0x00, 0x00].into();

			let mut data = Vec::new();
			data.append(&mut selector);
			data.append(&mut 1u32.encode());
			data.append(&mut 1u32.encode());

			let exec_result = pallet_contracts::Pallet::<T>::bare_call(
				who,
				dest,
				value,
				gas_limit,
				None,
				data,
				DebugInfo::UnsafeDebug, // DebugInfo::Skip,
				CollectEvents::UnsafeCollect, // CollectEvents::Skip,
				Determinism::Enforced,
			);
			log!(debug, "{:?}", exec_result);
			exec_result.result?;

			Ok(())
		}
	}

	impl<T: Config> Pallet<T> {
		pub(crate) fn ensure_pool_owner(
			who: &T::AccountId,
			pool_info: &PoolInfo<T::PoolId, T::AccountId, BalanceOf<T>, T::ImplId>,
		) -> DispatchResult {
			ensure!(who == &pool_info.owner, Error::<T>::NoPermission);

			Ok(())
		}

		pub(crate) fn ensure_job_beneficiary_or_depositor(
			who: &T::AccountId,
			job: &JobInfo<T::JobId, T::PolicyId, T::AccountId, BalanceOf<T>>,
		) -> DispatchResult {
			ensure!(who == &job.beneficiary || who == &job.depositor, Error::<T>::NoPermission);

			Ok(())
		}

		pub(crate) fn ensure_job_expired(
			job: &JobInfo<T::JobId, T::PolicyId, T::AccountId, BalanceOf<T>>,
			now: u64,
		) -> DispatchResult {
			// TODO: need deadline
			ensure!(job.expires_at < now, Error::<T>::JobStillValid);

			Ok(())
		}

		// Comment this because of difficulty reason,
		// we decide to let the `expires_at` be soft expiring
		// pub(crate) fn ensure_job_not_expired(
		// 	job: &JobInfo<T::JobId, T::PolicyId, T::AccountId, BalanceOf<T>>,
		// 	now: u64
		// ) -> DispatchResult {
		// 	ensure!(
		// 		job.expires_at >= now,
		// 		Error::<T>::JobExpired
		// 	);
		//
		// 	Ok(())
		// }

		pub(crate) fn ensure_worker_in_pool(
			pool_id: &T::PoolId,
			worker: &T::AccountId,
		) -> DispatchResult {
			ensure!(
				PoolAuthorizedWorkers::<T>::contains_key(worker, pool_id),
				Error::<T>::WorkerNotInThePool
			);

			Ok(())
		}

		pub(crate) fn ensure_subscribed_worker(
			pool_id: &T::PoolId,
			worker: &T::AccountId,
		) -> DispatchResult {
			ensure!(
				WorkerSubscribedPools::<T>::contains_key(worker, pool_id),
				Error::<T>::WorkerNotSubscribeThePool
			);

			Ok(())
		}

		pub(crate) fn ensure_job_assignee(
			job: &JobInfo<T::JobId, T::PolicyId, T::AccountId, BalanceOf<T>>,
			worker: &T::AccountId,
		) -> DispatchResult {
			let assignee = job.assignee.clone().ok_or(Error::<T>::NoPermission)?;

			ensure!(&assignee == worker, Error::<T>::NoPermission);

			Ok(())
		}
	}

	impl<T: Config> OffchainWorkerLifecycleHooks<T::AccountId, T::ImplId> for Pallet<T> {
		fn can_online(
			_worker: &T::AccountId,
			_payload: &OnlinePayload<T::ImplId>,
			_verified_attestation: &VerifiedAttestation,
		) -> DispatchResult {
			Ok(())
		}

		fn after_online(_worker: &T::AccountId) {
			// Nothing to do
		}

		fn can_offline(worker: &T::AccountId) -> bool {
			CounterForWorkerAssignedJobs::<T>::get(worker) == 0
		}

		fn after_unresponsive(_worker: &T::AccountId) {
			// Nothing to do
		}

		fn before_offline(worker: &T::AccountId, _reason: OfflineReason) {
			if CounterForWorkerAssignedJobs::<T>::get(worker) == 0 {
				return
			}

			for pool_id in WorkerSubscribedPools::<T>::iter_key_prefix(worker) {
				for job_id in
					WorkerAssignedJobs::<T>::iter_key_prefix((worker.clone(), pool_id.clone()))
				{
					let _: Result<(), DispatchError> = Jobs::<T>::try_mutate_exists(
						&pool_id,
						&job_id,
						|job| -> Result<(), DispatchError> {
							if let Some(job) = job.as_mut() {
								job.status = JobStatus::Discarded;
								job.ended_at =
									Some(T::UnixTime::now().as_secs().saturated_into::<u64>());

								Self::deposit_event(Event::JobStatusUpdated {
									pool_id: pool_id.clone(),
									job_id: job_id.clone(),
									status: JobStatus::Discarded,
								});
							}

							Ok(())
						},
					);
				}
			}

			CounterForWorkerAssignedJobs::<T>::insert(worker, 0);
		}

		fn after_refresh_attestation(
			_worker: &T::AccountId,
			_payload: &OnlinePayload<T::ImplId>,
			_verified_attestation: &VerifiedAttestation,
		) {
			// Nothing to do
		}

		fn after_requesting_offline(_worker: &T::AccountId) {
			// Nothing to do
		}

		fn can_deregister(_worker: &T::AccountId) -> bool {
			true
		}

		fn before_deregister(worker: &T::AccountId) {
			let worker_added_pools_count = CounterForWorkerAddedPools::<T>::get(worker);
			if worker_added_pools_count == 0 {
				return
			}

			let _ = WorkerSubscribedPools::<T>::clear_prefix(
				worker,
				T::MaxSubscribedPoolsPerWorker::get(),
				None,
			);
			let _ =
				PoolAuthorizedWorkers::<T>::clear_prefix(worker, worker_added_pools_count, None);
			CounterForWorkerSubscribedPools::<T>::remove(worker);
			CounterForWorkerAddedPools::<T>::remove(worker);
		}
	}
}
