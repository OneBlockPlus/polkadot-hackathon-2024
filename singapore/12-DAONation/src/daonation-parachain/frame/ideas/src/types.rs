
use frame_support::pallet_prelude::*;


use super::*;



#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug, TypeInfo)]
#[scale_info(skip_type_params(T))]
pub struct IDEAS {
	pub id: u32,

    pub dao_id: u32,
    pub goal_id: u32,
    pub ideas_uri: String,
    pub donation: u64
}

impl IDEAS {
    pub fn new(
		id: u32,
		dao_id: u32,
		goal_id: u32,
		ideas_uri: String,
		donation: u64
    ) -> Self {
        IDEAS {
            id,
            dao_id:dao_id,
			goal_id:goal_id,
			ideas_uri:ideas_uri,
			donation:donation
        }
    }
}



#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug, TypeInfo)]
#[scale_info(skip_type_params(T))]
pub struct SmartContract {
	pub id: u32,

    pub ideas_id: String,
    pub smart_contract_uri: String
}

impl SmartContract {
    pub fn new(
		id: u32,
		ideas_id: String,
		smart_contract_uri: String
    ) -> Self {
        SmartContract {
            id,
            ideas_id:ideas_id,
			smart_contract_uri:smart_contract_uri
        }
    }
}



#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug, TypeInfo)]
#[scale_info(skip_type_params(T))]
pub struct DONATION {
	pub id: u32,

    pub ideas_id: String,
    pub userid: String,
    pub donation: u64
}

impl DONATION {
    pub fn new(
		id: u32,
		ideas_id: String,
		userid: String,
		donation: u64,
    ) -> Self {
        DONATION {
            id,
            ideas_id:ideas_id,
			userid:userid,
			donation:donation
        }
    }
}




#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug, TypeInfo)]
#[scale_info(skip_type_params(T))]
pub struct VOTE {
	pub id: u32,

    pub goal_id: String,
    pub ideas_id: String,
    pub user_id: String
}

impl VOTE {
    pub fn new(
		id: u32,
		goal_id: String,
		ideas_id: String,
		user_id: String
    ) -> Self {
        VOTE {
            id,
			goal_id:goal_id,
			ideas_id:ideas_id,
			user_id:user_id
        }
    }
}
