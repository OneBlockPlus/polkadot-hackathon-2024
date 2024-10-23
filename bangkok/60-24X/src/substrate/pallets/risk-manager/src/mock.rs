use crate as pallet_risk_management;
use frame_support::{
    derive_impl, parameter_types,
    traits::{ConstU16, ConstU32, ConstU64, ConstU128, Everything},
};
use frame_system as system;
use sp_core::H256;
use sp_runtime::{
    traits::{BlakeTwo256, IdentityLookup},
    BuildStorage,
};
use frame_support::traits::tokens::Provenance;

type Block = frame_system::mocking::MockBlock<Test>;

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
    pub type RiskManagement = crate;
}

#[derive_impl(frame_system::config_preludes::TestDefaultConfig as frame_system::DefaultConfig)]
impl frame_system::Config for Test {
    type BaseCallFilter = Everything;
    type BlockWeights = ();
    type BlockLength = ();
    type RuntimeOrigin = RuntimeOrigin;
    type RuntimeCall = RuntimeCall;
    type Nonce = u64;
    type Hash = H256;
    type Hashing = BlakeTwo256;
    type AccountId = u64;
    type Lookup = IdentityLookup<Self::AccountId>;
    type Block = Block;
    type RuntimeEvent = RuntimeEvent;
    type BlockHashCount = ConstU64<250>;
    type DbWeight = ();
    type Version = ();
    type PalletInfo = PalletInfo;
    type AccountData = ();
    type OnNewAccount = ();
    type OnKilledAccount = ();
    type SystemWeightInfo = ();
    type SS58Prefix = ConstU16<42>;
    type OnSetCode = ();
    type MaxConsumers = ConstU32<16>;
}
parameter_types! {
    pub const TestPoolId: u32 = 1;
}

pub struct MockFungibles;
impl frame_support::traits::fungibles::Inspect<<Test as frame_system::Config>::AccountId> for MockFungibles {
    type AssetId = u32;
    type Balance = u128;

    fn total_issuance(_asset: Self::AssetId) -> Self::Balance {
        0
    }

    fn minimum_balance(_asset: Self::AssetId) -> Self::Balance {
        0
    }

    fn balance(_asset: Self::AssetId, _who: &<Test as frame_system::Config>::AccountId) -> Self::Balance {
        0
    }

    fn reducible_balance(
        _asset: Self::AssetId,
        _who: &<Test as frame_system::Config>::AccountId,
        _keep_alive: frame_support::traits::tokens::Preservation,
        _force: frame_support::traits::tokens::Fortitude,
    ) -> Self::Balance {
        let _ = _asset;
        0
    }

    fn can_deposit(_asset: Self::AssetId, _who: &<Test as frame_system::Config>::AccountId, _amount: Self::Balance, _mint: Provenance) -> frame_support::traits::tokens::DepositConsequence {
        frame_support::traits::tokens::DepositConsequence::Success
    }

    fn can_withdraw(_asset: Self::AssetId, _who: &<Test as frame_system::Config>::AccountId, _amount: Self::Balance) -> frame_support::traits::tokens::WithdrawConsequence<Self::Balance> {
        frame_support::traits::tokens::WithdrawConsequence::Success
    }

    fn asset_exists(_asset: Self::AssetId) -> bool {
        true
    }
    
    fn total_balance(_asset: Self::AssetId, _who: &<Test as frame_system::Config>::AccountId) -> Self::Balance {
        0
    }
}

impl frame_support::traits::fungibles::Mutate<<Test as frame_system::Config>::AccountId> for MockFungibles {
    fn mint_into(
        _asset: Self::AssetId,
        _who: &<Test as frame_system::Config>::AccountId,
        _amount: Self::Balance,
    ) -> Result<Self::Balance, sp_runtime::DispatchError> {
        Ok(0)
    }

    fn burn_from(
        _asset: Self::AssetId,
        _who: &<Test as frame_system::Config>::AccountId,
        _amount: Self::Balance,
        _preservation: frame_support::traits::tokens::Preservation,
        _precision: frame_support::traits::tokens::Precision,
        _fortitude: frame_support::traits::tokens::Fortitude,
    ) -> Result<Self::Balance, sp_runtime::DispatchError> {
        Ok(0)
    }
}
impl frame_support::traits::fungibles::Create<<Test as frame_system::Config>::AccountId> for MockFungibles {
    fn create(
            id: Self::AssetId,
            admin: <Test as frame_system::Config>::AccountId,
            is_sufficient: bool,
            min_balance: Self::Balance,
        ) -> sp_runtime::DispatchResult {
        Ok(())
    }
}

impl frame_support::traits::fungibles::Unbalanced<u64> for MockFungibles {
    fn handle_dust(dust: frame_support::traits::fungibles::Dust<u64, Self>) {
        todo!()
    }

    fn write_balance(
            asset: Self::AssetId,
            who: &u64,
            amount: Self::Balance,
        ) -> Result<Option<Self::Balance>, sp_runtime::DispatchError> {
        todo!()
    }

    fn set_total_issuance(asset: Self::AssetId, amount: Self::Balance) {
        todo!()
    }
}


pub struct MockOracle;
impl pallet_risk_management::OracleTrait<u32, u128> for MockOracle {
    fn get_price(_asset_id: u32) -> Option<u128> {
        Some(1_000_000_000_000_000_000) // 1 USD in 18 decimal places
    }
}

impl pallet_risk_management::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type Fungibles = MockFungibles;
    type PoolId = u32;
    type RiskManagerOrigin = frame_system::EnsureRoot<Self::AccountId>;
    type Oracle = MockOracle;
    type WeightInfo = crate::weights::SubstrateWeight<Test>;
}

// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
    system::GenesisConfig::<Test>::default()
        .build_storage()
        .unwrap()
        .into()
}