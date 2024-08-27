// This file is part of anchor pallet.

#![cfg(feature = "runtime-benchmarks")]

use crate::*;
use frame_benchmarking::v2::*;
use frame_system::RawOrigin;

#[benchmarks]
mod benchmarks {
	use super::*;

    #[benchmark]
	fn set_anchor_benchmark() {
        let key:Vec<u8> = b"hello".iter().cloned().collect();
		let raw:Vec<u8> = b"Test...".iter().cloned().collect();
		let protocol:Vec<u8> = b"Nothing".iter().cloned().collect();

        let caller: T::AccountId = whitelisted_caller();

        #[extrinsic_call]
        set_anchor(RawOrigin::Signed(caller),key.clone(),raw.clone(),protocol.clone(),0);

        Ok(())
    }

    #[benchmark]
	fn sell_anchor_benchmark() {
        Ok(())
    }

    #[benchmark]
	fn unsell_anchor_benchmark() {
        Ok(())
    }

    #[benchmark]
	fn buy_anchor_benchmark() {
        Ok(())
    }

    #[benchmark]
	fn divert_anchor_benchmark() {
        Ok(())
    }

    #[benchmark]
	fn drop_anchor_benchmark() {
        Ok(())
    }

    impl_benchmark_test_suite!(Pallet, crate::tests::new_test_ext(), crate::tests::Test);
}