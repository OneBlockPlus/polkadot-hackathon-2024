use gstd::{msg, exec};
use sails_rs::{
    collections::{HashMap, HashSet},
    gstd::service,
    prelude::*,
};
mod funcs;
use crate::services;
use vnft_service::utils::TokenId;
use vnft_service::{Service as VnftService, Storage};

#[derive(Default)]
pub struct ExtendedStorage {
    token_id: TokenId,
    minters: HashSet<ActorId>,
    burners: HashSet<ActorId>,
    admins: HashSet<ActorId>,
    token_metadata_by_id: HashMap<TokenId, TokenMetadata>,
}

#[derive(Default, Debug, Encode, Decode, TypeInfo, Clone)]
pub struct TokenMetadata {
    pub name: String,
    pub description: String,
    pub media: String, // URL to associated media, preferably to decentralized, content-addressed storage
    pub reference: String, // URL to an off-chain JSON file with more info
}

static mut EXTENDED_STORAGE: Option<ExtendedStorage> = None;

pub const MAJOR_ARCANA: [&str; 22] = [
    "0 The Fool",
    "I The Magician",
    "II The High Priestess",
    "III The Empress",
    "IV The Emperor",
    "V The Hierophant",
    "VI The Lovers",
    "VII The Chariot",
    "VIII Strength",
    "IX The Hermit",
    "X The Wheel of Fortune",
    "XI Justice",
    "XII The Hanged Man",
    "XIII Death",
    "XIV Temperance",
    "XV The Devil",
    "XVI The Tower",
    "XVII The Star",
    "XVIII The Moon",
    "XIX The Sun",
    "XX Judgement",
    "XXI The World",
];

#[derive(Encode, Decode, TypeInfo)]
pub enum Event {
    Minted {
        to: ActorId,
        token_metadata: TokenMetadata,
    },
    Burned {
        from: ActorId,
        token_id: TokenId,
    },
}
#[derive(Clone)]
pub struct ExtendedService {
    vnft: VnftService,
}

#[cfg(not(test))]
fn get_random_u32() -> u32 {
    let salt = msg::id();
    let (hash, _num) = exec::random(salt.into()).expect("internal error: random call failed");
    u32::from_le_bytes([hash[0], hash[1], hash[2], hash[3]])
}

/// mock for test
#[cfg(test)]
fn get_random_u32() -> u32 {
    0u32
}

static mut SEED: u8 = 0;

pub fn get_random_pos() -> u8 {
    let seed = unsafe { SEED };
    unsafe { SEED = SEED.wrapping_add(1) };
    let mut random_input: [u8; 32] = exec::program_id().into();
    random_input[0] = random_input[0].wrapping_add(seed);
    let (random, _) = exec::random(random_input).expect("Error in getting random number");
    random[0] % 2
}

impl ExtendedService {
    pub fn init(name: String, symbol: String) -> Self {
        let admin = msg::source();
        unsafe {
            EXTENDED_STORAGE = Some(ExtendedStorage {
                admins: [admin].into(),
                minters: [admin].into(),
                burners: [admin].into(),
                ..Default::default()
            });
        };
        ExtendedService {
            vnft: <VnftService>::init(name, symbol),
        }
    }

    pub fn get_mut(&mut self) -> &'static mut ExtendedStorage {
        unsafe {
            EXTENDED_STORAGE
                .as_mut()
                .expect("Extended vft is not initialized")
        }
    }
    pub fn get(&self) -> &'static ExtendedStorage {
        unsafe {
            EXTENDED_STORAGE
                .as_ref()
                .expect("Extended vft is not initialized")
        }
    }
}

#[service(extends = VnftService, events = Event)]
impl ExtendedService {
    pub fn new() -> Self {
        Self {
            vnft: VnftService::new(),
        }
    }
    pub fn mint(&mut self, to: ActorId, token_metadata: TokenMetadata) {
        // if !self.get().minters.contains(&msg::source()) {
        //     panic!("Not allowed to mint")
        // };
        services::utils::panicking(|| {
            funcs::mint(
                Storage::owner_by_id(),
                Storage::tokens_for_owner(),
                &mut self.get_mut().token_metadata_by_id,
                &mut self.get_mut().token_id,
                to,
                token_metadata.clone(),
            )
        });
        self.notify_on(Event::Minted { to, token_metadata })
            .expect("Mint Error");
    }

    pub fn burn(&mut self, from: ActorId, token_id: TokenId) {
        if !self.get().burners.contains(&msg::source()) {
            panic!("Not allowed to burn")
        };
        services::utils::panicking(|| {
            funcs::burn(
                Storage::owner_by_id(),
                Storage::tokens_for_owner(),
                Storage::token_approvals(),
                &mut self.get_mut().token_metadata_by_id,
                token_id,
            )
        });
        self.notify_on(Event::Burned { from, token_id })
            .expect("Burn Error");
    }

    pub fn draw_card(&self) -> String {
        let index = (get_random_u32() as usize) % 22;
        let pos = if(get_random_pos() == 0){"reverse"}else{"upright"};
        let output = MAJOR_ARCANA[index].to_owned() + ", " + pos;
        output.to_string()
    }

    pub fn grant_admin_role(&mut self, to: ActorId) {
        self.ensure_is_admin();
        self.get_mut().admins.insert(to);
    }
    pub fn grant_minter_role(&mut self, to: ActorId) {
        self.ensure_is_admin();
        self.get_mut().minters.insert(to);
    }
    pub fn grant_burner_role(&mut self, to: ActorId) {
        self.ensure_is_admin();
        self.get_mut().burners.insert(to);
    }

    pub fn revoke_admin_role(&mut self, from: ActorId) {
        self.ensure_is_admin();
        self.get_mut().admins.remove(&from);
    }
    pub fn revoke_minter_role(&mut self, from: ActorId) {
        self.ensure_is_admin();
        self.get_mut().minters.remove(&from);
    }
    pub fn revoke_burner_role(&mut self, from: ActorId) {
        self.ensure_is_admin();
        self.get_mut().burners.remove(&from);
    }
    pub fn minters(&self) -> Vec<ActorId> {
        self.get().minters.clone().into_iter().collect()
    }

    pub fn burners(&self) -> Vec<ActorId> {
        self.get().burners.clone().into_iter().collect()
    }

    pub fn admins(&self) -> Vec<ActorId> {
        self.get().admins.clone().into_iter().collect()
    }
    pub fn token_id(&self) -> TokenId {
        self.get().token_id
    }
    pub fn token_metadata_by_id(&self, token_id: TokenId) -> Option<TokenMetadata> {
        self.get().token_metadata_by_id.get(&token_id).cloned()
    }
}

impl ExtendedService {
    fn ensure_is_admin(&self) {
        if !self.get().admins.contains(&msg::source()) {
            panic!("Not admin")
        };
    }
}
impl AsRef<VnftService> for ExtendedService {
    fn as_ref(&self) -> &VnftService {
        &self.vnft
    }
}
