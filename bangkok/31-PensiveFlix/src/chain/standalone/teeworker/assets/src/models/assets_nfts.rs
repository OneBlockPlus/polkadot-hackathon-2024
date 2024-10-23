use super::_entities::assets_nfts::{self, ActiveModel, Entity, Model};
use loco_rs::prelude::*;
pub type AssetsNfts = Entity;

impl ActiveModelBehavior for ActiveModel {
    // extend activemodel below (keep comment for generators)
}

impl Model {
    pub async fn find_by_token(db: &DatabaseConnection, token: &str) -> ModelResult<Self> {
        let entity = Entity::find()
            .filter(
                model::query::condition()
                    .eq(assets_nfts::Column::Token, token)
                    .build(),
            )
            .one(db)
            .await?;
        entity.ok_or_else(|| ModelError::EntityNotFound)
    }
}
