use super::utils::{Error, Result, *};
use sails_rs::prelude::*;

pub fn balance_of(tokens_for_owner: &TokensForOwnerMap, owner: ActorId) -> U256 {
    tokens_for_owner
        .get(&owner)
        .map_or(0, |set| set.len())
        .into()
}

pub fn owner_of(owner_by_id: &OwnerByIdMap, token_id: TokenId) -> ActorId {
    owner_by_id
        .get(&token_id)
        .copied()
        .unwrap_or_else(ActorId::zero)
}

pub fn approve(
    approvals_map: &mut ApprovalsMap,
    source: ActorId,
    owner: ActorId,
    approved: ActorId,
    token_id: TokenId,
) -> Result<()> {
    check_permission(&source, &owner, token_id, approvals_map)?;
    if owner == approved {
        return Err(Error::SelfDealing);
    }
    match approved {
        id if id == ActorId::zero() => {
            approvals_map.remove(&token_id);
        }
        id => {
            approvals_map.insert(token_id, id);
        }
    }

    Ok(())
}

pub fn transfer_from(
    approvals_map: &mut ApprovalsMap,
    owner_by_id: &mut OwnerByIdMap,
    tokens_for_owner: &mut TokensForOwnerMap,
    source: ActorId,
    from: ActorId,
    to: ActorId,
    token_id: TokenId,
) -> Result<()> {
    let owner = owner_of(owner_by_id, token_id);
    if owner != from {
        return Err(Error::DeniedAccess);
    }
    if from == to {
        return Err(Error::SelfDealing);
    }
    check_permission(&source, &owner, token_id, approvals_map)?;
    update_owner(owner_by_id, tokens_for_owner, from, to, token_id);
    approvals_map.remove(&token_id);

    Ok(())
}

pub fn transfer(
    approvals_map: &mut ApprovalsMap,
    owner_by_id: &mut OwnerByIdMap,
    tokens_for_owner: &mut TokensForOwnerMap,
    source: ActorId,
    to: ActorId,
    token_id: TokenId,
) -> Result<()> {
    let owner = owner_of(owner_by_id, token_id);
    if owner != source {
        return Err(Error::DeniedAccess);
    }
    if source == to {
        return Err(Error::SelfDealing);
    }

    update_owner(owner_by_id, tokens_for_owner, source, to, token_id);
    approvals_map.remove(&token_id);

    Ok(())
}

fn check_permission(
    source: &ActorId,
    owner: &ActorId,
    token_id: TokenId,
    approvals_map: &ApprovalsMap,
) -> Result<()> {
    match (owner, source) {
        (&o, _) if o == ActorId::zero() => Err(Error::TokenDoesNotExist),
        (o, s) if o == s => Ok(()),
        _ => match approvals_map.get(&token_id) {
            Some(&approved_id) if approved_id == *source => Ok(()),
            _ => Err(Error::DeniedAccess),
        },
    }
}

