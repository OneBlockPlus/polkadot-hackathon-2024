
use frame_support::pallet_prelude::*;


use super::*;



#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug, TypeInfo)]
#[scale_info(skip_type_params(T))]
pub struct GOAL {
	pub id: u32,

    pub dao_id: u32,
    pub goal_uri: String
}

impl GOAL {
    pub fn new(
		id: u32,
		dao_id: u32,
		goal_uri: String
    ) -> Self {
        GOAL {
            id,
            dao_id:dao_id,
			goal_uri:goal_uri
        }
    }
}


