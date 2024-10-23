pub mod _entities;
pub mod assets_issues;
pub mod assets_nfts;
pub mod pfxassets;
pub mod wallets;

use loco_rs::prelude::{DatabaseConnection, Error, Result};

pub async fn check_account_exists(db: &DatabaseConnection, account_id: &str) -> Result<()> {
    _entities::wallets::Model::find_by_account_id(db, account_id)
        .await
        .map_err(|_| Error::string("wallet account not exists"))?;
    Ok(())
}
