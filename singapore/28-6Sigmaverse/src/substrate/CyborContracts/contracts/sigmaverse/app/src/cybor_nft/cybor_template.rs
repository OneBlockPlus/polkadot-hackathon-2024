// use gstd::{collections::HashMap, msg};
use sails_rs::prelude::*;

#[derive(Encode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
#[derive(Default, Clone, Debug)]
pub struct CyborTemplate {
    pub race_name: &'static str,
    pub price: u128,
    pub basic_damage: u32,
    pub basic_hp: u32,
    pub basic_move_speed: u8,
    pub basic_knockdown_hit: u8,
    pub score_per_block: u64,
}

pub const RODRIGUEZ: CyborTemplate = CyborTemplate {
    race_name: "rodriguez",
    price: 0,
    basic_damage: 15,
    basic_hp: 1000,
    basic_move_speed: 7,
    basic_knockdown_hit: 4,
    score_per_block: 1
};

pub const NGUYEN: CyborTemplate = CyborTemplate {
    race_name: "nguyen",
    price: 2e+12 as u128,
    basic_damage: 2,
    basic_hp: 1500,
    basic_move_speed: 8,
    basic_knockdown_hit: 1,
    score_per_block: 3
};