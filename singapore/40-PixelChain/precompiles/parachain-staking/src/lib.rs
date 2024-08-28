// This file is part of Diora.

// Copyright (C) 2019-2022 Diora-Network.
// SPDX-License-Identifier: GPL-3.0-or-later WITH Classpath-exception-2.0

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
// GNU General Public License for more details.

// You should have received a copy of the GNU General Public License
// along with this program. If not, see <https://www.gnu.org/licenses/>.

//! Precompile to call parachain-staking runtime methods via the EVM

#![cfg_attr(not(feature = "std"), no_std)]

use codec::Encode;
use fp_evm::PrecompileHandle;
use frame_support::{
	dispatch::{Dispatchable, GetDispatchInfo, PostDispatchInfo},
	sp_runtime::Percent,
	traits::{Currency, Get},
};
use pallet_evm::AddressMapping;
use precompile_utils::prelude::*;
use sp_core::{ConstU32, H256, U256};
use sp_std::{convert::TryInto, marker::PhantomData, vec::Vec};

type BalanceOf<Runtime> = <<Runtime as pallet_parachain_staking::Config>::Currency as Currency<
	<Runtime as frame_system::Config>::AccountId,
>>::Balance;

/// A precompile to wrap the functionality from parachain_staking.
///
/// EXAMPLE USECASE:
/// A simple example usecase is a contract that allows donors to donate, and stakes all the funds
/// toward one fixed address chosen by the deployer.
/// Such a contract could be deployed by a collator candidate, and the deploy address distributed to
/// supporters who want to donate toward a perpetual nomination fund.
pub struct ParachainStakingPrecompile<Runtime>(PhantomData<Runtime>);

