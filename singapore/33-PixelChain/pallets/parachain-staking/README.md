# DPoS Pallet for Parachain Staking

## Formatting Rules

- dependencies in alphabetical order in the `Cargo.toml` and at the top of each file
- prefer explicit imports to glob import syntax i.e. prefer `use::crate::{Ex1, Ex2, ..};` to `use super::*;`

## Description

Implements Delegated Proof of Stake to

1. select the active set of eligible block producers
2. reward block authors
3. enable delegators and collators to participate in inflationary rewards

Links:

- [Rust Documentation](https://purestake.github.io/moonbeam/pallet_parachain_staking/index.html)
- [Unofficial Documentation](https://meta5.world/parachain-staking-docs/)
- [(Outdated) Blog Post with Justification](https://meta5.world/posts/parachain-staking)