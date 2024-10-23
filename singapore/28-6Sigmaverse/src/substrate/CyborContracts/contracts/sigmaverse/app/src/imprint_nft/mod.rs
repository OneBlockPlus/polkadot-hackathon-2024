use imprint_template::ImprintTemplate;

use crate::cybor_nft::CyborRace;

use gstd::{
    collections::{HashMap, HashSet},
    exec, msg,
};
use sails_rs::{cell::RefCell, prelude::*};
use stream::ImprintStream;
// use sigmaverse_gamestate::SigmaverseGameData;
use vnft_service::{
    utils::{panic, TokenId},
    Service as BaseVnftService, Storage,
};


mod imprint_template;
mod stream;

const ZERO_ID: ActorId = ActorId::zero();

#[derive(Encode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
#[derive(Default, Clone)]
pub struct ImprintMetadata {
    pub race: CyborRace,
    pub imprint_template: ImprintTemplate,
    pub mint_at: u32,
    pub image: String,
}

#[derive(Default)]
struct ImprintDynamic {
    lumimemories: u128,
    open_story: Vec<u16>,
    start_at: u32,
}

#[derive(Default)]
pub struct ImprintState {
    metadata_by_id: HashMap<TokenId, ImprintMetadata>,
    dynamic_by_id: HashMap<TokenId, ImprintDynamic>,
    current_imprint_id: TokenId,
}

impl ImprintState {
    pub fn new(name: String, symbol: String) -> Self {
        Storage::init(name, symbol);

        Self {
            ..Default::default()
        }
    }
}

#[derive(Encode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
pub enum ImprintEvents {
    Minted {
        to: ActorId,
        value: TokenId,
        next_id: TokenId,
        len_by_minted: u32,
    },
    Burned {
        from: ActorId,
        value: TokenId,
    },
    Deposit {
        from: ActorId,
        value: TokenId,
    },
    Withdraw {
        from: ActorId,
        value: TokenId,
    },
    Combine {
        from: ActorId,
        value: TokenId,
    },
    DEBUG {
        value: DebugInfo,
    },
}

pub struct ImprintNFTService {
    vnft: BaseVnftService,
    state: &'static RefCell<ImprintState>,
}

#[derive(Encode, TypeInfo, Default, Clone)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
pub struct DebugInfo {
    pub source: ActorId,
    pub value: u128,
    pub temp: ImprintTemplate,
    pub minted_count: u128,
    pub owner_by_id: Vec<(TokenId, ActorId)>,
    pub token_group_by_owner_len: u128,
    pub my_tokens1: Vec<TokenId>,
    pub my_tokens2: Vec<TokenId>,
    pub next_token_id: TokenId,
}

#[service(extends = BaseVnftService, events = ImprintEvents)]
impl ImprintNFTService {
    pub fn init(state: &'static RefCell<ImprintState>) -> Self {
        Self {
            vnft: <BaseVnftService>::init(),
            state: state,
        }
    }

    pub fn debug_info(&self, race: CyborRace) -> DebugInfo {
        let owner_by_id = Storage::owner_by_id();
        let v_owner_by_id: Vec<(TokenId, ActorId)> = owner_by_id
            .iter()
            .map(|(hash, actor_id)| (*hash, *actor_id))
            .collect();

        let mut d = DebugInfo {
            source: msg::source(),
            value: msg::value(),
            owner_by_id: v_owner_by_id,
            minted_count: owner_by_id.len() as u128,
            ..Default::default()
        };

        let imprint_temp: Option<&ImprintTemplate> = match race {
            CyborRace::Rodriguez => Some(&imprint_template::IMPRINT_RODRIGUEZ),
            CyborRace::Nguyen => Some(&imprint_template::IMPRINT_NGUYEN),
        };

        if let Some(template) = imprint_temp {
            d.temp = template.clone();
        } else {
            d.temp = ImprintTemplate {
                race_name: "NotFound",
                ..Default::default()
            }
        }

        let mut tokens1: Vec<TokenId> = Vec::new();
        let tokens_for_owner = Storage::tokens_for_owner();
        d.token_group_by_owner_len = tokens_for_owner.len() as u128;

        if let Some(ref tokens) = tokens_for_owner.get(&d.source) {
            for token_id in tokens.iter() {
                tokens1.insert(0, token_id.clone())
            }
        }
        d.my_tokens1 = tokens1;

        let mut tokens2: Vec<TokenId> = Vec::new();
        if let Some(tokens) = tokens_for_owner.get(&d.source) {
            for token_id in tokens.iter() {
                tokens2.insert(0, token_id.clone())
            }
        }
        d.my_tokens2 = tokens2;

        let imprint_state = self.state.borrow();
        d.next_token_id = imprint_state.current_imprint_id;

        d
    }

