use crate::{Call as ZkLoginCall, Pallet};
use frame_executive::Executive;
use frame_support::{
    assert_ok,
    dispatch::RawOrigin,
    pallet_prelude::{ConstU32, TypeInfo},
    parameter_types,
    traits::UnfilteredDispatchable,
    BoundedVec,
};
use pallet_balances::Call as BalancesCall;
use scale_codec::{Decode, Encode};
use sp_core::{ed25519, Pair, H256};
use sp_runtime::{
    generic,
    generic::{CheckedExtrinsic, UncheckedExtrinsic},
    traits::{BlakeTwo256, Checkable, DispatchInfoOf, IdentifyAccount, SignedExtension, Verify},
    transaction_validity::TransactionValidityError,
    BuildStorage, MultiAddress, MultiSignature,
};
use std::str::FromStr;
use zklogin_support::{
    test_helper::{get_raw_data, get_test_eph_key, get_zklogin_inputs},
    JWKProvider, JwkId, ZkMaterial,
};

/// An index to a block.
pub type BlockNumber = u32;
pub type Header = generic::Header<BlockNumber, BlakeTwo256>;
type Context = frame_system::ChainContext<Test>;
pub type Signature = MultiSignature;
pub type AccountId = <<Signature as Verify>::Signer as IdentifyAccount>::AccountId;
pub type Address = MultiAddress<AccountId, ()>;
type MockUncheckedExtrinsic = UncheckedExtrinsic<Address, RuntimeCall, MultiSignature, MockExtra>;
type MockCheckedExtrinsic = CheckedExtrinsic<AccountId, RuntimeCall, MockExtra>;

pub type SignedPayload = generic::SignedPayload<RuntimeCall, MockExtra>;

type Block = generic::Block<Header, MockUncheckedExtrinsic>;

#[derive(Clone, Eq, PartialEq, Debug, Encode, Decode, TypeInfo)]
pub struct MockExtra;

impl SignedExtension for MockExtra {
    const IDENTIFIER: &'static str = "MockExtra";
    type AccountId = AccountId;
    type Call = RuntimeCall;
    type AdditionalSigned = ();
    type Pre = ();

    fn additional_signed(&self) -> Result<Self::AdditionalSigned, TransactionValidityError> {
        Ok(())
    }

    fn pre_dispatch(
        self,
        _who: &Self::AccountId,
        _call: &Self::Call,
        _info: &DispatchInfoOf<Self::Call>,
        _len: usize,
    ) -> Result<Self::Pre, TransactionValidityError> {
        Ok(())
    }
}

type MockExecutive = Executive<Test, Block, Context, Test, AllPalletsWithSystem, ()>;

frame_support::construct_runtime!(
    pub enum Test
    {
        System: frame_system::{Pallet, Call, Config<T>, Storage, Event<T>},
        Balances: pallet_balances::{Pallet, Call, Storage, Config<T>, Event<T>},
        ZkLogin: super::{Pallet, Call, Event<T>, ValidateUnsigned},
    }
);

parameter_types! {
    pub const BlockHashCount: u32 = 250;
}

impl frame_system::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type BaseCallFilter = frame_support::traits::Everything;
    type BlockWeights = ();
    type BlockLength = ();
    type RuntimeOrigin = RuntimeOrigin;
    type RuntimeCall = RuntimeCall;
    type Nonce = u64;
    type Hash = H256;
    type Hashing = BlakeTwo256;
    type AccountId = AccountId;
    type Lookup = sp_runtime::traits::AccountIdLookup<Self::AccountId, ()>;
    type Block = Block;
    type BlockHashCount = BlockHashCount;
    type DbWeight = ();
    type Version = ();
    type PalletInfo = PalletInfo;
    type AccountData = pallet_balances::AccountData<u64>;
    type OnNewAccount = ();
    type OnKilledAccount = ();
    type SystemWeightInfo = ();
    type SS58Prefix = ();
    type OnSetCode = ();
    type MaxConsumers = ConstU32<16>;
}

parameter_types! {
    pub const ExistentialDeposit: u64 = 1;
}

