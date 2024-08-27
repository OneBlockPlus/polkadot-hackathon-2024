// use gstd::{collections::HashMap, msg};
use sails_rs::prelude::*;

#[derive(Encode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
#[derive(Default, Clone)]
pub struct ImprintStream {
    pub race_name: &'static str,
    pub max_lumimemories: u128,
    pub mint_at: u32,
    pub story: &'static str,
    pub lumimemories: u64,
    pub open_story: Vec<u16>,
    pub start_at: u32,
}
