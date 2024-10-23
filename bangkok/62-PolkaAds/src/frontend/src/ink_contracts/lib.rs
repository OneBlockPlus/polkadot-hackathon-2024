#![cfg_attr(not(feature = "std"), no_std, no_main)]
#![allow(non_snake_case)]
#![allow(non_camel_case_types)]
#![allow(dead_code)]
#![allow(clippy::arithmetic_side_effects)]

#[ink::contract]
mod ytpurchase {

    use ink::{prelude::format, prelude::string::String, prelude::vec::Vec};

    use ink::storage::Mapping;
    use scale::{Decode, Encode};
    // region: All stucts
    #[derive(Debug, PartialEq, Eq, Encode, Decode)]
    #[cfg_attr(feature = "std", derive(ink::storage::traits::StorageLayout, scale_info::TypeInfo))]
    pub struct purchase_struct {
        purchase_id: i32,
        videoId: String,
        adId: String,
        wallet: AccountId,
        receiveWallet: AccountId,
        date:u64,
        price: u128,
        meta: String,
    }

    // endregion: All stucts

    // region: Initialize
    #[ink(storage)]
    pub struct YTpurchase {
        //Variables
        _PurchaseIds: i32,
        _TotalAmounts:u128,
        //Variables Multiples
        _purchaseMap: Mapping<i32, purchase_struct>,
        _walletEarned: Mapping<AccountId, u128>
    }

    impl YTpurchase {
        /// Constructor that initializes
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                //Variables
                _PurchaseIds: 0,
                _TotalAmounts: 0,
                //Variables Multiples
                _purchaseMap: Mapping::new(),
                _walletEarned: Mapping::new(),
            }
        }

        /// Constructors can delegate to other constructors.
        #[ink(constructor)]
        pub fn default() -> Self {
            Self::new()
        }
        // endregion: Initialize

        #[ink(message)]  
        #[ink(payable)]
        pub fn Purchase(&mut self, adId:String,videoId: String, wallet: AccountId, price: u128, receiveWallet: AccountId, date: u64, meta: String) {
            
            let stuff = purchase_struct {
                purchase_id: self._PurchaseIds,
                adId: adId,
                videoId: videoId,
                wallet: wallet,
                receiveWallet:receiveWallet,
                price: price.clone(),
                date: date,
                meta:meta
            };
            self._TotalAmounts += price.clone();
            self._purchaseMap.insert(self._PurchaseIds, &stuff);
            self._PurchaseIds = self._PurchaseIds.clone() + 1;
            if self._walletEarned.contains(receiveWallet) {
                let mut earnedAmount = self._walletEarned.get(receiveWallet).unwrap();
                earnedAmount += price.clone();
                
                self._walletEarned.insert(receiveWallet, &earnedAmount);
            }else{
                
                self._walletEarned.insert(receiveWallet, &price.clone());

            }

        }
       
        #[ink(message)]
        pub fn WithDrawAmount(&mut self, wallet: AccountId, amount: u128) {
            assert!(self.env().transfer(wallet, amount).is_ok());

            let mut earnedAmount = self._walletEarned.get(wallet).unwrap();
            earnedAmount -= amount;        

            self._walletEarned.insert(wallet, &earnedAmount);
        }

        #[ink(message)]
        pub fn getUserPurchasedByWallet(&mut self,wallet: AccountId) -> Vec<i32> {
            let mut result: Vec<i32> = Vec::new();

            for i in 0..(self._PurchaseIds) {
                let v = self._purchaseMap.get(i).unwrap();
                if v.receiveWallet == wallet {
                    result.push(i);
                }
            }
            return result;
        }  
       
        
        // regiion: GetAllVariables
        #[ink(message)]
        pub fn _PurchaseIds(&mut self) -> i32 {
            return self._PurchaseIds;
        }  
        #[ink(message)]
        pub fn _TotalAmounts(&mut self) -> u128 {
            return self._TotalAmounts;
        }     
         #[ink(message)]
        pub fn _purchaseMap(&mut self, id: i32) -> purchase_struct {
            return self._purchaseMap.get(id).unwrap();
        }
   
         #[ink(message)]
        pub fn _walletEarned(&mut self, wallet: AccountId) -> u128 {
            return self._walletEarned.get(wallet).unwrap();
        }
        // endregion: GetAllVariables

       
        // region: Delete
        #[ink(message)]
        pub fn reset_all(&mut self) {
            self._PurchaseIds = 0;
            self._TotalAmounts = 0;

            //Variables
            self._purchaseMap = Mapping::new();
            self._walletEarned = Mapping::new();
        }

        // endregion: Delete


    }

    /// Unit tests in Rust are normally defined within such a `#[cfg(test)]`
    /// module and test functions are marked with a `#[test]` attribute.
    /// The below code is technically just normal Rust code.
    #[cfg(test)]
    mod tests {
        /// Imports all the definitions from the outer scope so we can use them here.
        use super::*;
        use ink_env;

     

        #[ink::test]
        fn PurchaseTest() {
            let mut ytpurchase = YTpurchase::new();
            // *----------------Purchase------------------*
            ytpurchase.Purchase(String::from("1"), String::from("testwallet"), 100000, String::from("description"));
            ytpurchase.Purchase(String::from("2"), String::from("testwallet"), 100000, String::from("description"));
            assert_eq!(ytpurchase._PurchaseIds, 2);
            assert_eq!(ytpurchase._TotalAmounts, 200000);

            // *----------------Delete------------------*
            ytpurchase.reset_all();
            assert_eq!(ytpurchase._PurchaseIds, 0);
            assert_eq!(ytpurchase._TotalAmounts, 0);
            assert_eq!(ytpurchase._purchaseMap.get(0), None);
        }
    }
}
