#![cfg_attr(not(feature = "std"), no_std, no_main)]
#![allow(clippy::new_without_default)]

#[ink::contract]
mod game_score {
    use ink::storage::Mapping;
    use ink::prelude::vec::Vec;
    use ink::prelude::string::String;

    #[ink(storage)]
    pub struct GameScore {
        owner: AccountId,
        score: Mapping<String, Vec<(AccountId, u32)>>,
        deposit: Mapping<String, Vec<(AccountId, u128)>>,
        ranking: Mapping<String, Vec<AccountId>>,
    }


    impl GameScore {
        #[ink(constructor, payable)]
        pub fn new() -> Self {
            Self {
                owner: Self::env().caller(),
                score: Mapping::default(),
                deposit: Mapping::default(),
                ranking: Mapping::default(),
            }
        }

        #[ink(message)]
        pub fn update_score(&mut self, room_id: String, player: AccountId, new_score: u32) {
            // if self.env().caller() != self.owner {
            //     ink::env::debug_println!("Not owner");
            //     return;
            // }

            let mut scores = self.score.get(&room_id).unwrap_or_default();
            
            if let Some(score) = scores.iter_mut().find(|(p, _)| *p == player) {
                score.1 = new_score;
            } else {
                scores.push((player, new_score));
            }

            scores.sort_by(|a, b| b.1.cmp(&a.1));
            self.score.insert(&room_id, &scores);

            let ranking: Vec<AccountId> = scores.iter().map(|(p, _)| *p).collect();
            self.ranking.insert(&room_id, &ranking);
        }

        #[ink(message, payable)]
        pub fn join_game(&mut self, room_id: String) {
            let caller = self.env().caller();
            let stake = self.env().transferred_value();


            if stake < 1 {
                ink::env::debug_println!("InsufficientStake");
                return;
            }

            let mut deposits = self.deposit.get(&room_id).unwrap_or_default();
            
            if let Some(score) = deposits.iter_mut().find(|(p, _)| *p == caller) {
                ink::env::debug_println!("has deposit");
            } else {
                deposits.push((caller, stake));
            }
            self.deposit.insert(&room_id, &deposits);
        }

        #[ink(message)]
        pub fn give_me(&mut self, value: Balance) {
            ink::env::debug_println!("requested value: {}", value);
            ink::env::debug_println!("contract balance: {}", self.env().balance());

            assert!(value <= self.env().balance(), "insufficient funds!");

            if self.env().transfer(self.env().caller(), value).is_err() {
                panic!(
                    "requested transfer failed. this can be the case if the contract does not\
                     have sufficient free funds or if the transfer would have brought the\
                     contract's balance below minimum balance."
                )
            }
        }

        #[ink(message)]
        pub fn end_game(&mut self, room_id: String, winner: AccountId) {
            // if self.env().caller() != self.owner {
            //     ink::env::debug_println!("Not owner");
            //     return;
            // }
    
            let deposits = self.deposit.get(&room_id).unwrap_or_else(|| Vec::new());

            let last_index = deposits.len().saturating_sub(1);
            let total_stake: u128 = if deposits.is_empty() {
                0
            } else {
                // 计算除最后一名玩家外的所有押金总和
                deposits[0..last_index].iter().map(|(_, stake)| stake).sum()
            };
            assert!(total_stake <= self.env().balance(), "insufficient funds!");

            // 转账奖励给胜者
            if self.env().transfer(winner, total_stake).is_err() {
                panic!(
                    "Transfer failed. The contract may not have sufficient funds or \
                     the transfer would bring the contract's balance below the minimum."
                );
            }

            // 清除该房间的 deposit 记录
            self.deposit.remove(&room_id);

            ink::env::debug_println!("Game ended. Winner: {:?}, Reward: {}", winner, total_stake);
        }

        #[ink(message)]
        pub fn get_room_score(&self, room_id: String) -> Vec<(AccountId, u32)> {
            // if self.env().caller() != self.owner {
            //     ink::env::debug_println!("Not owner");
            //     return Vec::new();
            // }
            self.score.get(&room_id).unwrap_or_default()
        }

        #[ink(message)]
        pub fn get_room_ranking(&self, room_id: String) -> Vec<AccountId> {
            // if self.env().caller() != self.owner {
            //     ink::env::debug_println!("Not owner");
            //     return Vec::new();
            // }
            self.ranking.get(&room_id).unwrap_or_default()
        }

        #[ink(message)]
        pub fn get_room_deposit(&self, room_id: String) -> Vec<(AccountId, u128)> {
            self.deposit.get(&room_id).unwrap_or_default()
        }
    }
}