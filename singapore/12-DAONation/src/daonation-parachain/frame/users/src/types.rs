
use frame_support::pallet_prelude::*;


use super::*;
use scale_info::prelude::string::String;



#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug, TypeInfo)]
#[scale_info(skip_type_params(T))]
#[derive(Default)]
pub struct User {
	pub id: u32,

    pub full_name: String,
    pub email: String,
    pub password: String,
    pub img_ipfs: String,
	pub wallet_type: String,
	pub wallet_address: String
}

impl User {
    pub fn new(
		id: u32,
		full_name: String,
		email: String,
		password: String,
		img_ipfs: String
    ) -> Self {
        User {
            id,
            full_name:full_name,
			email:email,
			password:password,
			img_ipfs:img_ipfs,
			wallet_type:String::from("evm"),
			wallet_address:String::from(""),
        }
    }


}
