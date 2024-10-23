use frame_support::{derive_impl, traits::tokens::Provenance, weights::constants::RocksDbWeight};
use frame_system::{mocking::MockBlock, GenesisConfig};
use sp_core::ConstU32;
use sp_runtime::{traits::ConstU64, BuildStorage};
use frame_system;
use frame_support::{parameter_types, PalletId};

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
    pub type Pools = crate;
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
    type MaxHolds = ();
    type MaxFreezes = ();
    type RuntimeHoldReason = ();
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

impl crate::Config for Test {
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

// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
    GenesisConfig::<Test>::default().build_storage().unwrap().into()
}