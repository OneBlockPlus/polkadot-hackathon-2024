use frame_support::{derive_impl, traits::tokens::Provenance, weights::constants::RocksDbWeight};
use frame_system::{mocking::MockBlock, GenesisConfig};
use sp_core::ConstU32;
use sp_runtime::{traits::ConstU64, BuildStorage};
use frame_system;

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
    pub type Orderbook = crate;
}

#[derive_impl(frame_system::config_preludes::TestDefaultConfig)]
impl frame_system::Config for Test {
    type Nonce = u64;
    type Block = MockBlock<Test>;
    type BlockHashCount = ConstU64<250>;
    type DbWeight = RocksDbWeight;
}

pub struct MockFungibles;
impl frame_support::traits::fungibles::Inspect<u64> for MockFungibles {
    type AssetId = u32;
    type Balance = u128;

    fn total_issuance(_asset: Self::AssetId) -> Self::Balance {
        1_000_000
    }

    fn minimum_balance(_asset: Self::AssetId) -> Self::Balance {
        1
    }

    fn balance(_asset: Self::AssetId, _who: &u64) -> Self::Balance {
        100_000
    }

    fn reducible_balance(_asset: Self::AssetId, _who: &u64, _keep_alive: frame_support::traits::tokens::Preservation, _force: frame_support::traits::tokens::Fortitude) -> Self::Balance {
        100_000
    }

    fn can_deposit(_asset: Self::AssetId, _who: &u64, _amount: Self::Balance, _mint: Provenance) -> frame_support::traits::tokens::DepositConsequence {
        frame_support::traits::tokens::DepositConsequence::Success
    }

    fn can_withdraw(_asset: Self::AssetId, _who: &u64, _amount: Self::Balance) -> frame_support::traits::tokens::WithdrawConsequence<Self::Balance> {
        frame_support::traits::tokens::WithdrawConsequence::Success
    }

    fn asset_exists(_asset: Self::AssetId) -> bool {
        true
    }
    
    fn total_balance(_asset: Self::AssetId, _who: &u64) -> Self::Balance {
        100_000
    }
}

impl frame_support::traits::fungibles::Mutate<u64> for MockFungibles {
    fn transfer(
        _asset: Self::AssetId,
        _source: &u64,
        _dest: &u64,
        _amount: Self::Balance,
        _preservation: frame_support::traits::tokens::Preservation,
    ) -> Result<Self::Balance, sp_runtime::DispatchError> {
        Ok(100_000)
    }
}

impl crate::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type Fungibles = MockFungibles;
    type OrderId = u32;
    type PairId = u32;
    type MaxOrdersPerPrice = ConstU32<100>;
    type WeightInfo = ();
}

// Build genesis storage according to the mock runtime.
pub fn new_test_ext() -> sp_io::TestExternalities {
    GenesisConfig::<Test>::default().build_storage().unwrap().into()
}