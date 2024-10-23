#![cfg_attr(not(feature = "std"), no_std)]
use frame_support::pallet_macros::import_section;

// extern crate alloc;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

pub use log::debug;

pub use self::pallet::*;

pub mod weights;
use crate::weights::WeightInfo;

mod config;
mod errors;
mod events;
mod extrinsics;
mod genesis;
mod hooks;
mod impls;

use frame_support::{pallet_prelude::*, traits::EnsureOrigin};
use frame_system::pallet_prelude::*;
use sp_runtime::traits::AccountIdConversion;
use sp_std::prelude::*;
use sp_runtime::traits::One;

#[import_section(extrinsics::dispatches)]
#[import_section(errors::errors)]
#[import_section(events::events)]
#[import_section(config::config)]
#[import_section(hooks::hooks)]
#[import_section(impls::impls)]
#[import_section(genesis::genesis)]

/// Set the pallet at dev mode for quick PoC.  
// Set the pallet at dev mode for quick PoC.
//#[frame_support::pallet(dev_mode)] // 去掉DEV_MODE
#[frame_support::pallet]
pub mod pallet {
    //属性放在声明的位置；方法作为section放在去其他文件中
    use super::*;

    use frame_support::{pallet_prelude::*, Blake2_128Concat, Twox64Concat};
    use frame_system::pallet_prelude::*;
    //use frame_support::{traits::MaxEncodedLen, BoundedVec};
    use frame_support::pallet_prelude::MaxEncodedLen;
    use frame_support::pallet_prelude::*;
    use frame_support::BoundedVec;

    use scale_info::TypeInfo;
    use sp_core::{H256, U256};
    use sp_runtime::{traits::Saturating, Permill};
    use sp_std::prelude::*;

    #[pallet::pallet] // <- the macro
    pub struct Pallet<T>(_); // <- the struct definition

    //总份额存储在上级组织表中
    #[pallet::storage] 
	#[pallet::getter(fn cdao_memberships)]
    pub type CDaoMemberships <T: Config> = StorageNMap<
        _,
        (   //负责人ID
            NMapKey<Blake2_128Concat, T::AccountId>,
            //组织名字
            NMapKey<Blake2_128Concat, BoundedVec<u8, <T as Config>::MaxNameLength>>,
            //成员ID
            NMapKey<Blake2_128Concat, T::AccountId>,
        ),
		u32,// 权益份额 
		ValueQuery,
    >; 
}
 
/*
#[derive(Clone, Encode, Decode, Eq, PartialEq, Debug, Default, TypeInfo, MaxEncodedLen)]
#[scale_info(skip_type_params(T))]
pub struct Membership<T: Config> {
    pub member_id: T::AccountId, // 成员ID
    pub equity: u32,             // 成员所持有的权益数量
} 

  #[derive(Clone, Encode, Decode, Eq, PartialEq, Debug, Default, TypeInfo, MaxEncodedLen)]
#[scale_info(skip_type_params(T))]
pub struct CDaoMembership<T: Config> {
    pub prime_id: T::AccountId, // 主要负责人ID
    pub total_equity: u32,      // 总权益
    pub memberships: BoundedVec<Membership<T>, <T as Config>::MaxMemberships>, // 成员列表
} // pub prime_id: [u8; 32],           // 主要负责人ID

#[pallet::storage]
#[pallet::getter(fn cdao_memberships)]
pub type CDaoMemberships<T: Config> = StorageMap<
    _,
    Blake2_128Concat,
    BoundedVec<u8, <T as Config>::MaxNameLength>,
    CDaoMembership<T>,
>;
// double map
#[pallet::storage]
#[pallet::getter(fn cdao_memberships)]
pub type CDaoMemberships<T: Config> = StorageDoubleMap<_, Blake2_128Concat, T::AccountId, BoundedVec<u8, <T as Config>::MaxNameLength>,
CDaoMembership<T>, T::Hash>;
*/

