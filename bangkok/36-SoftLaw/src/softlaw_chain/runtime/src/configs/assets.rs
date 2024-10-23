// This is free and unencumbered software released into the public domain.
//
// Anyone is free to copy, modify, publish, use, compile, sell, or
// distribute this software, either in source code form or as a compiled
// binary, for any purpose, commercial or non-commercial, and by any
// means.
//
// In jurisdictions that recognize copyright laws, the author or authors
// of this software dedicate any and all copyright interest in the
// software to the public domain. We make this dedication for the benefit
// of the public at large and to the detriment of our heirs and
// successors. We intend this dedication to be an overt act of
// relinquishment in perpetuity of all present and future rights to this
// software under copyright law.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
// IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
// OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
// ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
// OTHER DEALINGS IN THE SOFTWARE.
//
// For more information, please refer to <http://unlicense.org>

use crate::{
    deposit, AccountId, Assets, Balance, Balances, BlockNumber, Nfts, Runtime, RuntimeEvent,
    RuntimeHoldReason, DAYS, EXISTENTIAL_DEPOSIT, UNIT,
};
use frame_support::{
    parameter_types,
    traits::{AsEnsureOriginWithArg, ConstU32},
    BoundedVec, PalletId,
};
use frame_system::{EnsureRoot, EnsureSigned};
use pallet_nfts::PalletFeatures;
use parachains_common::{AssetIdForTrustBackedAssets, CollectionId, ItemId, Signature};
use sp_runtime::traits::Verify;

/// We allow root to execute privileged asset operations.
pub type AssetsForceOrigin = EnsureRoot<AccountId>;

parameter_types! {
    pub const NftFractionalizationPalletId: PalletId = PalletId(*b"fraction");
    pub NewAssetSymbol: BoundedVec<u8, AssetsStringLimit> = (*b"FRAC").to_vec().try_into().unwrap();
    pub NewAssetName: BoundedVec<u8, AssetsStringLimit> = (*b"Frac").to_vec().try_into().unwrap();
}

impl pallet_nft_fractionalization::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type Deposit = AssetDeposit;
    type Currency = Balances;
    type NewAssetSymbol = NewAssetSymbol;
    type NewAssetName = NewAssetName;
    type StringLimit = AssetsStringLimit;
    type NftCollectionId = <Self as pallet_nfts::Config>::CollectionId;
    type NftId = <Self as pallet_nfts::Config>::ItemId;
    type AssetBalance = <Self as pallet_assets::Config<TrustBackedAssets>>::Balance;
    type AssetId = <Self as pallet_assets::Config<TrustBackedAssets>>::AssetId;
    type Assets = Assets;
    type Nfts = Nfts;
    type PalletId = NftFractionalizationPalletId;
    type WeightInfo = (); // Configure based on benchmarking results.
    type RuntimeHoldReason = RuntimeHoldReason;
    #[cfg(feature = "runtime-benchmarks")]
    type BenchmarkHelper = ();
}

parameter_types! {
    pub NftsPalletFeatures: PalletFeatures = PalletFeatures::all_enabled();
    pub const NftsCollectionDeposit: Balance = 10 * UNIT;
    pub const NftsItemDeposit: Balance = UNIT / 100;
    pub const NftsMetadataDepositBase: Balance = deposit(1, 129);
    pub const NftsAttributeDepositBase: Balance = deposit(1, 0);
    pub const NftsDepositPerByte: Balance = deposit(0, 1);
    pub const NftsMaxDeadlineDuration: BlockNumber = 12 * 30 * DAYS;
}
impl pallet_nfts::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type CollectionId = CollectionId;
    type ItemId = ItemId;
    type Currency = Balances;
    type CreateOrigin = AsEnsureOriginWithArg<EnsureSigned<AccountId>>;
    type ForceOrigin = AssetsForceOrigin;
    type Locker = ();
    type CollectionDeposit = NftsCollectionDeposit;
    type ItemDeposit = NftsItemDeposit;
    type MetadataDepositBase = NftsMetadataDepositBase;
    type AttributeDepositBase = NftsAttributeDepositBase;
    type DepositPerByte = NftsDepositPerByte;
    type StringLimit = ConstU32<256>;
    type KeyLimit = ConstU32<64>;
    type ValueLimit = ConstU32<256>;
    type ApprovalsLimit = ConstU32<20>;
    type ItemAttributesApprovalsLimit = ConstU32<30>;
    type MaxTips = ConstU32<10>;
    type MaxDeadlineDuration = NftsMaxDeadlineDuration;
    type MaxAttributesPerCall = ConstU32<10>;
    type Features = NftsPalletFeatures;
    type OffchainSignature = Signature;
    type OffchainPublic = <Signature as Verify>::Signer;
    type WeightInfo = (); // Configure based on benchmarking results.
    #[cfg(feature = "runtime-benchmarks")]
    type Helper = ();
}

parameter_types! {
    pub const AssetDeposit: Balance = 10 * UNIT;
    pub const AssetAccountDeposit: Balance = deposit(1, 16);
    pub const ApprovalDeposit: Balance = EXISTENTIAL_DEPOSIT;
    pub const AssetsStringLimit: u32 = 50;
    /// Key = 32 bytes, Value = 36 bytes (32+1+1+1+1)
    // https://github.com/paritytech/substrate/blob/069917b/frame/assets/src/lib.rs#L257L271
    pub const MetadataDepositBase: Balance = deposit(1, 68);
    pub const MetadataDepositPerByte: Balance = deposit(0, 1);
}

pub type TrustBackedAssets = pallet_assets::Instance1;
impl pallet_assets::Config<TrustBackedAssets> for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type Balance = Balance;
    type AssetId = AssetIdForTrustBackedAssets;
    type AssetIdParameter = codec::Compact<AssetIdForTrustBackedAssets>;
    type Currency = Balances;
    type CreateOrigin = AsEnsureOriginWithArg<EnsureSigned<AccountId>>;
    type ForceOrigin = AssetsForceOrigin;
    type AssetDeposit = AssetDeposit;
    type MetadataDepositBase = MetadataDepositBase;
    type MetadataDepositPerByte = MetadataDepositPerByte;
    type ApprovalDeposit = ApprovalDeposit;
    type StringLimit = AssetsStringLimit;
    type Freezer = ();
    type Extra = ();
    type WeightInfo = (); // Configure based on benchmarking results.
    type CallbackHandle = ();
    type AssetAccountDeposit = AssetAccountDeposit;
    type RemoveItemsLimit = ConstU32<1000>;
    #[cfg(feature = "runtime-benchmarks")]
    type BenchmarkHelper = ();
}