fn update_owner(
    owner_by_id: &mut OwnerByIdMap,
    tokens_for_owner: &mut TokensForOwnerMap,
    from: ActorId,
    to: ActorId,
    token_id: TokenId,
) {
    owner_by_id.insert(token_id, to);
    tokens_for_owner.entry(to).or_default().insert(token_id);

    if let Some(tokens) = tokens_for_owner.get_mut(&from) {
        tokens.remove(&token_id);
        if tokens.is_empty() {
            tokens_for_owner.remove(&from);
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::funcs;
    use utils::*;

    #[test]
    fn balance_of() {
        // Initializing thread logger.
        let _ = env_logger::try_init();

        // Creating tokens_for_owner map
        let map = tokens_for_owner_map([(alice(), [1.into(), 2.into(), 3.into()])]);

        // # Test case #1.
        // Checking of non-zero number of tokens on the balance
        {
            let owner = alice();
            assert_eq!(funcs::balance_of(&map, owner), 3.into());
        }
        // # Test case #2.
        // Checking of zero number of tokens on the balance
        {
            let owner = bob();
            assert_eq!(funcs::balance_of(&map, owner), 0.into());
        }
    }
    #[test]
    fn owner_of() {
        // Initializing thread logger.
        let _ = env_logger::try_init();

        let token_id = 1.into();
        // Creating tokens_for_owner map
        let map = owner_by_id_map([(token_id, alice())]);

        // # Test case #1.
        // Checking of non-zero number of tokens on the balance
        {
            assert_eq!(funcs::owner_of(&map, token_id), alice());
        }
    }

    #[test]
    fn approve() {
        // Initializing thread logger.
        let _ = env_logger::try_init();

        // Creating empty approvals map
        let token_id: U256 = 1.into();
        let mut map = approvals_map([]);

        // # Test case #1.
        // The owner gives approve
        {
            let source = alice();
            let owner = alice();
            let approved = bob();
            assert!(map.is_empty());
            assert_eq!(
                funcs::approve(&mut map, source, owner, approved, token_id),
                Ok(())
            );
            assert!(map.contains_key(&token_id));
        }
        // # Test case #2.
        // The operator gives approve
        {
            let source = bob();
            let owner = alice();
            let approved = dave();
            assert_eq!(
                funcs::approve(&mut map, source, owner, approved, token_id),
                Ok(())
            );
            assert_eq!(map, approvals_map([(token_id, approved)]));
        }
        // # Test case #3.
        // Give approve to zero address
        {
            let source = dave();
            let owner = alice();
            let approved = ActorId::zero();
            assert_eq!(
                funcs::approve(&mut map, source, owner, approved, token_id),
                Ok(())
            );
            assert!(map.is_empty());
        }
        // # Test case #4.
        // Error cases
        {
            let source = alice();
            let owner = ActorId::zero();
            let approved = bob();
            assert!(map.is_empty());
            assert_eq!(
                funcs::approve(&mut map, source, owner, approved, token_id),
                Err(Error::TokenDoesNotExist)
            );
            assert!(map.is_empty());

            let owner = bob();
            assert_eq!(
                funcs::approve(&mut map, source, owner, approved, token_id),
                Err(Error::DeniedAccess)
            );
            assert!(map.is_empty());
        }
    }

    #[test]
    fn transfer() {
        // Initializing thread logger.
        let _ = env_logger::try_init();

        // Creating maps
        let token_id: U256 = 1.into();
        let mut approvals = approvals_map([(token_id, bob())]);
        let mut owner_by_id = owner_by_id_map([(token_id, alice())]);
        let mut tokens_for_owner = tokens_for_owner_map([(alice(), [token_id])]);

        // # Test case #1.
        // Success case
        {
            let source = alice();
            let to = bob();
            assert_eq!(
                funcs::transfer(
                    &mut approvals,
                    &mut owner_by_id,
                    &mut tokens_for_owner,
                    source,
                    to,
                    token_id
                ),
                Ok(())
            );
            assert_eq!(owner_by_id, owner_by_id_map([(token_id, to)]));
            assert_eq!(tokens_for_owner, tokens_for_owner_map([(to, [token_id])]));
            assert!(approvals.is_empty())
        }

        // # Test case #2.
        // Error cases
        {
            let source = alice();
            let to = bob();
            assert_eq!(
                funcs::transfer(
                    &mut approvals,
                    &mut owner_by_id,
                    &mut tokens_for_owner,
                    source,
                    to,
                    token_id
                ),
                Err(Error::DeniedAccess)
            );
            let source = bob();
            assert_eq!(
                funcs::transfer(
                    &mut approvals,
                    &mut owner_by_id,
                    &mut tokens_for_owner,
                    source,
                    to,
                    token_id
                ),
                Err(Error::SelfDealing)
            );
        }
    }

    #[test]
    fn transfer_from() {
        // Initializing thread logger.
        let _ = env_logger::try_init();

        // Creating maps
        let token_id: U256 = 1.into();
        let mut approvals = approvals_map([(token_id, bob())]);
        let mut owner_by_id = owner_by_id_map([(token_id, alice())]);
        let mut tokens_for_owner = tokens_for_owner_map([(alice(), [token_id])]);

        // # Test case #1.
        // Success case
        {
            let source = bob();
            let to = dave();
            let from = alice();
            assert_eq!(
                funcs::transfer_from(
                    &mut approvals,
                    &mut owner_by_id,
                    &mut tokens_for_owner,
                    source,
                    from,
                    to,
                    token_id
                ),
                Ok(())
            );
            assert_eq!(owner_by_id, owner_by_id_map([(token_id, to)]));
            assert_eq!(tokens_for_owner, tokens_for_owner_map([(to, [token_id])]));
            assert!(approvals.is_empty())
        }

        // # Test case #2.
        // Error cases
        {
            // `from` is not equal `to` the owner of the token identifier
            let source = bob();
            let to = dave();
            let from = alice();
            assert_eq!(
                funcs::transfer_from(
                    &mut approvals,
                    &mut owner_by_id,
                    &mut tokens_for_owner,
                    source,
                    from,
                    to,
                    token_id
                ),
                Err(Error::DeniedAccess)
            );
            // `from` is equal to `to`
            let from = dave();
            assert_eq!(
                funcs::transfer_from(
                    &mut approvals,
                    &mut owner_by_id,
                    &mut tokens_for_owner,
                    source,
                    from,
                    to,
                    token_id
                ),
                Err(Error::SelfDealing)
            );
            // token does not exist
            let to = alice();
            let not_exist_token_id = 2.into();
            let from = ActorId::zero();
            assert_eq!(
                funcs::transfer_from(
                    &mut approvals,
                    &mut owner_by_id,
                    &mut tokens_for_owner,
                    source,
                    from,
                    to,
                    not_exist_token_id
                ),
                Err(Error::TokenDoesNotExist)
            );
            // no access to send token
            let source = bob();
            let to = alice();
            let from = dave();
            assert_eq!(
                funcs::transfer_from(
                    &mut approvals,
                    &mut owner_by_id,
                    &mut tokens_for_owner,
                    source,
                    from,
                    to,
                    token_id
                ),
                Err(Error::DeniedAccess)
            );
        }
    }

    mod utils {
        use super::*;

        pub fn approvals_map<const N: usize>(content: [(TokenId, ActorId); N]) -> ApprovalsMap {
            content.into_iter().map(|(k1, v)| ((k1, v))).collect()
        }

        pub fn tokens_for_owner_map<const N: usize, const M: usize>(
            content: [(ActorId, [TokenId; M]); N],
        ) -> TokensForOwnerMap {
            content
                .into_iter()
                .map(|(k, v)| ((k, v.into_iter().collect())))
                .collect()
        }

        pub fn owner_by_id_map<const N: usize>(content: [(TokenId, ActorId); N]) -> OwnerByIdMap {
            content.into_iter().map(|(k1, v)| ((k1, v))).collect()
        }

        pub fn alice() -> ActorId {
            1u64.into()
        }

        pub fn bob() -> ActorId {
            2u64.into()
        }

        pub fn dave() -> ActorId {
            4u64.into()
        }
    }
}
