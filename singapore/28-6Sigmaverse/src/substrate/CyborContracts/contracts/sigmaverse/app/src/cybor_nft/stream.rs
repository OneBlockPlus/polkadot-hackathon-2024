// use gstd::{collections::HashMap, msg};
use sails_rs::prelude::*;

#[derive(Encode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
#[derive(Default, Clone)]
pub struct CyborStream {
    pub race_name: &'static str,
    pub basic_damage: u32,
    pub basic_hp: u32,
    pub basic_move_speed: u8,
    pub basic_knockdown_hit: u8,
    pub score_per_block: u64,

    pub is_have_finishing_skill: bool,
    pub mint_at: u32,
    pub image: String,

    pub level: u16,
    pub grade: u16,
    pub lucky: u32,

    pub is_freeze: bool,
}
