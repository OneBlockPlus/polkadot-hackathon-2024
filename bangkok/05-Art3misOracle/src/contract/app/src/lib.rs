#![no_std]
#![allow(clippy::new_without_default)]

use sails_rs::prelude::*;
mod services;
use services::extended_vnft::ExtendedService;
pub struct Program(());

#[program]
impl Program {
    pub fn new(name: String, symbol: String) -> Self {
        ExtendedService::init(name, symbol);
        Self(())
    }

    pub fn vnft(&self) -> ExtendedService {
        ExtendedService::new()
    }
}
