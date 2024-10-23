use super::_entities::assets_issues::{ActiveModel, Entity, Model};
use loco_rs::prelude::ModelResult;
use sea_orm::entity::prelude::*;
use serde::{Deserialize, Serialize};
pub type AssetsIssues = Entity;

impl ActiveModelBehavior for ActiveModel {
    // extend activemodel below (keep comment for generators)
}

#[derive(Debug, Clone, PartialEq, Eq, EnumIter, DeriveActiveEnum, Serialize, Deserialize)]
#[sea_orm(rs_type = "i32", db_type = "Integer")]
pub enum IssueState {
    #[sea_orm(num_value = 0)]
    Waiting,
    #[sea_orm(num_value = 1)]
    Sealing,
    #[sea_orm(num_value = 2)]
    Sealed,
    #[sea_orm(num_value = 3)]
    Minting,
    #[sea_orm(num_value = 4)]
    Issued,
}

impl Model {
    pub fn check_sealed_before_mint(&self, force_if_minting: bool) -> loco_rs::Result<()> {
        if self.state != IssueState::Sealed {
            if self.state == IssueState::Minting && force_if_minting {
                return Ok(());
            }
            return Err(loco_rs::Error::string("assets issue must be sealed first"));
        }
        Ok(())
    }
}

impl ActiveModel {
    pub async fn set_issued(self, db: &DatabaseConnection) -> ModelResult<Model> {
        self.set_issue_state(db, IssueState::Issued).await
    }

    pub async fn set_issue_state(
        mut self,
        db: &DatabaseConnection,
        state: IssueState,
    ) -> ModelResult<Model> {
        self.state = sea_orm::Set(state);
        Ok(self.update(db).await?)
    }
}