    pub fn get_template(&mut self, race: CyborRace) -> ImprintTemplate {
        let imprint_temp: Option<&ImprintTemplate> = match race {
            CyborRace::Rodriguez => Some(&imprint_template::IMPRINT_RODRIGUEZ),
            CyborRace::Nguyen => Some(&imprint_template::IMPRINT_NGUYEN),
        };

        if let Some(template) = imprint_temp {
            template.clone()
        } else {
            ImprintTemplate {
                race_name: "NotFound",
                ..Default::default()
            }
        }
    }

    pub fn mint(&mut self, race: CyborRace) {
        let to = msg::source();
        if to == ZERO_ID {
            panic("ImprintNFT: zero address");
        }

        let mut imprint_state = self.state.borrow_mut();
        if imprint_state.metadata_by_id.len() >= 1000000 {
            panic("ImprintNFT: all the Imprint have been released to the market");
        }

        let imprint_temp: Option<&ImprintTemplate> = match race {
            CyborRace::Rodriguez => Some(&imprint_template::IMPRINT_RODRIGUEZ),
            CyborRace::Nguyen => Some(&imprint_template::IMPRINT_NGUYEN),
        };

        if let Some(template) = imprint_temp {
            let v = msg::value();

            if v < template.price {
                panic(
                    format!(
                        "ImprintNFT: incorrect value, input price{:?}, temp price:{:?}",
                        v, template.price
                    )
                    .as_str(),
                );
            }

            let tid = imprint_state.current_imprint_id.clone();

            // metadata_by_id
            let block_num = exec::block_height();
            imprint_state.metadata_by_id.insert(
                tid,
                ImprintMetadata {
                    race: race,
                    imprint_template: template.clone(),
                    mint_at: block_num,
                    image: String::new(),
                },
            );

            // dynamic_by_id
            imprint_state.dynamic_by_id.insert(
                tid,
                ImprintDynamic {
                    lumimemories: 0,
                    open_story: Vec::new(),
                    start_at: 0,
                },
            );


            let tokens_for_owner = Storage::tokens_for_owner();
            tokens_for_owner
                .entry(to)
                .and_modify(|tokens| {
                    tokens.insert(tid);
                })
                .or_insert_with(|| HashSet::from([tid]));

            let owner_by_id = Storage::owner_by_id();
            owner_by_id.insert(tid, to);

            imprint_state.current_imprint_id += U256::from(1);
            let evt = ImprintEvents::Minted {
                to: to,
                value: tid,
                next_id: imprint_state.current_imprint_id,
                len_by_minted: owner_by_id.len() as u32,
            };

            let _ = self.notify_on(evt);
        } else {
            panic("ImprintNFT: unknown cybor race or no template available");
        }
    }

    pub fn burn(&mut self, token_id: TokenId) {
        let from = msg::source();
        let mut imprint_state = self.state.borrow_mut();

        imprint_state.metadata_by_id.remove(&token_id);
        imprint_state.dynamic_by_id.remove(&token_id);

        let tokens_for_owner = Storage::tokens_for_owner();
        if let Some(tokens) = tokens_for_owner.get_mut(&from) {
            tokens.remove(&token_id);
        }
        let owner_by_id = Storage::owner_by_id();
        owner_by_id.remove(&token_id);

        let token_approvals = Storage::token_approvals();
        token_approvals.remove(&token_id);

        let _ = self.notify_on(ImprintEvents::Burned {
            from,
            value: token_id,
        });
    }

    pub fn deposit(&mut self, token_id: TokenId) {
        let owner_by_id = Storage::owner_by_id();
        if let Some(&owner) = owner_by_id.get(&token_id) {
            if msg::source() == owner {
                let mut imprint_state = self.state.borrow_mut();
                imprint_state.dynamic_by_id.get_mut(&token_id).unwrap().start_at = exec::block_height();

                let _ = self.notify_on(ImprintEvents::Deposit {
                    from: msg::source(),
                    value: token_id,
                });
            }
        }
    }

