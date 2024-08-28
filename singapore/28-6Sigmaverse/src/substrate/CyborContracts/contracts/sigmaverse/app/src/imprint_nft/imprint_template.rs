// use gstd::{collections::HashMap, msg};
use sails_rs::prelude::*;

#[derive(Encode, TypeInfo)]
#[codec(crate = sails_rs::scale_codec)]
#[scale_info(crate = sails_rs::scale_info)]
#[derive(Default, Clone, Debug)]
pub struct ImprintTemplate {
    pub race_name: &'static str,
    pub max_lumimemories: u128,
    pub story: &'static str,
    pub lumimemories_per_block: u64,
    pub price: u128,
}

pub const IMPRINT_RODRIGUEZ: ImprintTemplate = ImprintTemplate {
    race_name: "rodriguez",
    max_lumimemories: 4,
    story: "rodriguez_story_01,rodriguez_story_02",
    lumimemories_per_block: 1,
    price: 1e+12 as u128,
};

pub const IMPRINT_NGUYEN: ImprintTemplate = ImprintTemplate {
    race_name: "rodriguez",
    max_lumimemories: 4,
    story: "nguyen_story_01,nguyen_story_02",
    lumimemories_per_block: 1,
    price: 1e+12 as u128,
};