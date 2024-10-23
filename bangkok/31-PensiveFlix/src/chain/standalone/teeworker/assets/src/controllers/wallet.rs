#![allow(clippy::missing_errors_doc)]
#![allow(clippy::unnecessary_struct_initialization)]
#![allow(clippy::unused_async)]
use axum::debug_handler;
use loco_rs::prelude::*;
use serde::{Deserialize, Serialize};

use crate::models::_entities::wallets::{ActiveModel, Column, Entity, Model};

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Params {
    pub name: Option<String>,
}

impl Params {
    fn update(&self, item: &mut ActiveModel) {
        if let Some(ref name) = self.name {
            item.name = Set(name.clone());
        }
    }
}

async fn load_item(ctx: &AppContext, account_id: String) -> Result<Model> {
    let item = Entity::find()
        .filter(Column::AccountId.eq(account_id))
        .one(&ctx.db)
        .await?;
    item.ok_or_else(|| Error::NotFound)
}

#[debug_handler]
pub async fn list(State(ctx): State<AppContext>) -> Result<Response> {
    format::json(Entity::find().all(&ctx.db).await?)
}

#[debug_handler]
pub async fn generate(State(ctx): State<AppContext>) -> Result<Response> {
    use hex::ToHex;
    let (phrase, pair, _) = generate_mnemonic()?;
    let item = ActiveModel {
        account_id: Set(pair.public().encode_hex()),
        name: Set("Account-1".to_owned()),
        phrase: Set(phrase),
        ..Default::default()
    };
    let item = item.insert(&ctx.db).await?;
    format::json(item)
}

use itertools::Itertools;
use parity_bip39::Mnemonic;
use sp_core::{sr25519::Pair, Pair as TraitPair};

fn generate_mnemonic() -> Result<(String, Pair, [u8; 32])> {
    let mnemonic = Mnemonic::generate(12).map_err(loco_rs::Error::wrap)?;
    let phrase = mnemonic.words().join(" ");
    let (pair, seed) = Pair::from_phrase(&phrase, None).map_err(loco_rs::Error::wrap)?;
    Ok((phrase, pair, seed))
}

#[debug_handler]
pub async fn update(
    Path(account_id): Path<String>,
    State(ctx): State<AppContext>,
    Json(params): Json<Params>,
) -> Result<Response> {
    let item = load_item(&ctx, account_id).await?;
    let mut item = item.into_active_model();
    params.update(&mut item);
    let item = item.update(&ctx.db).await?;
    format::json(item)
}

#[debug_handler]
pub async fn remove(
    Path(account_id): Path<String>,
    State(ctx): State<AppContext>,
) -> Result<Response> {
    load_item(&ctx, account_id).await?.delete(&ctx.db).await?;
    format::empty()
}

#[debug_handler]
pub async fn get_one(Path(id): Path<String>, State(ctx): State<AppContext>) -> Result<Response> {
    format::json(load_item(&ctx, id).await?)
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("wallets/")
        .add("/", get(list))
        .add("/", post(generate))
        .add(":id", get(get_one))
        .add(":id", delete(remove))
        .add(":id", post(update))
}
