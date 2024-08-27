#![no_std]
#![allow(clippy::new_without_default)]

use crate::utils::*;
use core::fmt::Debug;
use gstd::{
    collections::{HashMap, HashSet},
    msg, Decode, Encode, String, TypeInfo,
};
use sails_rs::{prelude::*};
pub mod funcs;
pub mod utils;

static mut STORAGE: Option<Storage> = None;

#[derive(Debug, Default)]
pub struct Storage {
    name: String,
    symbol: String,
    owner_by_id: OwnerByIdMap,
    tokens_for_owner: TokensForOwnerMap,
    token_approvals: ApprovalsMap,
}

impl Storage {
    pub fn init(name: String, symbol: String) {
        unsafe {
            STORAGE = Some(Storage {
                name,
                symbol,
                ..Default::default()
            });
            // STORAGE = Some(storage)
        }
    }

    pub fn get_mut() -> &'static mut Self {
        unsafe { STORAGE.as_mut().expect("Storage is not initialized") }
    }
    pub fn get() -> &'static Self {
        unsafe { STORAGE.as_ref().expect("Storage is not initialized") }
    }
    pub fn tokens_for_owner() -> &'static mut HashMap<ActorId, HashSet<TokenId>> {
        let storage = unsafe { STORAGE.as_mut().expect("Storage is not initialized") };
        &mut storage.tokens_for_owner
    }
    pub fn owner_by_id() -> &'static mut HashMap<TokenId, ActorId> {
        let storage = unsafe { STORAGE.as_mut().expect("Storage is not initialized") };
        &mut storage.owner_by_id
    }
    pub fn token_approvals() -> &'static mut HashMap<TokenId, ActorId> {
        let storage = unsafe { STORAGE.as_mut().expect("Storage is not initialized") };
        &mut storage.token_approvals
    }
}

#[derive(Clone, Debug, PartialEq, Eq, PartialOrd, Ord, Encode, Decode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
pub enum Event {
    Transfer {
        from: ActorId,
        to: ActorId,
        token_id: TokenId,
    },
    Approval {
        owner: ActorId,
        approved: ActorId,
        token_id: TokenId,
    },
}

#[derive(Clone)]
pub struct Service();

impl Service {
    pub fn init() -> Self {
        Self()
    }
}

#[service(events = Event)]
impl Service {
    pub fn new() -> Self {
        Self()
    }

    pub fn approve(&mut self, approved: ActorId, token_id: TokenId) {
        let source = msg::source();
        let owner = funcs::owner_of(&Storage::get().owner_by_id, token_id);
        utils::panicking(move || {
            funcs::approve(
                Storage::token_approvals(),
                source,
                owner,
                approved,
                token_id,
            )
        });
        let _ = self.notify_on(Event::Approval {
            owner,
            approved,
            token_id,
        });
    }

    pub fn transfer(&mut self, to: ActorId, token_id: TokenId) {
        let source = msg::source();
        utils::panicking(move || {
            funcs::transfer(
                Storage::token_approvals(),
                Storage::owner_by_id(),
                Storage::tokens_for_owner(),
                source,
                to,
                token_id,
            )
        });

        let _ = self.notify_on(Event::Transfer {
            from: source,
            to,
            token_id,
        });
    }

    pub fn transfer_from(&mut self, from: ActorId, to: ActorId, token_id: TokenId) {
        let source = msg::source();
        utils::panicking(move || {
            funcs::transfer_from(
                Storage::token_approvals(),
                Storage::owner_by_id(),
                Storage::tokens_for_owner(),
                source,
                from,
                to,
                token_id,
            )
        });

        let _ = self.notify_on(Event::Transfer { from, to, token_id });
    }

    pub fn balance_of(&self, owner: ActorId) -> U256 {
        funcs::balance_of(&Storage::get().tokens_for_owner, owner)
    }
    pub fn owner_of(&self, token_id: TokenId) -> ActorId {
        funcs::owner_of(&Storage::get().owner_by_id, token_id)
    }
    pub fn get_approved(&self, token_id: TokenId) -> ActorId {
        Storage::get()
            .token_approvals
            .get(&token_id)
            .copied()
            .unwrap_or_else(ActorId::zero)
    }
    pub fn name(&self) -> &'static str {
        let storage = Storage::get();
        &storage.name
    }
    pub fn symbol(&self) -> &'static str {
        let storage = Storage::get();
        &storage.symbol
    }
}