    pub fn withdraw(&mut self, token_id: TokenId) {
        let owner_by_id = Storage::owner_by_id();
        if let Some(&owner) = owner_by_id.get(&token_id) {
            if msg::source() == owner {
                let mut imprint_state = self.state.borrow_mut();
                imprint_state.dynamic_by_id.get_mut(&token_id).unwrap().start_at = 0;
                
                let block_height = exec::block_height();
                let start_at = imprint_state.dynamic_by_id.get(&token_id).unwrap().start_at;
                let time_diff = block_height - start_at;
                let lumimemories_per_block = imprint_state.metadata_by_id.get(&token_id).unwrap().imprint_template.lumimemories_per_block as u128;
                let lumimemories = time_diff as u128 * lumimemories_per_block + imprint_state.dynamic_by_id.get(&token_id).unwrap().lumimemories;

                imprint_state.dynamic_by_id.get_mut(&token_id).unwrap().lumimemories = lumimemories;

                let _ = self.notify_on(ImprintEvents::Withdraw {
                    from: msg::source(),
                    value: token_id,
                });
            }
        }
    }

    pub fn imprint_metadata(&self, token_id: TokenId) -> ImprintMetadata {
        let state = self.state.borrow();
        state
            .metadata_by_id
            .get(&token_id)
            .cloned()
            .unwrap_or_default()
    }

    pub fn all_imprints(&self) -> Vec<(TokenId, ImprintMetadata)> {
        let mut new_map: Vec<(TokenId, ImprintMetadata)> = Vec::new();

        let state = self.state.borrow();
        for (token_id, metadata) in state.metadata_by_id.iter() {
            new_map.insert(0, (token_id.clone(), metadata.clone()));
        }
        new_map
    }

    pub fn all_my_imprints(&self) -> Vec<(TokenId, ImprintStream)> {
        let source = msg::source();
        let mut new_map: Vec<(TokenId, ImprintStream)> = Vec::new();

        let state = self.state.borrow();
        let tokens_for_owner = Storage::tokens_for_owner();

        if let Some(ref tokens) = tokens_for_owner.get(&source) {
            for token_id in tokens.iter() {
                let mut resp = ImprintStream::default();

                if let Some(imprint_metainfo) = state.metadata_by_id.get(token_id) {
                    resp.race_name = imprint_metainfo.imprint_template.race_name;
                    resp.max_lumimemories = imprint_metainfo.imprint_template.max_lumimemories;
                    resp.mint_at = imprint_metainfo.mint_at;
                }

                if let Some(imprint_dynamic) = state.dynamic_by_id.get(token_id) {
                    resp.open_story = imprint_dynamic.open_story.clone();
                    resp.lumimemories = imprint_dynamic.lumimemories as u64;
                    resp.start_at = imprint_dynamic.start_at;

                    if resp.start_at > 0 {
                        let block_height = exec::block_height();
                        let start_at = imprint_dynamic.start_at;
                        let time_diff = block_height - start_at;
                        let lumimemories_per_block = state.metadata_by_id.get(token_id).unwrap().imprint_template.lumimemories_per_block as u128;
                        let lumimemories = time_diff as u128 * lumimemories_per_block + imprint_dynamic.lumimemories;
                        resp.lumimemories = lumimemories as u64;
                    }
                }

                new_map.insert(0, (token_id.clone(), resp));
            }
        }
        new_map
    }

    pub fn imprint_info(&self, token_id: TokenId) -> ImprintStream {
        let mut resp = ImprintStream::default();

        let state = self.state.borrow();
        
        if let Some(imprint_metainfo) = state.metadata_by_id.get(&token_id) {
            resp.race_name = imprint_metainfo.imprint_template.race_name;
            resp.max_lumimemories = imprint_metainfo.imprint_template.max_lumimemories;
            resp.mint_at = imprint_metainfo.mint_at;
        }
        if let Some(imprint_dynamic) = state.dynamic_by_id.get(&token_id) {
            resp.open_story = imprint_dynamic.open_story.clone();
            resp.lumimemories = imprint_dynamic.lumimemories as u64;
            resp.start_at = imprint_dynamic.start_at;

            if resp.start_at > 0 {
                let block_height = exec::block_height();
                let start_at = imprint_dynamic.start_at;
                let time_diff = block_height - start_at;
                let lumimemories_per_block = state.metadata_by_id.get(&token_id).unwrap().imprint_template.lumimemories_per_block as u128;
                let lumimemories = (time_diff as u128 * lumimemories_per_block) + imprint_dynamic.lumimemories;
                resp.lumimemories = lumimemories as u64;
            }
        }

        resp
    }
}

impl AsRef<BaseVnftService> for ImprintNFTService {
    fn as_ref(&self) -> &BaseVnftService {
        &self.vnft
    }
}
