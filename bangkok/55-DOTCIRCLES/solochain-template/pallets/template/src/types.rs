
use crate::*;
use frame_support::BoundedVec;
use frame_support::pallet_prelude::*;
use frame_system::pallet_prelude::*;

#[derive(Encode, Decode, Clone, PartialEq, Eq, TypeInfo, Debug)]
#[scale_info(skip_type_params(T))]
pub struct RoscaDetails<T: Config> {
    pub random_order: bool,
    pub number_of_participants: u32,
    pub minimum_participant_threshold: u32,
    // pub security_deposit_amount: u32,
    pub contribution_amount: u32,
    pub contribution_frequency: BlockNumberFor<T>,
    pub start_by_block: BlockNumberFor<T>,
    pub name: BoundedVec<u8, <T as Config>::StringLimit>,
}

// #[derive(Encode, Decode, Clone, PartialEq, Eq, TypeInfo, Debug)]
// #[scale_info(skip_type_params(T))]
// pub struct Rosca<T: Config> {
//     pub id: u32, 
//     pub participants: BoundedVec<AccountIdOf<T>, T::MaxParticipants>, 
//     pub ordered: bool, 
//     pub contribution_amount: BalanceOf<T>, 
//     pub contribution_frequency: BlockNumberFor<T>, 
//     pub start_block: BlockNumberFor<T>,
//     pub next_cycle_block: BlockNumberFor<T>,
//     pub organiser: AccountIdOf<T>,
//     pub cycles_complete: u32,
//     pub current_recipient_index: u32
// }