#[precompile_utils::precompile]
impl<Runtime> ParachainStakingPrecompile<Runtime>
where
	Runtime: pallet_parachain_staking::Config + pallet_evm::Config,
	Runtime::AccountId: From<[u8; 32]>,
	Runtime::RuntimeCall: Dispatchable<PostInfo = PostDispatchInfo> + GetDispatchInfo,
	<Runtime::RuntimeCall as Dispatchable>::RuntimeOrigin: From<Option<Runtime::AccountId>>,
	Runtime::RuntimeCall: From<pallet_parachain_staking::Call<Runtime>>,
	BalanceOf<Runtime>: TryFrom<U256> + Into<U256> + EvmData,
{
	// Constants
	#[precompile::public("minDelegation()")]
	#[precompile::public("min_delegation()")]
	#[precompile::view]
	fn min_delegation(handle: &mut impl PrecompileHandle) -> EvmResult<u128> {
		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;
		let min_nomination: u128 =
			<<Runtime as pallet_parachain_staking::Config>::MinDelegation as Get<
				BalanceOf<Runtime>,
			>>::get()
			.try_into()
			.map_err(|_| revert("Amount is too large for provided balance type"))?;

		Ok(min_nomination)
	}

	// Storage Getters
	#[precompile::public("points(uint32)")]
	#[precompile::view]
	fn points(handle: &mut impl PrecompileHandle, round: u32) -> EvmResult<u32> {
		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;
		let points: u32 = pallet_parachain_staking::Pallet::<Runtime>::points(round);

		Ok(points)
	}

	/// Points for each collator per round
	#[precompile::public("awardedPoints(uint32,bytes32)")]
	#[precompile::view]
	fn awarded_points(
		handle: &mut impl PrecompileHandle,
		round: u32,
		candidate: H256,
	) -> EvmResult<u32> {
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;

		let candidate = Runtime::AccountId::from(candidate.0);
		let points = <pallet_parachain_staking::Pallet<Runtime>>::awarded_pts(&round, &candidate);

		Ok(points)
	}

	#[precompile::public("candidateCount()")]
	#[precompile::public("candidate_count()")]
	#[precompile::view]
	fn candidate_count(handle: &mut impl PrecompileHandle) -> EvmResult<u32> {
		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;
		let candidate_count: u32 =
			<pallet_parachain_staking::Pallet<Runtime>>::candidate_pool().0.len() as u32;

		// Build output.
		Ok(candidate_count)
	}

	#[precompile::public("round()")]
	#[precompile::view]
	fn round(handle: &mut impl PrecompileHandle) -> EvmResult<u32> {
		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;
		let round: u32 = <pallet_parachain_staking::Pallet<Runtime>>::round().current;

		Ok(round)
	}

	// Query candidate delegation_count
	#[precompile::public("candidateDelegationCount(bytes32)")]
	#[precompile::public("candidate_delegation_count(bytes32)")]
	#[precompile::view]
	fn candidate_delegation_count(
		handle: &mut impl PrecompileHandle,
		candidate: H256,
	) -> EvmResult<u32> {
		let candidate = Runtime::AccountId::from(candidate.0);

		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;
		let result = if let Some(state) =
			<pallet_parachain_staking::Pallet<Runtime>>::candidate_info(&candidate)
		{
			let candidate_delegation_count: u32 = state.delegation_count;

			log::trace!(
				target: "staking-precompile",
				"Result from pallet is {:?}",
				candidate_delegation_count
			);
			candidate_delegation_count
		} else {
			log::trace!(
				target: "staking-precompile",
				"Candidate {:?} not found, so delegation count is 0",
				candidate
			);
			0u32
		};

		Ok(result)
	}

	// Query candidate auto_compounding_delegations_count
	#[precompile::public("candidateAutoCompoundingDelegationCount(bytes32)")]
	#[precompile::view]
	fn candidate_auto_compounding_delegation_count(
		handle: &mut impl PrecompileHandle,
		candidate: H256,
	) -> EvmResult<u32> {
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;

		let candidate = Runtime::AccountId::from(candidate.0);

		let count =
			<pallet_parachain_staking::Pallet<Runtime>>::auto_compounding_delegations(&candidate)
				.len() as u32;

		Ok(count)
	}

	// Query delegator delegate count
	// 20 / 32 bytes
	#[precompile::public("delegatorDelegationCount(bytes)")]
	#[precompile::public("delegator_delegation_count(bytes)")]
	#[precompile::view]
	fn delegator_delegation_count(
		handle: &mut impl PrecompileHandle,
		delegator: BoundedBytes<ConstU32<32>>,
	) -> EvmResult<u32> {
		let delegator_vec: Vec<u8> = Vec::<u8>::from(delegator);
		let delegator = Self::parse_input_address(delegator_vec)?;
		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;
		let result = if let Some(state) =
			<pallet_parachain_staking::Pallet<Runtime>>::delegator_state(&delegator)
		{
			let delegator_delegation_count: u32 = state.delegations.0.len() as u32;

			log::trace!(
				target: "staking-precompile",
				"Result from pallet is {:?}",
				delegator_delegation_count
			);

			delegator_delegation_count
		} else {
			log::trace!(
				target: "staking-precompile",
				"Delegator {:?} not found, so delegation count is 0",
				delegator
			);
			0u32
		};

		Ok(result)
	}

	// Query all candidates
	#[precompile::public("selectedCandidates()")]
	#[precompile::public("selected_candidates()")]
	#[precompile::view]
	fn selected_candidates(handle: &mut impl PrecompileHandle) -> EvmResult<Vec<H256>> {
		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;
		let selected_candidates: Vec<H256> =
			pallet_parachain_staking::Pallet::<Runtime>::selected_candidates()
				.into_iter()
				.map(|account_id| H256::from_slice(&account_id.encode()[..]))
				.collect();

		Ok(selected_candidates)
	}

	// Query delegator delegate amount for candidate
	#[precompile::public("delegationAmount(bytes,bytes32)")]
	#[precompile::view]
	fn delegation_amount(
		handle: &mut impl PrecompileHandle,
		delegator: BoundedBytes<ConstU32<32>>,
		candidate: H256,
	) -> EvmResult<U256> {
		let delegator_vec: Vec<u8> = Vec::<u8>::from(delegator);
		let delegator = Self::parse_input_address(delegator_vec)?;
		let candidate = Runtime::AccountId::from(candidate.0);
		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;
		let amount = pallet_parachain_staking::Pallet::<Runtime>::delegator_state(&delegator)
			.and_then(|state| state.delegations.0.into_iter().find(|b| b.owner == candidate))
			.map_or(U256::zero(), |pallet_parachain_staking::Bond { amount, .. }| amount.into());

		Ok(amount)
	}

	// Role Verifiers
	#[precompile::public("isInTopDelegations(bytes,bytes32)")]
	#[precompile::view]
	fn is_in_top_delegations(
		handle: &mut impl PrecompileHandle,
		delegator: BoundedBytes<ConstU32<32>>,
		candidate: H256,
	) -> EvmResult<bool> {
		let delegator_vec: Vec<u8> = Vec::<u8>::from(delegator);
		let delegator = Self::parse_input_address(delegator_vec)?;
		let candidate = Runtime::AccountId::from(candidate.0);

		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;
		let is_in_top_delegations =
			pallet_parachain_staking::Pallet::<Runtime>::top_delegations(&candidate)
				.map_or(false, |delegations| {
					delegations.delegations.into_iter().any(|b| b.owner == delegator)
				});

		Ok(is_in_top_delegations)
	}

	// Query is_delegator
	#[precompile::public("isDelegator(bytes)")]
	#[precompile::public("is_delegator(bytes)")]
	#[precompile::view]
	fn is_delegator(
		handle: &mut impl PrecompileHandle,
		delegator: BoundedBytes<ConstU32<32>>,
	) -> EvmResult<bool> {
		let delegator_vec: Vec<u8> = Vec::<u8>::from(delegator);
		let delegator = Self::parse_input_address(delegator_vec)?;

		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;
		let is_delegator = pallet_parachain_staking::Pallet::<Runtime>::is_delegator(&delegator);

		Ok(is_delegator)
	}

	#[precompile::public("isCandidate(bytes32)")]
	#[precompile::public("is_candidate(bytes32)")]
	#[precompile::view]
	fn is_candidate(handle: &mut impl PrecompileHandle, candidate: H256) -> EvmResult<bool> {
		let candidate = Runtime::AccountId::from(candidate.0);

		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;
		let is_candidate = pallet_parachain_staking::Pallet::<Runtime>::is_candidate(&candidate);

		Ok(is_candidate)
	}

	#[precompile::public("isSelectedCandidate(bytes32)")]
	#[precompile::public("is_selected_candidate(bytes32)")]
	#[precompile::view]
	fn is_selected_candidate(
		handle: &mut impl PrecompileHandle,
		candidate: H256,
	) -> EvmResult<bool> {
		let candidate = Runtime::AccountId::from(candidate.0);
		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;
		let is_selected =
			pallet_parachain_staking::Pallet::<Runtime>::is_selected_candidate(&candidate);

		Ok(is_selected)
	}

	#[precompile::public("delegationRequestIsPending(bytes,bytes32)")]
	#[precompile::public("delegation_request_is_pending(bytes,bytes32)")]
	#[precompile::view]
	fn delegation_request_is_pending(
		handle: &mut impl PrecompileHandle,
		delegator: BoundedBytes<ConstU32<32>>,
		candidate: H256,
	) -> EvmResult<bool> {
		let delegator_vec: Vec<u8> = Vec::<u8>::from(delegator);
		let delegator = Self::parse_input_address(delegator_vec)?;
		let candidate = Runtime::AccountId::from(candidate.0);
		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;

		// If we are not able to get delegator state, we return false
		// Users can call `is_delegator` to determine when this happens
		let pending = <pallet_parachain_staking::Pallet<Runtime>>::delegation_request_exists(
			&candidate, &delegator,
		);

		Ok(pending)
	}

	#[precompile::public("candidateExitIsPending(bytes32)")]
	#[precompile::public("candidate_exit_is_pending(bytes32)")]
	#[precompile::view]
	fn candidate_exit_is_pending(
		handle: &mut impl PrecompileHandle,
		candidate: H256,
	) -> EvmResult<bool> {
		let candidate = Runtime::AccountId::from(candidate.0);

		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;

		// If we are not able to get delegator state, we return false
		// Users can call `is_candidate` to determine when this happens
		let pending = if let Some(state) =
			<pallet_parachain_staking::Pallet<Runtime>>::candidate_info(&candidate)
		{
			state.is_leaving()
		} else {
			log::trace!(
				target: "staking-precompile",
				"Candidate state for {:?} not found, so pending exit is false",
				candidate
			);
			false
		};

		Ok(pending)
	}

	#[precompile::public("candidateRequestIsPending(bytes32)")]
	#[precompile::public("candidate_request_is_pending(bytes32)")]
	#[precompile::view]
	fn candidate_request_is_pending(
		handle: &mut impl PrecompileHandle,
		candidate: H256,
	) -> EvmResult<bool> {
		let candidate = Runtime::AccountId::from(candidate.0);
		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;

		// If we are not able to get candidate metadata, we return false
		// Users can call `is_candidate` to determine when this happens
		let pending = if let Some(state) =
			<pallet_parachain_staking::Pallet<Runtime>>::candidate_info(&candidate)
		{
			state.request.is_some()
		} else {
			log::trace!(
				target: "staking-precompile",
				"Candidate metadata for {:?} not found, so pending request is false",
				candidate
			);
			false
		};

		Ok(pending)
	}

	#[precompile::public("delegationAutoCompound(bytes,bytes32)")]
	#[precompile::view]
	fn delegation_auto_compound(
		handle: &mut impl PrecompileHandle,
		delegator: BoundedBytes<ConstU32<32>>,
		candidate: H256,
	) -> EvmResult<u8> {
		let delegator_vec: Vec<u8> = Vec::<u8>::from(delegator);
		let delegator = Self::parse_input_address(delegator_vec)?;
		let candidate = Runtime::AccountId::from(candidate.0);
		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;

		let value = <pallet_parachain_staking::Pallet<Runtime>>::delegation_auto_compound(
			&candidate, &delegator,
		);

		Ok(value.deconstruct())
	}

	// Runtime Methods (dispatchables)

	#[precompile::public("joinCandidates(uint256,uint32)")]
	#[precompile::public("join_candidates(uint256,uint32)")]
	fn join_candidates(
		handle: &mut impl PrecompileHandle,
		amount: U256,
		candidate_count: u32,
	) -> EvmResult {
		let amount = Self::u256_to_amount(amount).in_field("amount")?;

		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_parachain_staking::Call::<Runtime>::join_candidates {
			bond: amount,
			candidate_count,
		};

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("scheduleLeaveCandidates(uint32)")]
	#[precompile::public("schedule_leave_candidates(uint32)")]
	fn schedule_leave_candidates(
		handle: &mut impl PrecompileHandle,
		candidate_count: u32,
	) -> EvmResult {
		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_parachain_staking::Call::<Runtime>::schedule_leave_candidates {
			candidate_count,
		};

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("executeLeaveCandidates(bytes32,uint32)")]
	#[precompile::public("execute_leave_candidates(bytes32,uint32)")]
	fn execute_leave_candidates(
		handle: &mut impl PrecompileHandle,
		candidate: H256,
		candidate_count: u32,
	) -> EvmResult {
		let candidate = Runtime::AccountId::from(candidate.0);

		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_parachain_staking::Call::<Runtime>::execute_leave_candidates {
			candidate,
			candidate_delegation_count: candidate_count,
		};

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("cancelLeaveCandidates(uint32)")]
	#[precompile::public("cancel_leave_candidates(uint32)")]
	fn cancel_leave_candidates(
		handle: &mut impl PrecompileHandle,
		candidate_count: u32,
	) -> EvmResult {
		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call =
			pallet_parachain_staking::Call::<Runtime>::cancel_leave_candidates { candidate_count };

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("goOffline()")]
	#[precompile::public("go_offline()")]
	fn go_offline(handle: &mut impl PrecompileHandle) -> EvmResult {
		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_parachain_staking::Call::<Runtime>::go_offline {};

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("goOnline()")]
	#[precompile::public("go_online()")]
	fn go_online(handle: &mut impl PrecompileHandle) -> EvmResult {
		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_parachain_staking::Call::<Runtime>::go_online {};

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("candidateBondMore(uint256)")]
	#[precompile::public("candidate_bond_more(uint256)")]
	fn candidate_bond_more(handle: &mut impl PrecompileHandle, more: U256) -> EvmResult {
		let more = Self::u256_to_amount(more).in_field("more")?;

		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_parachain_staking::Call::<Runtime>::candidate_bond_more { more };

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("scheduleCandidateBondLess(uint256)")]
	#[precompile::public("schedule_candidate_bond_less(uint256)")]
	fn schedule_candidate_bond_less(handle: &mut impl PrecompileHandle, less: U256) -> EvmResult {
		let less = Self::u256_to_amount(less).in_field("less")?;

		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_parachain_staking::Call::<Runtime>::schedule_candidate_bond_less { less };

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("executeCandidateBondLess(bytes32)")]
	#[precompile::public("execute_candidate_bond_less(bytes32)")]
	fn execute_candidate_bond_less(
		handle: &mut impl PrecompileHandle,
		candidate: H256,
	) -> EvmResult {
		let candidate = Runtime::AccountId::from(candidate.0);
		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call =
			pallet_parachain_staking::Call::<Runtime>::execute_candidate_bond_less { candidate };

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("cancelCandidateBondLess()")]
	#[precompile::public("cancel_candidate_bond_less()")]
	fn cancel_candidate_bond_less(handle: &mut impl PrecompileHandle) -> EvmResult {
		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_parachain_staking::Call::<Runtime>::cancel_candidate_bond_less {};

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("delegate(bytes32,uint256,uint32,uint32)")]
	fn delegate(
		handle: &mut impl PrecompileHandle,
		candidate: H256,
		amount: U256,
		candidate_delegation_count: u32,
		delegator_delegation_count: u32,
	) -> EvmResult {
		let amount = Self::u256_to_amount(amount).in_field("amount")?;
		let candidate = Runtime::AccountId::from(candidate.0);

		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_parachain_staking::Call::<Runtime>::delegate {
			candidate,
			amount,
			candidate_delegation_count,
			delegation_count: delegator_delegation_count,
		};

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("delegateWithAutoCompound(bytes32,uint256,uint8,uint32,uint32,uint32)")]
	fn delegate_with_auto_compound(
		handle: &mut impl PrecompileHandle,
		candidate: H256,
		amount: U256,
		auto_compound: u8,
		candidate_delegation_count: u32,
		candidate_auto_compounding_delegation_count: u32,
		delegator_delegation_count: u32,
	) -> EvmResult {
		if auto_compound > 100 {
			return Err(RevertReason::custom("Must be an integer between 0 and 100 included")
				.in_field("auto_compound")
				.into());
		}

		let amount = Self::u256_to_amount(amount).in_field("amount")?;
		let auto_compound = Percent::from_percent(auto_compound);

		let candidate = Runtime::AccountId::from(candidate.0);
		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_parachain_staking::Call::<Runtime>::delegate_with_auto_compound {
			candidate,
			amount,
			auto_compound,
			candidate_delegation_count,
			candidate_auto_compounding_delegation_count,
			delegation_count: delegator_delegation_count,
		};

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	/// Deprecated in favor of batch util
	#[precompile::public("scheduleLeaveDelegators()")]
	#[precompile::public("schedule_leave_delegators()")]
	fn schedule_leave_delegators(handle: &mut impl PrecompileHandle) -> EvmResult {
		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_parachain_staking::Call::<Runtime>::schedule_leave_delegators {};

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	/// Deprecated in favor of batch util
	#[precompile::public("executeLeaveDelegators(bytes,uint32)")]
	#[precompile::public("execute_leave_delegators(bytes,uint32)")]
	fn execute_leave_delegators(
		handle: &mut impl PrecompileHandle,
		delegator: BoundedBytes<ConstU32<32>>,
		delegator_delegation_count: u32,
	) -> EvmResult {
		let delegator_vec: Vec<u8> = Vec::<u8>::from(delegator);
		let delegator = Self::parse_input_address(delegator_vec)?;
		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_parachain_staking::Call::<Runtime>::execute_leave_delegators {
			delegator,
			delegation_count: delegator_delegation_count,
		};

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	/// Deprecated in favor of batch util
	#[precompile::public("cancelLeaveDelegators()")]
	#[precompile::public("cancel_leave_delegators()")]
	fn cancel_leave_delegators(handle: &mut impl PrecompileHandle) -> EvmResult {
		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_parachain_staking::Call::<Runtime>::cancel_leave_delegators {};

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("scheduleRevokeDelegation(bytes32)")]
	#[precompile::public("schedule_revoke_delegation(bytes32)")]
	fn schedule_revoke_delegation(
		handle: &mut impl PrecompileHandle,
		candidate: H256,
	) -> EvmResult {
		let candidate = Runtime::AccountId::from(candidate.0);

		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_parachain_staking::Call::<Runtime>::schedule_revoke_delegation {
			collator: candidate,
		};

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("delegatorBondMore(bytes32,uint256)")]
	#[precompile::public("delegator_bond_more(bytes32,uint256)")]
	fn delegator_bond_more(
		handle: &mut impl PrecompileHandle,
		candidate: H256,
		more: U256,
	) -> EvmResult {
		let candidate = Runtime::AccountId::from(candidate.0);
		let more = Self::u256_to_amount(more).in_field("more")?;

		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call =
			pallet_parachain_staking::Call::<Runtime>::delegator_bond_more { candidate, more };

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("scheduleDelegatorBondLess(bytes32,uint256)")]
	#[precompile::public("schedule_delegator_bond_less(bytes32,uint256)")]
	fn schedule_delegator_bond_less(
		handle: &mut impl PrecompileHandle,
		candidate: H256,
		less: U256,
	) -> EvmResult {
		let candidate = Runtime::AccountId::from(candidate.0);
		let less = Self::u256_to_amount(less).in_field("less")?;

		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_parachain_staking::Call::<Runtime>::schedule_delegator_bond_less {
			candidate,
			less,
		};

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("executeDelegationRequest(bytes,bytes32)")]
	#[precompile::public("execute_delegation_request(bytes,bytes32)")]
	fn execute_delegation_request(
		handle: &mut impl PrecompileHandle,
		delegator: BoundedBytes<ConstU32<32>>,
		candidate: H256,
	) -> EvmResult {
		let delegator_vec: Vec<u8> = Vec::<u8>::from(delegator);
		let delegator = Self::parse_input_address(delegator_vec)?;
		let candidate = Runtime::AccountId::from(candidate.0);
		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_parachain_staking::Call::<Runtime>::execute_delegation_request {
			delegator,
			candidate,
		};

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("cancelDelegationRequest(bytes32)")]
	#[precompile::public("cancel_delegation_request(bytes32)")]
	fn cancel_delegation_request(handle: &mut impl PrecompileHandle, candidate: H256) -> EvmResult {
		let candidate = Runtime::AccountId::from(candidate.0);
		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call =
			pallet_parachain_staking::Call::<Runtime>::cancel_delegation_request { candidate };

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("setAutoCompound(bytes32,uint8,uint32,uint32)")]
	fn set_auto_compound(
		handle: &mut impl PrecompileHandle,
		candidate: H256,
		value: u8,
		candidate_auto_compounding_delegation_count_hint: u32,
		delegation_count_hint: u32,
	) -> EvmResult {
		if value > 100 {
			return Err(RevertReason::custom("Must be an integer between 0 and 100 included")
				.in_field("value")
				.into());
		}

		let value = Percent::from_percent(value);
		let candidate = Runtime::AccountId::from(candidate.0);
		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_parachain_staking::Call::<Runtime>::set_auto_compound {
			candidate,
			value,
			candidate_auto_compounding_delegation_count_hint,
			delegation_count_hint,
		};

		// Dispatch call (if enough gas).
		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("getDelegatorTotalStaked(bytes)")]
	#[precompile::view]
	fn get_delegator_total_staked(
		handle: &mut impl PrecompileHandle,
		delegator: BoundedBytes<ConstU32<32>>,
	) -> EvmResult<U256> {
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;

		let delegator_vec: Vec<u8> = Vec::<u8>::from(delegator);
		let delegator = Self::parse_input_address(delegator_vec)?;

		let amount = <pallet_parachain_staking::Pallet<Runtime>>::delegator_state(&delegator)
			.map(|state| state.total)
			.unwrap_or_default();

		Ok(amount.into())
	}

	#[precompile::public("getCandidateTotalCounted(bytes32)")]
	#[precompile::view]
	fn get_candidate_total_counted(
		handle: &mut impl PrecompileHandle,
		candidate: H256,
	) -> EvmResult<U256> {
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;

		let candidate = Runtime::AccountId::from(candidate.0);

		let amount = <pallet_parachain_staking::Pallet<Runtime>>::candidate_info(&candidate)
			.map(|state| state.total_counted)
			.unwrap_or_default();

		Ok(amount.into())
	}

	fn u256_to_amount(value: U256) -> MayRevert<BalanceOf<Runtime>> {
		value
			.try_into()
			.map_err(|_| RevertReason::value_is_too_large("balance type").into())
	}

	/// Helper method to parse H160 or SS58 address
	fn parse_input_address(staker_vec: Vec<u8>) -> EvmResult<Runtime::AccountId> {
		let staker: Runtime::AccountId = match staker_vec.len() {
			// public address of the ss58 account has 32 bytes
			32 => {
				let mut staker_bytes = [0_u8; 32];
				staker_bytes[..].clone_from_slice(&staker_vec[0..32]);

				staker_bytes.into()
			},
			// public address of the H160 account has 20 bytes
			20 => {
				let mut staker_bytes = [0_u8; 20];
				staker_bytes[..].clone_from_slice(&staker_vec[0..20]);

				Runtime::AddressMapping::into_account_id(staker_bytes.into())
			},
			_ => {
				// Return err if account length is wrong
				return Err(revert("Error while parsing staker's address"));
			},
		};

		Ok(staker)
	}
}
