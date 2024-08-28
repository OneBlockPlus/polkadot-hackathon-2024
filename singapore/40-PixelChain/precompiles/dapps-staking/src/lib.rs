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

use codec::{Decode, Encode};
use fp_evm::PrecompileHandle;
use frame_support::{
	dispatch::{Dispatchable, GetDispatchInfo, PostDispatchInfo},
	traits::{Currency, Get},
};
use pallet_dapps_staking::RewardDestination;
use pallet_evm::AddressMapping;
use precompile_utils::{error, prelude::*};
use sp_core::{ConstU32, H160, U256};
use sp_runtime::{traits::Zero, SaturatedConversion, Saturating};
use sp_std::{convert::TryInto, marker::PhantomData, vec::Vec};

type BalanceOf<Runtime> = <<Runtime as pallet_dapps_staking::Config>::Currency as Currency<
	<Runtime as frame_system::Config>::AccountId,
>>::Balance;

/// This is only used to encode SmartContract enum
#[derive(PartialEq, Eq, Copy, Clone, Encode, Decode, Debug)]
pub enum Contract<A> {
	/// EVM smart contract instance.
	Evm(H160),
	/// Wasm smart contract instance. Not used in this precompile
	Wasm(A),
}

pub struct DappsStakingPrecompile<Runtime>(PhantomData<Runtime>);

