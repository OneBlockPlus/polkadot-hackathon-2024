#![cfg_attr(not(feature = "std"), no_std, no_main)]
#![allow(non_snake_case)]
#![allow(non_camel_case_types)]
#![allow(dead_code)]
#![allow(clippy::arithmetic_side_effects)]

#[ink::contract]
mod polkagift {

    use ink::{prelude::format, prelude::string::String,prelude::string::ToString, prelude::vec::Vec, };

    use ink::storage::Mapping;
    use scale::{Decode, Encode};
    // region: All stucts
    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout, scale_info::TypeInfo))]
    pub struct highest_bidder_struct {
        token_id: String,
        event_id: String,
        wallet: AccountId,
        price: String
    }

  

    // endregion: All stucts

    // region: Initialize
    #[ink(storage)]
    pub struct PolkaGift {
        //Variables
        _tokenIds: i32,
        _bidIds: i32,
        _eventIds: i32,
        _EventTokenIds: i32,
        _TokenBidIds: i32,
        _TokenHighestBidIds: i32,
        _EventTokenSearchIds: i32,
        //Variables Multiples
        AllEventEnded: Mapping<String, bool>,
        AllEventTokens: Mapping<i32, Vec<String>>,
        AllTokensBids:  Mapping<i32, Vec<String>>,
        TokenHighestBidders: Mapping<i32, highest_bidder_struct>,
        _bidURIs: Mapping<String, String>,
        _tokenURIs: Mapping<String, String>,
        _eventURIs:  Mapping<String, Vec<String>>,
        _eventRaised: Mapping<String, String>
        
    }

    impl PolkaGift {
        /// Constructor that initializes
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                //Variables
                _tokenIds: 0,
                _bidIds: 0,
                _eventIds: 0,
                _EventTokenIds: 0,
                _TokenBidIds: 0,
                _TokenHighestBidIds: 0,
                _EventTokenSearchIds: 0,

                //Variables Multiples
                AllEventEnded: Mapping::new(),
                AllEventTokens: Mapping::new(),
                AllTokensBids: Mapping::new(),
                TokenHighestBidders: Mapping::new(),
                _bidURIs: Mapping::new(),
                _tokenURIs: Mapping::new(),
                _eventURIs: Mapping::new(),
                _eventRaised: Mapping::new()
            }
        }

        /// Constructors can delegate to other constructors.
        #[ink(constructor)]
        pub fn default() -> Self {
            Self::new()
        }
        // endregion: Initialize
        // region: Users
        #[ink(message)]
        pub fn claimToken(&mut self, _claimer: AccountId, _tokenURI: String, _eventid: String) {


            self._tokenURIs.insert(format!("p_{}", self._tokenIds), &_tokenURI);
            
            self._setTokenEvent(self._EventTokenIds,_eventid,_tokenURI);

            self._tokenIds += 1;
            self._EventTokenIds += 1;
        }
        pub fn _setTokenEvent(&mut self,EventTokenId :  i32, EventId:String, _tokenURI:String){
              
            let mut result: Vec<String> = Vec::new();
            result.push(EventId);
            result.push(_tokenURI);            

            self.AllEventTokens.insert(EventTokenId,&result);
        }

         #[ink(message)]
        pub fn createEvent(&mut self, _eventWallet: String, _eventURI: String, endtime: String) {

            
            let new_event_id = format!("p_{}", self._eventIds);

            let mut result: Vec<String> = Vec::new();
            result.push(_eventWallet);
            result.push(_eventURI);            

            self._eventURIs.insert(new_event_id.clone() ,&result);

            self._setEventRaised(new_event_id.clone(), format!("{}", 0) );
                      

            self.AllEventEnded.insert(new_event_id, &false);
            
            self._eventIds += 1;
        }

        
        #[ink(message)]
        pub fn distribute_event(&mut self, eventID: String) {

            self.AllEventEnded.insert(eventID.clone(), &false);

        }


        pub fn _setTokenHighestBid(&mut self, token_id:String,event_id:String, wallet:AccountId,bid_price:String){
           let stuff = highest_bidder_struct{
            token_id: token_id.clone(),
            event_id: event_id.clone(),
            wallet: wallet.clone(),
            price: bid_price
           };

           let old_id = self.getTokenHighestBid(token_id.clone());
           if (old_id != "-1"){
            let int_id: i32 = old_id.parse().unwrap();

            self.TokenHighestBidders.insert(int_id.clone(),&stuff);              
           }else{
            self.TokenHighestBidders.insert(self._TokenHighestBidIds,&stuff);
            self._TokenHighestBidIds += 1;
           }

            
        }

        #[ink(message)]
        pub fn _setEventRaised(&mut self, _eventId:String, _raised:String){

            self._eventRaised.insert(_eventId.clone(), &_raised );
        }

        pub fn _setTokenBid(&mut self, TokenBidId:i32, TokenId:String, _BidURI:String){
            
            let mut result: Vec<String> = Vec::new();
            result.push(TokenId);
            result.push(_BidURI); 
            self.AllTokensBids.insert(TokenBidId.clone(), &result );
        }

         #[ink(message)]
        pub fn createBid(&mut self, _tokenId: String, _bidURI: String,  _eventid: String, _raised: String, _bid_price: String) {

            
       
           
            self._setTokenHighestBid(_tokenId.clone(),_eventid.clone(),self.env().caller(),_bid_price.clone());

;
            self._setEventRaised(_eventid.clone(), _raised);
            
            
            self._setTokenBid(self._TokenBidIds, _tokenId.clone(), _bidURI);


            self._TokenBidIds += 1;
            self._bidIds += 1;

        }

        
        #[ink(message)]
        pub fn gettokenIdByUri(&mut self, _tokenURI: String) -> String {
            for i in 0..(self._tokenIds) {
                let v = self._tokenURIs.get(format!("p_{}", i)).unwrap();
                if (v == _tokenURI){
                    return format!("p_{}", i);
                }
            }
            return format!("{}", "0");
        }
     

        #[ink(message)]
        pub fn getTokenHighestBid(&mut self, token_id: String) -> String {
            for i in 0..(self._TokenHighestBidIds) {
                let v = self.TokenHighestBidders.get(i).unwrap();
                if (v.token_id == token_id){
                    return format!("{}", i);
                }
            }
            return format!("{}", "-1");
        }
        #[ink(message)]
        pub fn getEventIdByURI(&mut self, _eventURI: String) -> String {
            for i in 0..(self._eventIds) {
                let v = self._eventURIs.get(format!("p_{}", i)).unwrap();
                if ((*v.get(1).unwrap()).to_string() == _eventURI){
                    return format!("p_{}", i);
                }
            }
            return format!("{}", "0");
        }
        
        #[ink(message)]
        pub fn getBidIdByUri(&mut self, _bidURI: String) -> String {
            for i in 0..(self._bidIds) {
                let v = self._bidURIs.get(format!("p_{}", i)).unwrap();
                if (v == _bidURI){
                    return format!("p_{}", i);
                }
            }
            return format!("{}", "0");
        }

        #[ink(message)]
        pub fn gettokenSearchEventTotal(&mut self, EventID: String) -> Vec<String> {
            let mut result: Vec<String> = Vec::new();
        
            for i in 0..(self._EventTokenIds) {
                let v = self.AllEventTokens.get(i).unwrap();
                if format!("{}", v.get(0).unwrap()) == format!("{}", EventID)  {

                    result.push((*v.get(1).unwrap()).to_string());
                    
                }
            }

            return result;
        }


        
        #[ink(message)]
        pub fn getSearchEventbyWallet(&mut self, Wallet: String) -> Vec<String> {
            let mut result: Vec<String> = Vec::new();
        
            for i in 0..(self._eventIds) {
                let v = self._eventURIs.get(format!("{}", i.clone())).unwrap();
                if format!("{}", v.get(0).unwrap()) == format!("{}", Wallet)  {

                    result.push((*v.get(1).unwrap()).to_string());
                    
                }
            }

            return result;
        }

        #[ink(message)]
        pub fn getGetEventsTokenID(&mut self, EventId: String,_tokenURI: String) ->i32 {
        
            for i in 0..(self._EventTokenIds) {
                let v = self.AllEventTokens.get(i).unwrap();
                if format!("{}", v.get(0).unwrap()) == format!("{}", EventId)  && format!("{}", (*v.get(1).unwrap()).to_string()) == format!("{}", _tokenURI)   {

                   return i;
                    
                }
            }

            return 0;
        }

        #[ink(message)]
        pub fn totalEvent(&mut self) -> i32 {
            return self._eventIds;
        }
        #[ink(message)]
        pub fn totalSupply(&mut self) -> i32 {
            return self._tokenIds;
        }
        #[ink(message)]
        pub fn getTotalBid(&mut self, TokenID:String ) -> Vec<String> {
            let mut result: Vec<String> = Vec::new();
        
            for i in 0..(self._TokenBidIds) {
                let v = self.AllTokensBids.get(i).unwrap();
                if format!("{}", v.get(0).unwrap()) == format!("{}", TokenID)  {

                    result.push((*v.get(1).unwrap()).to_string());
                    
                }
            }

            return result;
        }





        // regiion: GetAllVariables
       

        #[ink(message)]
        pub fn _AllEventEnded(&mut self, id: String) -> bool {
            return self.AllEventEnded.get(id).unwrap();
        }
      
        #[ink(message)]
        pub fn _bidURI(&mut self, id: String) -> String {
            return self._bidURIs.get(id).unwrap();
        }

        #[ink(message)]
        pub fn _tokenURI(&mut self, id: String) -> String {
            return self._tokenURIs.get(id).unwrap();
        }
   
        #[ink(message)]
        pub fn _eventURI(&mut self, id: String) -> Vec<String> {
            return self._eventURIs.get(id).unwrap();
        }
   
        #[ink(message)]
        pub fn TokenHighestBidder(&mut self, id: i32) -> highest_bidder_struct {
            return self.TokenHighestBidders.get(id).unwrap();
        }
   
   
        #[ink(message)]
        pub fn _eventRaised(&mut self, id: String) -> String{
            return self._eventRaised.get(id).unwrap();
        }
   
   
   
        // endregion: GetAllVariables

        // region: Delete
     
        #[ink(message)]
        pub fn reset_all(&mut self) {
           *self =  PolkaGift::new();
        }

        // endregion: Delete
    }
}