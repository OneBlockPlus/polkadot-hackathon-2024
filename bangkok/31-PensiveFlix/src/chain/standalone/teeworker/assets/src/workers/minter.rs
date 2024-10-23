use crate::models::_entities::assets_issues::Model as AssetsIssue;
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};
use std::time::Duration;
use tokio::time::sleep;

pub struct MintWorker {
    pub ctx: AppContext,
}

#[derive(Deserialize, Debug, Serialize)]
pub struct DownloadWorkerArgs {
    pub user_guid: String,
}

#[async_trait]
impl BackgroundWorker<AssetsIssue> for MintWorker {
    fn build(ctx: &AppContext) -> Self {
        Self { ctx: ctx.clone() }
    }

    async fn perform(&self, args: AssetsIssue) -> Result<()> {
        use crate::models::_entities::{
            assets_issues::Entity as AssetsIssueEntity, assets_nfts::ActiveModel as AssetsNft,
            pfxassets::ActiveModel as PfxAssets,
        };
        use crate::models::assets_issues::IssueState;

        tracing::debug!("begin minting assets");
        args.check_sealed_before_mint(true)?;
        crate::models::check_account_exists(&self.ctx.db, &args.account_id).await?;

        let assets_id = args
            .assets_id
            .ok_or(Error::string("assets_id must not be none"))?;
        let retrive_uri = args
            .retrive_uri
            .ok_or(Error::string("retrive_uri must not be none"))?;
        let pflix_issuer = args
            .pflix_issuer
            .ok_or(Error::string("pflix_issuer must not be none"))?;
        let pflix_signature = args
            .pflix_signature
            .ok_or(Error::string("pflix_signature must not be none"))?;

        let assets_issue = AssetsIssueEntity::find_by_id(args.id)
            .one(&self.ctx.db)
            .await?
            .ok_or(Error::NotFound)?;
        assets_issue
            .into_active_model()
            .set_issue_state(&self.ctx.db, IssueState::Minting)
            .await?;

        sleep(Duration::from_secs(10)).await;
        let assets_issue = AssetsIssueEntity::find_by_id(args.id)
            .one(&self.ctx.db)
            .await?
            .ok_or(Error::NotFound)?;
        assets_issue
            .into_active_model()
            .set_issued(&self.ctx.db)
            .await?;

        //TODO: Just for demo
        for i in 1..=5 {
            let token = format!("{}{:03?}", assets_id, i);
            let token = sp_crypto_hashing::keccak_256(token.as_bytes());
            let nft = AssetsNft {
                assets_id: Set(assets_id.clone()),
                token: Set(hex::encode(token)),
                owner: Set(args.account_id.clone()),
                ..Default::default()
            };
            nft.insert(&self.ctx.db).await?;
        }

        let assets = PfxAssets {
            assets_id: Set(assets_id.clone()),
            owner: Set(args.account_id),
            size: Set(args.size),
            filename: Set(args.filename),
            media_type: Set(args.media_type),
            name: Set(args.name.unwrap_or("Untitle-Assets".to_owned())),
            retrive_uri: Set(retrive_uri),
            cover_image: Set(args.cover_image),
            pflix_issuer: Set(pflix_issuer),
            pflix_signature: Set(pflix_signature),
            ..Default::default()
        };
        assets.insert(&self.ctx.db).await?;
        tracing::debug!("finish mint assets: {}", assets_id);
        Ok(())
    }
}
