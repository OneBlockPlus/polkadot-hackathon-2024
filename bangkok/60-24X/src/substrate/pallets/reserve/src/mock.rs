use frame_support::{derive_impl, traits::tokens::Provenance, weights::constants::RocksDbWeight};
use frame_system::{mocking::MockBlock, GenesisConfig};
use sp_core::ConstU32;
use sp_runtime::{traits::ConstU64, BuildStorage};
use frame_system;
use frame_support::{parameter_types, PalletId};

use pallet_risk_manager;
use pallet_pools;
use pallet_oracle;

// Configure a mock runtime to test the pallet.
#[frame_support::runtime]
mod test_runtime {
    #[runtime::runtime]
    #[runtime::derive(
        RuntimeCall,
        RuntimeEvent,
        RuntimeError,
        RuntimeOrigin,
        RuntimeFreezeReason,
        RuntimeHoldReason,
        RuntimeSlashReason,
        RuntimeLockId,
        RuntimeTask
    )]
    pub struct Test;

    #[runtime::pallet_index(0)]
    pub type System = frame_system;
    #[runtime::pallet_index(1)]
    pub type Assets = pallet_assets;
    #[runtime::pallet_index(2)]
    pub type Balances = pallet_balances;
    #[runtime::pallet_index(3)]
    pub type Pools = pallet_pools;
    #[runtime::pallet_index(4)]
    pub type RiskManager = pallet_risk_manager;
    #[runtime::pallet_index(5)]
    pub type Oracle = pallet_oracle;
    #[runtime::pallet_index(6)]
    pub type Reserve = crate;
}

#[derive_impl(frame_system::config_preludes::TestDefaultConfig)]
impl frame_system::Config for Test {
    type Nonce = u64;
	type Block = MockBlock<Test>;
	type BlockHashCount = ConstU64<250>;
	type DbWeight = RocksDbWeight;
}

// Implement minimal configs for Balances and Assets
impl pallet_balances::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type Balance = u128;
    type DustRemoval = ();
    type ExistentialDeposit = ConstU64<1>;
    type AccountStore = System;
    type WeightInfo = ();
    type MaxLocks = ();
    type MaxReserves = ();
    type ReserveIdentifier = [u8; 8];
    type FreezeIdentifier = ();
    type MaxFreezes = ();
    type RuntimeHoldReason = ();
    
    type RuntimeFreezeReason = ();
}

impl pallet_assets::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type Balance = u128;
    type AssetId = u32;
    type AssetIdParameter = u32;
    type Currency = Balances;
    type CreateOrigin = frame_support::traits::AsEnsureOriginWithArg<frame_system::EnsureSigned<Self::AccountId>>;
    type ForceOrigin = frame_system::EnsureRoot<Self::AccountId>;
    type AssetDeposit = ConstU64<1>;
    type AssetAccountDeposit = ConstU64<1>;
    type MetadataDepositBase = ConstU64<1>;
    type MetadataDepositPerByte = ConstU64<1>;
    type ApprovalDeposit = ConstU64<1>;
    type StringLimit = ConstU32<50>;
    type Freezer = ();
    type WeightInfo = ();
    type CallbackHandle = ();
    type Extra = ();
    type RemoveItemsLimit = ConstU32<1000>;
}

impl pallet_pools::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type PoolId = u32;
    type MaxPools = ConstU32<100>;
    type WeightInfo = ();
    type Currency = Balances;
    type AssetId = u32;
    type AssetBalance = u128;
    type Assets = Assets;
    type AssetRegistry = Assets;
    type PalletId = PalletId;
}

impl pallet_oracle::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type WeightInfo = ();
    
    type Price = u128;
    type AssetId = u32;
    type MaxPriceSources = ConstU32<10>;
}

impl pallet_risk_manager::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type WeightInfo = ();
    type PoolId = u32;
    type Currency = Balances;
    type AssetId = u32;
    type AssetBalance = u128;
    type Assets = Assets;
    type AssetRegistry = Assets;
    type Price = u128;
    type Oracle = Oracle;
}

parameter_types! {
    pub const ReservePalletId: frame_support::PalletId = frame_support::PalletId(*b"rsv_pllt");
}

impl crate::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type Pools = Pools;
    type RiskManagement = RiskManager;
    type Oracle = Oracle;
    type PoolId = u32;
    type AssetId = u32;
    type WeightInfo = crate::weights::SubstrateWeight<Test>;
    type PalletId = ReservePalletId;
    type Price = u128;
    type Currency = Balances;
    type AssetBalance = u128;
    type Assets = Assets;
    type AssetRegistry = Assets;
}

// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
	GenesisConfig::<Test>::default().build_storage().unwrap().into()
}