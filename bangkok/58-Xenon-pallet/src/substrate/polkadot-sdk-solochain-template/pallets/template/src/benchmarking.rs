#![cfg(feature = "runtime-benchmarks")]

use super::*;
use crate::Pallet as XenonPallet;
use frame_benchmarking::v2::*;
use frame_system::RawOrigin;
use sp_std::vec;

#[benchmarks]
mod benchmarks {
    use super::*;

    #[benchmark]
    fn create_did() {
        let caller: T::AccountId = whitelisted_caller();

        #[extrinsic_call]
        create_did(RawOrigin::Signed(caller.clone()));

        assert!(DidDocuments::<T>::contains_key(&caller));
    }

    #[benchmark]
    fn link_chain() {
        let caller: T::AccountId = whitelisted_caller();
        let chain_name = vec![1; 32];
        let chain_id = 1u32;
        let address = vec![1; 64];

        // Setup: Create DID first
        XenonPallet::<T>::create_did(RawOrigin::Signed(caller.clone()).into()).unwrap();

        #[extrinsic_call]
        link_chain(
            RawOrigin::Signed(caller.clone()),
            chain_name,
            chain_id,
            address.clone()
        );

        let document = DidDocuments::<T>::get(&caller).unwrap();
        assert!(document.chains.iter().any(|c| c.chain_id == chain_id));
    }

    #[benchmark]
    fn unlink_chain() {
        let caller: T::AccountId = whitelisted_caller();
        let chain_name = vec![1; 32];
        let chain_id = 1u32;
        let address = vec![1; 64];

        // Setup: Create DID and link chain
        XenonPallet::<T>::create_did(RawOrigin::Signed(caller.clone()).into()).unwrap();
        XenonPallet::<T>::link_chain(
            RawOrigin::Signed(caller.clone()).into(),
            chain_name,
            chain_id,
            address
        ).unwrap();

        #[extrinsic_call]
        unlink_chain(RawOrigin::Signed(caller.clone()), chain_id);

        let document = DidDocuments::<T>::get(&caller).unwrap();
        assert!(!document.chains.iter().any(|c| c.chain_id == chain_id));
    }

    impl_benchmark_test_suite!(
        XenonPallet,
        crate::mock::new_test_ext(),
        crate::mock::Test
    );
}