impl pallet_balances::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type RuntimeHoldReason = RuntimeHoldReason;
    type RuntimeFreezeReason = RuntimeFreezeReason;
    type WeightInfo = ();
    type Balance = u64;
    type DustRemoval = ();
    type ExistentialDeposit = ExistentialDeposit;
    type AccountStore = System;
    type ReserveIdentifier = [u8; 8];
    type FreezeIdentifier = ();
    type MaxLocks = ();
    type MaxReserves = ();
    type MaxHolds = ConstU32<1>;
    type MaxFreezes = ConstU32<1>;
}

impl super::Config for Test {
    type RuntimeEvent = RuntimeEvent;
    type Context = Context;
    type Extrinsic = MockUncheckedExtrinsic;
    type CheckedExtrinsic = MockCheckedExtrinsic;
    type UnsignedValidator = Test;
    type BlockNumberProvider = System;
}

fn zk_address() -> AccountId {
    let (zklogin_address, ..) = get_raw_data();
    zklogin_address
}

// This function basically just builds a genesis storage key/value store according to
// our desired mockup.
pub fn new_test_ext() -> sp_io::TestExternalities {
    let mut t = frame_system::GenesisConfig::<Test>::default().build_storage().unwrap();
    // We use default for brevity, but you can configure as desired if needed.
    pallet_balances::GenesisConfig::<Test> {
        // give `zk_address` an initial value of 1000
        balances: vec![(zk_address(), 1000)],
    }
    .assimilate_storage(&mut t)
    .unwrap();
    t.into()
}

#[test]
fn basic_setup_works() {
    new_test_ext().execute_with(|| {
        assert_eq!(System::account(&zk_address()).data.free, 1000);
    })
}

#[test]
fn validate_unsigned_should_work() {
    use sp_runtime::traits::ValidateUnsigned;
    let source = sp_runtime::transaction_validity::TransactionSource::External;

    // get zk-related variables for zk-proof verifying
    let (address_seed, input_data, expire_at, eph_pubkey) = get_raw_data();
    let inputs = get_zklogin_inputs(input_data);

    let signing_key = get_test_eph_key();

    let google_kid = "1f40f0a8ef3d880978dc82f25c3ec317c6a5b781";
    let google_jwk_id = JwkId::new(
        JWKProvider::Google,
        BoundedVec::<u8, ConstU32<256>>::truncate_from(google_kid.as_bytes().to_vec()),
    );

    let zk_material = ZkMaterial::new(google_jwk_id, inputs, expire_at, eph_pubkey);

    // construct Transfer Call
    let dest = AccountId::from([0u8; 32]);
    let call: RuntimeCall =
        BalancesCall::transfer_keep_alive { dest: MultiAddress::Id(dest.clone()), value: 100 }
            .into();

    let payload = SignedPayload::new(call.clone(), MockExtra).expect("payload should succeed");
    let sign = payload.using_encoded(|d| signing_key.sign(d));

    // construct inner unchecked_extrinsic
    let uxt = MockUncheckedExtrinsic::new_signed(
        call,
        AccountId::from(signing_key.public()).into(),
        MultiSignature::from(sign),
        MockExtra,
    );

    let final_call = ZkLoginCall::submit_zklogin_unsigned {
        uxt: Box::new(uxt),
        address_seed: address_seed.into(),
        zk_material,
    };

    let outer_uxt = UncheckedExtrinsic::<
        MultiAddress<AccountId, ()>,
        RuntimeCall,
        MultiSignature,
        MockExtra,
    >::new_unsigned(final_call.clone().into());

    new_test_ext().execute_with(|| {
        // the eph key's expiration at 834, make sure current number is smaller.
        System::set_block_number(10);
        assert!(Pallet::<Test>::validate_unsigned(source, &final_call).is_ok());

        // execute through call.dispatch
        assert_ok!(final_call.dispatch_bypass_filter(RawOrigin::None.into()));
        // deduct 100 from zk_address
        assert_eq!(Balances::free_balance(&zk_address(),), 900);
        // transfer success
        assert_eq!(Balances::free_balance(&dest), 100);

        // execute through `apply_extrinsic`
        assert_ok!(MockExecutive::apply_extrinsic(outer_uxt));
        // deduct 100 from zk_address
        assert_eq!(Balances::free_balance(&zk_address(),), 800);
        // transfer success
        assert_eq!(Balances::free_balance(&dest), 200);
    });
}
