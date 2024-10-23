#![cfg_attr(not(feature = "std"), no_std)]

use codec::{Decode, Encode, EncodeLike, MaxEncodedLen};
use frame_support::pallet_prelude::{DispatchError, DispatchResult};
use frame_support::traits::ConstU32;
use frame_support::BoundedVec;
use sp_runtime::RuntimeDebug;
use scale_info::TypeInfo;
use serde::{Deserialize, Serialize};
use sp_runtime::Vec;

pub trait RiskManagerTrait<PoolId, AccountId, AssetId, AssetBalance> {
    fn get_health_factor(pool_id: PoolId, account: &AccountId) -> Result<AssetBalance, DispatchError>;
    fn is_liquidatable(pool_id: PoolId, account: &AccountId) -> bool;
    fn is_position_healthy(pool_id: PoolId, account: &AccountId) -> bool;
    fn can_mint(who: &AccountId, pool_id: PoolId, amount: AssetBalance) -> bool;
    fn get_pool_parameters(pool_id: PoolId) -> Result<PoolParams<AssetId, AssetBalance>, DispatchError>;
    fn get_collateral_params(pool_id: PoolId, asset_id: AssetId) -> Result<CollateralParams, DispatchError>;
}

pub trait ReserveTrait<PoolId, AccountId, AssetId, AssetBalance, Price> {
    fn get_collateral_index(pool_id: PoolId, asset_id: AssetId) -> u16;
    fn add_collateral_asset(pool_id: PoolId, asset_id: AssetId) -> DispatchResult;
    fn get_user_position(pool_id: PoolId, account: AccountId) -> Vec<UserCollateralData<AssetId, AssetBalance, Price>>;
}

pub trait PoolsTrait<AccountId, PoolId, AssetBalance> {
    fn prepare_liquidation(
        liquidator: AccountId,
        account: AccountId,
        pool_id: PoolId,
        debt_amount: AssetBalance,
    ) -> DispatchResult;

    fn create_pool(
        name: Vec<u8>,
        symbol: Vec<u8>,
    ) -> DispatchResult;

    fn get_total_pools() -> PoolId;
}

pub trait OracleTrait<AssetId, Price> {
    fn get_price(asset_id: AssetId) -> Option<Price>;
}

pub trait AssetMetadataTrait<Origin, AssetId> {
    fn set_metadata(origin: Origin, id: AssetId, name: Vec<u8>, symbol: Vec<u8>, decimals: u8) -> DispatchResult;
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, MaxEncodedLen, RuntimeDebug, Default, TypeInfo, Serialize, Deserialize)]
pub struct CollateralParams {
    pub is_enabled: bool,
    pub max_ceiling: u128,
    pub base_ltv: u16,
    pub liquidation_threshold: u16,
    pub liquidation_penalty: u16,
    pub liquidation_fee: u16,
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, MaxEncodedLen, RuntimeDebug, Default, TypeInfo, Serialize, Deserialize)]
pub struct PoolParams<AssetId, Balance> {
    pub is_enabled: bool,
    pub synthetic_asset: AssetId,
    pub debt_ceiling: Balance,
    pub is_minting_allowed: bool,
    pub is_burning_allowed: bool,
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, MaxEncodedLen, RuntimeDebug, Default, TypeInfo, Serialize, Deserialize)]
pub struct GlobalRiskParams<Balance> {
    pub global_debt_ceiling: Balance,
    pub min_health_factor: Balance,
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, MaxEncodedLen, RuntimeDebug, Default, TypeInfo, Serialize, Deserialize)]
pub struct UserPosition<Balance> {
    pub debt: Balance,
    pub collateral: Balance,
    pub collateral_base: Balance,
    pub collateral_liq: Balance,
}

// UI Data
#[derive(Clone, Encode, Decode, Eq, PartialEq, MaxEncodedLen, RuntimeDebug, Default, TypeInfo, Serialize, Deserialize)]
pub struct UserCollateralData<AssetId, Balance, Price> {
    pub asset: AssetMetadata<AssetId, Price>,
    pub balance: Balance,
    pub params: CollateralParams,
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, MaxEncodedLen, RuntimeDebug, Default, TypeInfo, Serialize, Deserialize)]
pub struct AssetMetadata<AssetId, Price> {
    pub id: AssetId,
    pub name: BoundedVec<u8, ConstU32<32>>,    // Bounded to 32 bytes
    pub symbol: BoundedVec<u8, ConstU32<10>>,  // Bounded to 10 bytes
    pub decimals: u8,
    pub price: Price,
}

#[derive(Clone, Encode, Decode, Eq, PartialEq, MaxEncodedLen, RuntimeDebug, Default, TypeInfo, Serialize, Deserialize)]
pub struct UserPoolData<AssetId, Balance, PoolId, Price> {
    pub id: PoolId,
    pub debt_amount: Balance,
    pub synthetic_asset: AssetMetadata<AssetId, Price>,
    pub params: PoolParams<AssetId, Balance>,
}