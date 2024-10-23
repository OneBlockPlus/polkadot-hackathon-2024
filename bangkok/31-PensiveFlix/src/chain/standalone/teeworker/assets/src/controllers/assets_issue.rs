#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use axum::debug_handler;
use axum_typed_multipart::{FieldData, TryFromMultipart, TypedMultipart};
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};
use tempfile::NamedTempFile;

use crate::models::_entities::assets_issues::{ActiveModel, Entity, IssueState, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct IssueParams {
    pub mint_count: i32,
    pub name: Option<String>,
    pub retrive_uri: Option<String>,
    pub cover_image: Option<String>,
    pub force: Option<bool>,
}

impl IssueParams {
    fn update(&self, item: &mut ActiveModel) {
        item.mint_count = Set(self.mint_count.clone());
        item.name = Set(self.name.clone());
        item.retrive_uri = Set(self.retrive_uri.clone());
        item.cover_image = Set(self.cover_image.clone());
    }
}

#[derive(TryFromMultipart)]
pub struct NewIssueParams {
    #[form_data(limit = "2GiB")]
    pub file: FieldData<NamedTempFile>,
    pub account_id: String,
    pub filename: Option<String>,
}

async fn load_item(ctx: &AppContext, id: i32) -> Result<Model> {
    let item = Entity::find_by_id(id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

#[debug_handler]
pub async fn new_issue(
    State(ctx): State<AppContext>,
    TypedMultipart(NewIssueParams {
        file,
        account_id,
        filename,
    }): TypedMultipart<NewIssueParams>,
) -> Result<Response> {
    crate::models::check_account_exists(&ctx.db, &account_id).await?;

    let filename = file
        .metadata
        .file_name
        .or(filename)
        .unwrap_or(String::from("untitle.data"));
    tracing::debug!("account: {} upload assets file: {}", account_id, filename);

    let path = crate::upload_folder(&ctx)?.join(format!("{account_id}_{filename}"));
    let f = file.contents.persist(&path).map_err(loco_rs::Error::wrap)?;
    let file_size = f.metadata()?.len();

    tracing::debug!("assets file saved in {:?}", path);
    let media_type = mime_guess::from_path(path)
        .first()
        .unwrap_or(mime::APPLICATION_OCTET_STREAM);

    let item = ActiveModel {
        account_id: Set(account_id),
        state: Set(IssueState::Waiting),
        mint_count: Set(0),
        size: Set(file_size as i64),
        filename: Set(filename),
        media_type: Set(media_type.to_string()),
        ..Default::default()
    };
    let item = item.insert(&ctx.db).await?;
    submit_sealing(&ctx, &item).await?;
    format::json(item)
}

async fn submit_sealing(ctx: &AppContext, item: &Model) -> Result<()> {
    use crate::workers::sealer::{AssetSealArgs, AssetSealWorker};
    AssetSealWorker::perform_later(
        ctx,
        AssetSealArgs {
            assets_issue_id: item.id,
        },
    )
    .await
}

#[debug_handler]
pub async fn issue_assets(
    Path(id): Path<i32>,
    State(ctx): State<AppContext>,
    Json(params): Json<IssueParams>,
) -> Result<Response> {
    let item = load_item(&ctx, id).await?;
    item.check_sealed_before_mint(params.force.unwrap_or(false))?;
    let mut item = item.into_active_model();
    params.update(&mut item);
    let item = item.update(&ctx.db).await?;
    submit_minting(&ctx, &item).await?;
    format::json(item)
}

async fn submit_minting(ctx: &AppContext, item: &Model) -> Result<()> {
    use crate::workers::minter::MintWorker;
    MintWorker::perform_later(ctx, item.clone()).await
}

#[debug_handler]
pub async fn remove(Path(id): Path<i32>, State(ctx): State<AppContext>) -> Result<Response> {
    load_item(&ctx, id).await?.delete(&ctx.db).await?;
    format::empty()
}

#[debug_handler]
pub async fn get_one(Path(id): Path<i32>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("assets_issues/")
        .add("/", get(list))
        .add("/", post(new_issue))
        .add(":id", get(get_one))
        .add(":id", delete(remove))
        .add(":id", put(issue_assets))
}
