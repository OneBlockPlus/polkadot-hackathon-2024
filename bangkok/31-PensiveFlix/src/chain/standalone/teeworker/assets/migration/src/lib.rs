#![allow(elided_lifetimes_in_paths)]
#![allow(clippy::wildcard_imports)]
pub use sea_orm_migration::prelude::*;

mod m20241020_021139_wallets;
mod m20241020_044949_assets_issues;
mod m20241020_135332_pfxassets;
mod m20241020_144616_assets_nfts;
pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![
            Box::new(m20241020_021139_wallets::Migration),
            Box::new(m20241020_044949_assets_issues::Migration),
            Box::new(m20241020_135332_pfxassets::Migration),
            Box::new(m20241020_144616_assets_nfts::Migration),
        ]
    }
}