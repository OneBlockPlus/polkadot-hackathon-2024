use super::_entities::wallets::{self, ActiveModel, Entity, Model};
use loco_rs::prelude::*;
pub type Wallets = Entity;

impl ActiveModelBehavior for ActiveModel {
    // extend activemodel below (keep comment for generators)
}

impl Model {
    pub async fn find_by_account_id(
        db: &DatabaseConnection,
        account_id: &str,
    ) -> ModelResult<Self> {
        let wallet = Entity::find()
            .filter(
                model::query::condition()
                    .eq(wallets::Column::AccountId, account_id)
                    .build(),
            )
            .one(db)
            .await?;
        wallet.ok_or_else(|| ModelError::EntityNotFound)
    }
}
