
use frame_support::pallet_prelude::*;


use super::*;



#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug, TypeInfo)]
#[scale_info(skip_type_params(T))]
pub struct EventAuction {
	pub id: u32,

    pub dao_id: u32,
    pub user_id: u32,
    pub event_uri: String,
    pub event_wallet: String,
    pub participant: u32 ,
    pub status: String
}


#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug, TypeInfo)]
#[scale_info(skip_type_params(T))]
pub struct TicketHolders{
	pub id:u32,
	pub user_id:u32,
	pub event_id:u32,
	pub dao_id:u32,
	pub date:String
}





#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug, TypeInfo)]
#[scale_info(skip_type_params(T))]
pub struct TokenAuction {
	pub id: u32,

    pub event_id: u32,
    pub dao_id: u32,
    pub token_uri: String,
    pub token_wallet: String,
    pub token_owner: u32,
    pub highest_amount: u64,
    pub highest_bidder: String,
    pub highest_bidder_userid: u32,
    pub highest_bidder_wallet: String,
    pub highest_bid_date: String
}



#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug, TypeInfo)]
#[scale_info(skip_type_params(T))]
pub struct TokenBid {
	pub id: u32,

    pub nft_id: u32,
    pub event_id: u32,
    pub dao_id: u32,
    pub date: String,
    pub bidder: String,
    pub wallet_address: String,
    pub bidder_userid: u32,
    pub bid_amount: u64
}





#[derive(Encode, Decode, Clone, Eq, PartialEq, RuntimeDebug, TypeInfo)]
#[scale_info(skip_type_params(T))]
pub struct DONATION {
	pub id: u32,

    pub event_id: u32,
    pub userid: u32,
    pub donation: u64
}
