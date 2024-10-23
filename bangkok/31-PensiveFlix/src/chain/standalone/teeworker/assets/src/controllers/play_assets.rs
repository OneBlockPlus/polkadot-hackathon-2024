#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use axum::{body::Body, debug_handler};
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::{assets_nfts::Model as NftModel, pfxassets::Model as AssetsModel};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Params {
    pub nft_token: String,
    pub account_id: String,
}

#[debug_handler]
pub async fn stream_assets_file(
    State(ctx): State<AppContext>,
    Form(params): Form<Params>,
) -> Result<Response> {
    use axum::http::header;
    use tempfile::NamedTempFile;
    use tokio::fs;
    use tokio_util::io::ReaderStream;

    tracing::debug!("params: {:?}", params);
    let nft = NftModel::find_by_token(&ctx.db, &params.nft_token).await?;
    if !nft.owner.eq(&params.account_id) {
        return Err(Error::string("permission denied"));
    }
    let assets = AssetsModel::find_by_assets_id(&ctx.db, &nft.assets_id).await?;
    let path = crate::sealed_folder(&ctx)?.join(format!("{}.pflx", assets.assets_id));

    let mut sealed_input = fs::File::open(&path).await?.into_std().await;
    let mut origin = NamedTempFile::new()?;

    //TODO: Could we write response directly?
    let temp_path = {
        crate::seal::unseal_assets(&mut sealed_input, origin.as_file_mut())?;
        tracing::debug!("unsealed file len: {}", origin.as_file().metadata()?.len());
        origin.into_temp_path()
    };
    let file = fs::File::open(temp_path).await?;
    let stream = ReaderStream::new(file);
    let body = Body::from_stream(stream);
    let res = format::render()
        .header(header::CONTENT_TYPE, assets.media_type)
        .response()
        .body(body)?;
    Ok(res)
}

pub fn routes() -> Routes {
    Routes::new().add("/play_assets", get(stream_assets_file))
}
