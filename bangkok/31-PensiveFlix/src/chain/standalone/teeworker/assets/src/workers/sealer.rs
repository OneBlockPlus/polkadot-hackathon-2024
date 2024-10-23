use std::time::Duration;

use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};
use tokio::time::sleep;

use crate::models::_entities::assets_issues::{Entity as IssueEntity, IssueState};
use crate::seal::*;

pub struct AssetSealWorker {
    pub ctx: AppContext,
}

#[derive(Deserialize, Debug, Serialize)]
pub struct AssetSealArgs {
    pub assets_issue_id: i32,
}

#[async_trait]
impl BackgroundWorker<AssetSealArgs> for AssetSealWorker {
    fn build(ctx: &AppContext) -> Self {
        Self { ctx: ctx.clone() }
    }

    async fn perform(&self, args: AssetSealArgs) -> Result<()> {
        use std::fs;
        let item = IssueEntity::find_by_id(args.assets_issue_id)
            .one(&self.ctx.db)
            .await?
            .ok_or_else(|| Error::NotFound)?;
        tracing::debug!("sealing assets #{} {}", args.assets_issue_id, item.filename);
        //TODO: XXX
        sleep(Duration::from_millis(2000)).await;

        let mut item = item.into_active_model();
        item.state = Set(IssueState::Sealing);
        item.update(&self.ctx.db).await?;

        // TODO: XXX
        let item = IssueEntity::find_by_id(args.assets_issue_id)
            .one(&self.ctx.db)
            .await?
            .ok_or_else(|| Error::NotFound)?;

        let assets_owner = {
            let t = hex::decode(&item.account_id).map_err(Error::wrap)?;
            crate::seal::Public::try_from(&t[..])
                .map_err(|_| Error::string("parse assets owner account error"))?
        };

        sleep(Duration::from_millis(5000)).await;

        let mut to_seal_file = {
            let path = crate::upload_folder(&self.ctx)?
                .join(format!("{}_{}", item.account_id, item.filename));
            fs::File::open(path)?
        };

        let sealing_path = crate::sealed_folder(&self.ctx)?
            .join(format!("{}_{}.sealing", item.account_id, item.filename));

        let iss: IssueSignature;
        {
            let mut output = std::fs::File::create(&sealing_path)?;
            iss = seal_assets(assets_owner.into(), &mut to_seal_file, &mut output)?;
            let m = output.metadata()?;
            tracing::debug!("the sealing file: {:?} len: {}", &sealing_path, m.len());
        }

        let sealed_path =
            crate::sealed_folder(&self.ctx)?.join(format!("{}.pflx", hex::encode(iss.assets_id)));
        std::fs::rename(&sealing_path, &sealed_path)?;
        tracing::debug!(
            "renamed the sealed file from: {:?} to {:?}",
            &sealing_path,
            &sealed_path
        );

        let mut item = item.into_active_model();
        item.assets_id = Set(Some(hex::encode(iss.assets_id)));
        item.pflix_issuer = Set(Some(hex::encode(iss.pflix_issuer)));
        item.pflix_signature = Set(Some(hex::encode(iss.signature)));
        item.state = Set(IssueState::Sealed);
        item.update(&self.ctx.db).await?;

        tracing::debug!("sealed assets #{}", args.assets_issue_id);
        Ok(())
    }
}
