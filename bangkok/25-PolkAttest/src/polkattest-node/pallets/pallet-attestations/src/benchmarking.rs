//! Benchmarking setup for pallet-attestations
#![cfg(feature = "runtime-benchmarks")]
use super::*;

#[allow(unused)]
use crate::Pallet as Attestations;
use frame_benchmarking::v2::*;
use frame_system::RawOrigin;

#[benchmarks]
mod benchmarks {
	use super::*;

	impl_benchmark_test_suite!(Attestations, crate::mock::new_test_ext(), crate::mock::Test);
}
