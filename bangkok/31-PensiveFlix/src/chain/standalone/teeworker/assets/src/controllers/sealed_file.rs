#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use axum::{body::Body, debug_handler};
use axum_typed_multipart::{FieldData, TryFromMultipart, TypedMultipart};
use loco_rs::prelude::*;
use tempfile::NamedTempFile;

use crate::models::_entities::assets_issues::{Entity, Model};
use crate::views::sealed::VerifiedSealedMeta;

async fn load_item(ctx: &AppContext, assets_issue_id: i32) -> Result<Model> {
    let item = Entity::find_by_id(assets_issue_id).one(&ctx.db).await?;
    item.ok_or_else(|| Error::NotFound)
}

#[debug_handler]
pub async fn download(Path(id): Path<i32>, State(ctx): State<AppContext>) -> Result<Response> {
    use axum::http::header;
    use tokio::fs;
    use tokio_util::io::ReaderStream;

    let item = load_item(&ctx, id).await?;
    let assets_id = item
        .assets_id
        .ok_or(Error::string("assets file not exist, maybe in sealing"))?;
    let filename = format!("{}.pflx", assets_id);
    let path = crate::sealed_folder(&ctx)?.join(&filename);
    // Stream the file
    let file = fs::File::open(&path).await?;
    let stream = ReaderStream::new(file);
    let body = Body::from_stream(stream);
    let res = format::render()
        .header(
            header::CONTENT_TYPE,
            mime::APPLICATION_OCTET_STREAM.to_string(),
        )
        .header(
            header::CONTENT_DISPOSITION,
            format!("attachment; filename=\"{}\"", filename),
        )
        .response()
        .body(body)?;
    Ok(res)
}

#[derive(TryFromMultipart)]
pub struct SealedVerifyParams {
    #[form_data(limit = "2GiB")]
    pub file: FieldData<NamedTempFile>,
}

#[debug_handler]
pub async fn verify(
    State(ctx): State<AppContext>,
    TypedMultipart(SealedVerifyParams { file }): TypedMultipart<SealedVerifyParams>,
) -> Result<Response> {
    use crate::seal::*;

    let iss: IssueSignature;
    {
        let mut t = file.contents.as_file();
        let mut output = NamedTempFile::new()?;
        iss = unseal_assets(&mut t, &mut output)?;
    }
    let stashed = crate::sealed_folder(&ctx)?.join(format!("{}.pflx", hex::encode(iss.assets_id)));
    std::fs::rename(file.contents.into_temp_path(), stashed)?;

    let r = VerifiedSealedMeta {
        assets_id: hex::encode(iss.assets_id),
        pflix_issuer: hex::encode(iss.pflix_issuer),
        owner: hex::encode(iss.owner),
        issue_time: iss.issue_time,
    };
    format::json(r)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("sealed_files/")
        .add("/:id", get(download))
        .add("/", put(verify))
}