#[precompile_utils::precompile]
impl<Runtime> DappsStakingPrecompile<Runtime>
where
	Runtime: pallet_dapps_staking::Config + pallet_evm::Config,
	Runtime::AccountId: From<[u8; 32]>,
	Runtime::RuntimeCall: Dispatchable<PostInfo = PostDispatchInfo> + GetDispatchInfo,
	<Runtime::RuntimeCall as Dispatchable>::RuntimeOrigin: From<Option<Runtime::AccountId>>,
	Runtime::RuntimeCall: From<pallet_dapps_staking::Call<Runtime>>,
	BalanceOf<Runtime>: TryFrom<U256> + Into<U256> + EvmData,
{
	// Constants
	#[precompile::public("readCurrentEra()")]
	#[precompile::view]
	fn read_current_era(handle: &mut impl PrecompileHandle) -> EvmResult<u32> {
		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;

		let current_era = pallet_dapps_staking::CurrentEra::<Runtime>::get();

		Ok(current_era)
	}

	// Storage Getters
	#[precompile::public("readUnbondingPeriod()")]
	#[precompile::view]
	fn read_unbonding_period(handle: &mut impl PrecompileHandle) -> EvmResult<u32> {
		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;

		let unbonding_period = Runtime::UnbondingPeriod::get();

		Ok(unbonding_period)
	}

	#[precompile::public("readEraReward(uint32)")]
	#[precompile::view]
	fn read_era_reward(handle: &mut impl PrecompileHandle, era: u32) -> EvmResult<u128> {
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;

		// call pallet-dapps-staking
		let read_reward = pallet_dapps_staking::GeneralEraInfo::<Runtime>::get(era);
		let reward =
			read_reward.map_or(Zero::zero(), |r| r.rewards.stakers.saturating_add(r.rewards.dapps));

		Ok(reward.saturated_into())
	}

	#[precompile::public("readEraStaked(uint32)")]
	#[precompile::view]
	fn read_era_staked(handle: &mut impl PrecompileHandle, era: u32) -> EvmResult<u128> {
		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;
		// call pallet-dapps-staking
		let reward_and_stake = pallet_dapps_staking::GeneralEraInfo::<Runtime>::get(era);
		// compose output
		let staked = reward_and_stake.map_or(Zero::zero(), |r| r.staked);
		let staked = TryInto::<u128>::try_into(staked).unwrap_or(0);
		// Build output.
		Ok(staked)
	}

	#[precompile::public("readStakedAmount(bytes)")]
	#[precompile::view]
	fn read_staked_amount(
		handle: &mut impl PrecompileHandle,
		staker: BoundedBytes<ConstU32<32>>,
	) -> EvmResult<u128> {
		// Fetch info.
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;

		// parse input parameters for pallet-dapps-staking call
		let staker_vec: Vec<u8> = Vec::<u8>::from(staker);
		let staker = Self::parse_input_address(staker_vec)?;

		// call pallet-dapps-staking
		let ledger = pallet_dapps_staking::Ledger::<Runtime>::get(&staker);
		log::trace!(target: "ds-precompile", "read_staked_amount for account:{:?}, ledger.locked:{:?}", staker, ledger.locked);

		Ok(ledger.locked.saturated_into())
	}

	#[precompile::public("readStakedAmountOnContract(address,bytes)")]
	#[precompile::view]
	fn read_staked_amount_on_contract(
		handle: &mut impl PrecompileHandle,
		contract_h160: Address,
		staker: BoundedBytes<ConstU32<32>>,
	) -> EvmResult<u128> {
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;

		// parse contract address
		let contract_id = Self::decode_smart_contract(contract_h160)?;

		// parse input parameters for pallet-dapps-staking call
		let staker_vec: Vec<u8> = Vec::<u8>::from(staker);
		let staker = Self::parse_input_address(staker_vec)?;

		// call pallet-dapps-staking
		let staking_info =
			pallet_dapps_staking::GeneralStakerInfo::<Runtime>::get(&staker, &contract_id);
		let staked_amount = staking_info.latest_staked_value();
		log::trace!(target: "ds-precompile", "read_staked_amount_on_contract for account:{:?}, contract: {:?} => staked_amount:{:?}", staker, contract_id, staked_amount);

		Ok(staked_amount.saturated_into())
	}

	#[precompile::public("readContractStake(address)")]
	#[precompile::view]
	fn read_contract_stake(
		handle: &mut impl PrecompileHandle,
		contract_h160: Address,
	) -> EvmResult<u128> {
		handle.record_cost(RuntimeHelper::<Runtime>::db_read_gas_cost())?;

		let contract_id = Self::decode_smart_contract(contract_h160)?;
		let current_era = pallet_dapps_staking::CurrentEra::<Runtime>::get();

		// call pallet-dapps-staking
		let staking_info =
			pallet_dapps_staking::Pallet::<Runtime>::contract_stake_info(&contract_id, current_era)
				.unwrap_or_default();

		// encode output with total
		let total = TryInto::<u128>::try_into(staking_info.total).unwrap_or(0);

		Ok(total)
	}

	#[precompile::public("bondAndStake(address,uint256)")]
	fn bond_and_stake(
		handle: &mut impl PrecompileHandle,
		contract_h160: Address,
		value: U256,
	) -> EvmResult {
		let contract_id = Self::decode_smart_contract(contract_h160)?;
		let value = Self::u256_to_amount(value).in_field("value")?;
		log::trace!(target: "ds-precompile", "bond_and_stake {:?}, {:?}", contract_id, value);

		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_dapps_staking::Call::<Runtime>::bond_and_stake { contract_id, value };

		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	// Runtime Methods (dispatchables)

	#[precompile::public("unbondAndUnstake(address,uint256)")]
	fn unbond_and_unstake(
		handle: &mut impl PrecompileHandle,
		contract_h160: Address,
		value: U256,
	) -> EvmResult {
		let contract_id = Self::decode_smart_contract(contract_h160)?;
		let value = Self::u256_to_amount(value).in_field("value")?;

		log::trace!(target: "ds-precompile", "unbond_and_unstake {:?}, {:?}", contract_id, value);

		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_dapps_staking::Call::<Runtime>::unbond_and_unstake { contract_id, value };

		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("withdrawUnbonded()")]
	fn withdraw_unbonded(handle: &mut impl PrecompileHandle) -> EvmResult {
		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_dapps_staking::Call::<Runtime>::withdraw_unbonded {};

		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("claimDapp(address,uint32)")]
	fn claim_dapp(
		handle: &mut impl PrecompileHandle,
		contract_h160: Address,
		era: u32,
	) -> EvmResult {
		let contract_id = Self::decode_smart_contract(contract_h160)?;

		log::trace!(target: "ds-precompile", "claim_dapp {:?}, era {:?}", contract_id, era);

		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_dapps_staking::Call::<Runtime>::claim_dapp { contract_id, era };

		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("claimStaker(address)")]
	fn claim_staker(handle: &mut impl PrecompileHandle, contract_h160: Address) -> EvmResult {
		let contract_id = Self::decode_smart_contract(contract_h160)?;
		log::trace!(target: "ds-precompile", "claim_staker {:?}", contract_id);

		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_dapps_staking::Call::<Runtime>::claim_staker { contract_id };

		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("setRewardDestination(uint8)")]
	fn set_reward_destination(
		handle: &mut impl PrecompileHandle,
		reward_destination_raw: u8,
	) -> EvmResult {
		// Transform raw value into dapps staking enum
		let reward_destination = if reward_destination_raw == 0 {
			RewardDestination::FreeBalance
		} else if reward_destination_raw == 1 {
			RewardDestination::StakeBalance
		} else {
			return Err(error("Unexpected reward destination value."));
		};

		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		log::trace!(target: "ds-precompile", "set_reward_destination {:?} {:?}", origin, reward_destination);

		let call =
			pallet_dapps_staking::Call::<Runtime>::set_reward_destination { reward_destination };

		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	#[precompile::public("withdrawFromUnregistered(address)")]
	fn withdraw_from_unregistered(
		handle: &mut impl PrecompileHandle,
		contract_h160: Address,
	) -> EvmResult {
		// Build call with origin.
		let contract_id = Self::decode_smart_contract(contract_h160)?;
		log::trace!(target: "ds-precompile", "withdraw_from_unregistered {:?}", contract_id);

		// Build call with origin.
		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call =
			pallet_dapps_staking::Call::<Runtime>::withdraw_from_unregistered { contract_id };

		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
	}

	/// Claim rewards for the contract in the dapps-staking pallet
	#[precompile::public("nominationTransfer(address,uint256,address)")]
	fn nomination_transfer(
		handle: &mut impl PrecompileHandle,
		origin_contract_h160: Address,
		value: U256,
		target_contract_h160: Address,
	) -> EvmResult {
		// Build call with origin.
		let origin_contract_id = Self::decode_smart_contract(origin_contract_h160)?;
		let value = Self::u256_to_amount(value).in_field("value")?;
		let target_contract_id = Self::decode_smart_contract(target_contract_h160)?;

		log::trace!(target: "ds-precompile", "nomination_transfer {:?} {:?} {:?}", origin_contract_id, value, target_contract_id);

		let origin = Runtime::AddressMapping::into_account_id(handle.context().caller);
		let call = pallet_dapps_staking::Call::<Runtime>::nomination_transfer {
			origin_contract_id,
			value,
			target_contract_id,
		};

		RuntimeHelper::<Runtime>::try_dispatch(handle, Some(origin).into(), call)?;

		Ok(())
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

	/// Helper method to decode type SmartContract enum
	pub fn decode_smart_contract(
		contract_address: Address,
	) -> EvmResult<<Runtime as pallet_dapps_staking::Config>::SmartContract> {
		// Encode contract address to fit SmartContract enum.
		// Since the SmartContract enum type can't be accessed from this pecompile,
		// use locally defined enum clone (see Contract enum)
		let contract_enum_encoded = Contract::<H160>::Evm(contract_address.0).encode();

		// encoded enum will add one byte before the contract's address
		// therefore we need to decode len(H160) + 1 byte = 21
		let smart_contract = <Runtime as pallet_dapps_staking::Config>::SmartContract::decode(
			&mut &contract_enum_encoded[..21],
		)
		.map_err(|_| revert("Error while decoding SmartContract"))?;

		Ok(smart_contract)
	}
}
