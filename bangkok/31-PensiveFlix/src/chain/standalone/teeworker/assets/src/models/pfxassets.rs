use super::_entities::pfxassets::{self, ActiveModel, Entity, Model};
use loco_rs::prelude::*;
pub type Pfxassets = Entity;

impl ActiveModelBehavior for ActiveModel {
    // extend activemodel below (keep comment for generators)
}

impl Model {
    pub async fn find_by_assets_id(db: &DatabaseConnection, assets_id: &str) -> ModelResult<Self> {
        let entity = Entity::find()
            .filter(
                model::query::condition()
                    .eq(pfxassets::Column::AssetsId, assets_id)
                    .build(),
            )
            .one(db)
            .await?;
        entity.ok_or_else(|| ModelError::EntityNotFound)
    }
}
