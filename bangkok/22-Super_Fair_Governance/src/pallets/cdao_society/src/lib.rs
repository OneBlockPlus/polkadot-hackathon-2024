#![cfg_attr(not(feature = "std"), no_std)]
use frame_support::pallet_macros::import_section;

#[cfg(test)]
mod mock;

#[cfg(test)]
mod tests;

#[cfg(feature = "runtime-benchmarks")]
mod benchmarking;

pub use log::debug;

pub use pallet::*;

pub mod weights;
pub use weights::*;

mod config;
mod errors;
mod events;
mod extrinsics;
mod genesis;
mod hooks;
mod impls;

/// Import all sections from different files.
#[import_section(extrinsics::dispatches)]
#[import_section(errors::errors)]
#[import_section(events::events)]
#[import_section(config::config)]
#[import_section(hooks::hooks)]
#[import_section(impls::impls)]
#[import_section(genesis::genesis)]
/// Set the pallet at dev mode for quick PoC.  
///// Set the pallet at dev mode for quick PoC.
//#[frame_support::pallet(dev_mode)] // 去掉DEV_MODE
#[frame_support::pallet]
pub mod pallet {
    //属性放在声明的位置；方法作为section放在去其他文件中
    use super::*;

    // use frame_support::traits::{BalanceStatus, Currency, Randomness, ReservableCurrency};

    use frame_support::{pallet_prelude::*, Blake2_128Concat};
    // use frame_support::traits::MaxEncodedLen;  // MAP存储时候最大的长度；
    // use frame_support::pallet_prelude::MaxEncodedLen;  // MAP存储时候最大的长度

    use frame_system::pallet_prelude::*;
    use serde::{Deserialize, Serialize};

    // use sp_runtime::traits::Bounded;
    use sp_std::prelude::*;
    use sp_weights::WeightMeter;

    #[pallet::pallet] // <- the macro
    pub struct Pallet<T>(_); // <- the struct definition

    #[derive(Encode, Decode, Clone, Default, TypeInfo, Serialize, Deserialize, MaxEncodedLen)]
    pub struct KittyInfo(pub [u8; 16]);

    //  pub type BalanceOf<T> =
    // <<T as Config>::Currency as Currency<<T as frame_system::Config>::AccountId>>::Balance;

    //单值存储；- `_`: 这里的下划线是一个类型占位符，它将在编译时被替换为pallet的配置类型`T`。ValueQuery 为0
    #[pallet::storage]
    pub type NextKittyId<T> = StorageValue<_, u32, ValueQuery>;

    //  映射存储 ;`Blake2_128Concat`: 这是一个哈希函数，用于生成存储键的哈希值。
    // 它将键`u32`的值哈希到一个固定大小的字节序列，以确保键的唯一性和可预测性。
    #[pallet::storage]
    pub type KittyInfoList<T> = StorageMap<_, Blake2_128Concat, u32, KittyInfo>;

    //存储一个最大的值
    #[pallet::storage]
    pub type MaxBindValue<T> = StorageMap<_, Blake2_128Concat, u32, u64>;

    //存储拍卖结束的最大区块数
    // #[pallet::storage]
    // pub type MaxBindBlockNum<T> = StorageMap<_, Blake2_128Concat, u32, T::MaxKittiesBlockNumberFor>;

    // 映射存储: 与上面的`StorageMap`类似，
    // 这个映射存储将Kitty的ID（`u32`）映射到拥有该Kitty的账户ID（`T::AccountId`）。
    // 每个用户可以有多个KittyID
    #[pallet::storage]
    pub type KittyOwnerList<T: Config> = StorageMap<_, Blake2_128Concat, u32, T::AccountId>;

    // 映射存储，它将Kitty的ID（`u32`）映射到一个有界向量`BoundedVec`。
    // BoundedVec 向量存储了账户ID和出价（`u64`）的元组，并且其大小被限制为`<T as Config>::MaxBidEntries`定义的最大条目数。
    //  bid price for each kitty,
    #[pallet::storage]
    pub type KittiesBid<T: Config> = StorageMap<
        _,
        Blake2_128Concat,
        u32,
        BoundedVec<(T::AccountId, u64), <T as Config>::MaxBidEntries>,
    >;
}
