
use frame_support::pallet_prelude::*;


use super::*;



#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug, TypeInfo)]
#[scale_info(skip_type_params(T))]
pub struct FEED {
	pub feed_id: u32,

    pub date: u64,
    pub feed_type: String,
    pub data: String
}

impl FEED {
    pub fn new(
		feed_id: u32,
		date: u64,
		feed_type: String,
		data: String
    ) -> Self {
        FEED {
            feed_id,
            date:date,
			feed_type:feed_type,
			data:data
        }
    }
}


