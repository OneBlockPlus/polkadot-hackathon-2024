
use frame_support::pallet_prelude::*;


use super::*;



#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug, TypeInfo)]
#[scale_info(skip_type_params(T))]
pub struct DAO {
	pub id: u32,

    pub dao_uri: String,
    pub dao_wallet: String,
    pub finished: String
}

impl DAO {
    pub fn new(
		id: u32,
		dao_uri: String,
		dao_wallet: String,
		finished: String
    ) -> Self {
        DAO {
            id,
            dao_uri:dao_uri,
			dao_wallet:dao_wallet,
			finished:finished
        }
    }
}




#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug, TypeInfo)]
#[scale_info(skip_type_params(T))]
pub struct JOINED {
	pub id: u32,

    pub daoid: u32,
    pub user_id: u32,
    pub joined_date:String
}

impl JOINED {
    pub fn new(
         id: u32,
         daoid: u32,
         user_id: u32,
         joined_date: String
    ) -> Self {
        JOINED {
            id,
            daoid:daoid,
			user_id:user_id,
            joined_date:joined_date
        }
    }
}


