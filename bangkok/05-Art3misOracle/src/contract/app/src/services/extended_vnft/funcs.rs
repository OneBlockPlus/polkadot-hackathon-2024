use crate::services::extended_vnft::TokenMetadata;
use sails_rs::{
    collections::{HashMap, HashSet},
    prelude::*,
};
use vnft_service::utils::{Error, Result, *};

pub fn mint(
    owner_by_id: &mut HashMap<TokenId, ActorId>,
    tokens_for_owner: &mut HashMap<ActorId, HashSet<TokenId>>,
    token_metadata_by_id: &mut HashMap<TokenId, TokenMetadata>,
    token_id: &mut TokenId,
    to: ActorId,
    token_metadata: TokenMetadata,
) -> Result<()> {
    owner_by_id.insert(*token_id, to);
    tokens_for_owner
        .entry(to)
        .and_modify(|tokens| {
            tokens.insert(*token_id);
        })
        .or_insert_with(|| HashSet::from([*token_id]));
    token_metadata_by_id.insert(*token_id, token_metadata);
    *token_id += 1.into();
    Ok(())
}

pub fn burn(
    owner_by_id: &mut HashMap<TokenId, ActorId>,
    tokens_for_owner: &mut HashMap<ActorId, HashSet<TokenId>>,
    token_approvals: &mut HashMap<TokenId, ActorId>,
    token_metadata_by_id: &mut HashMap<TokenId, TokenMetadata>,
    token_id: TokenId,
) -> Result<()> {
    let owner = owner_by_id
        .remove(&token_id)
        .ok_or(Error::TokenDoesNotExist)?;
    if let Some(tokens) = tokens_for_owner.get_mut(&owner) {
        tokens.remove(&token_id);
        if tokens.is_empty() {
            tokens_for_owner.remove(&owner);
        }
    }
    token_approvals.remove(&token_id);
    token_metadata_by_id.remove(&token_id);
    Ok(())
}
