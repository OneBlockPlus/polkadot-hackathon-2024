use crate::{Balances, Runtime, RuntimeEvent};
use frame_support::traits::ConstU32;

impl pallet_ip_pallet::Config for Runtime {
    type RuntimeEvent = RuntimeEvent;
    type Currency = Balances;
    type LicenseId = u32;
    type MaxNameLength = ConstU32<50>;
    type MaxDescriptionLength = ConstU32<200>;
}