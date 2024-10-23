// This file is part of Cybros.

// Copyright (C) Jun Jiang.
// SPDX-License-Identifier: AGPL-3.0-only

// Cybros is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// Cybros is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with Cybros.  If not, see <http://www.gnu.org/licenses/>.

use origin_runtime::{AccountId, Block, RuntimeGenesisConfig, wasm_binary_unwrap};
use sc_chain_spec::{ChainSpecExtension, Properties};
use sc_service::ChainType;
use sp_consensus_aura::sr25519::AuthorityId as AuraId;
use sp_consensus_grandpa::AuthorityId as GrandpaId;
use std::str::FromStr;
use serde::{Deserialize, Serialize};

/// The struct for JSON format genesis config
///
/// Json sample:
/// ```ignore
/// {
///   "rootKey": "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
///   "initialAuthorities": [
///     [
///       "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", // SS58 format of the validator account
///       "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY", // SS58 format of the AURA key
///       "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY" // SS58 format of the Grandpa key
///     ]
///   ],
///   "endowedAccounts": [
///     [
///       "5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY",
///       "1000000000000000000"
///     ],
///     [
///       "5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty",
///       "1000000000000000000"
///     ],
///     [
///       "5GNJqTPyNqANBkUVMN1LPPrxXnFouWXoe2wNSmmEoLctxiZY",
///       "1000000000000000000"
///     ],
///     [
///       "5HpG9w8EBLe5XCrbczpwq5TSXvedjrBGCwqxK1iQ7qUsSWFc",
///       "1000000000000000000"
///     ]
///   ]
/// }
/// ```
#[derive(Deserialize, Debug, Clone)]
#[serde(rename_all = "camelCase")]
struct GenesisConfigProfile {
	root_key: AccountId,
	initial_authorities: Vec<(AccountId, AuraId, GrandpaId)>,
	endowed_accounts: Vec<(AccountId, String)>,
}

// The URL for the telemetry server.
// const STAGING_TELEMETRY_URL: &str = "wss://telemetry.polkadot.io/submit/";

/// Node `ChainSpec` extensions.
///
/// Additional parameters for some Substrate core modules,
/// customizable from the chain spec.
#[derive(Default, Clone, Serialize, Deserialize, ChainSpecExtension)]
#[serde(rename_all = "camelCase")]
pub struct Extensions {
	/// Block numbers with known hashes.
	pub fork_blocks: sc_client_api::ForkBlocks<Block>,
	/// Known bad block hashes.
	pub bad_blocks: sc_client_api::BadBlocks<Block>,
	/// The light sync state extension used by the sync-state rpc.
	pub light_sync_state: sc_sync_state_rpc::LightSyncStateExtension,
}

/// Specialized `ChainSpec`. This is a specialization of the general Substrate ChainSpec type.
pub type ChainSpec = sc_service::GenericChainSpec<RuntimeGenesisConfig, Extensions>;

pub fn development() -> Result<ChainSpec, String> {
	let genesis_profile_in_bytes = include_bytes!("../res/development_network_genesis_config.json");
	let genesis_profile: GenesisConfigProfile =
		serde_json::from_slice(genesis_profile_in_bytes).expect("Bad chain profile");

	chain_spec_for(
		"Cybros Origin development",
		"cybros_origin_dev",
		ChainType::Development,
		genesis_profile,
	)
}

/// Local network for demo or simulation production network
/// Mnemonic: nut hire energy drill planet book wreck post saddle lend barrel twin
pub fn local() -> Result<ChainSpec, String> {
	let genesis_profile_in_bytes = include_bytes!("../res/local_network_genesis_config.json");
	let genesis_profile: GenesisConfigProfile =
		serde_json::from_slice(genesis_profile_in_bytes).expect("Bad chain profile");

	chain_spec_for(
		"Cybros Origin local",
		"cybros_origin_local",
		ChainType::Local,
		genesis_profile
	)
}

fn chain_spec_for(
	name: &str,
	id: &str,
	chain_type: ChainType,
	genesis_profile: GenesisConfigProfile,
) -> Result<ChainSpec, String> {
	Ok(
		ChainSpec::builder(
			wasm_binary_unwrap(),
			Default::default(),
		)
		.with_name(name)
		.with_id(id)
		.with_chain_type(chain_type)
		.with_properties(chain_properties())
		.with_genesis_config_patch(
			genesis_config(
				// Initial PoA authorities
				genesis_profile.initial_authorities,
				// Sudo account
				genesis_profile.root_key,
				// Pre-funded accounts
				genesis_profile
					.endowed_accounts
					.into_iter()
					.map(|(k, amount)| (k, u128::from_str(&amount).expect("Bad amount")))
					.collect(),
				true,
			)
		)
		.build()
	)
}

/// Configure initial storage state for FRAME modules.
fn genesis_config(
	initial_authorities: Vec<(AccountId, AuraId, GrandpaId)>,
	root_key: AccountId,
	endowed_accounts: Vec<(AccountId, u128)>,
	_enable_println: bool,
) -> serde_json::Value {
	assert!(
		initial_authorities
			.iter()
			.map(|(k, _, _)| k)
			.chain(&[root_key.clone()])
			.cloned()
			.all(|account| {
				endowed_accounts.iter().any(|(endowed, _)| account == endowed.clone())
			}),
		"All the genesis accounts must be endowed; qed."
	);

	serde_json::json!({
		"balances": {
			"balances": endowed_accounts,
		},
		"aura": {
			"authorities": initial_authorities.iter().map(|x| (x.1.clone())).collect::<Vec<_>>(),
		},
		"grandpa": {
			"authorities": initial_authorities.iter().map(|x| (x.2.clone(), 1)).collect::<Vec<_>>(),
		},
		"sudo": {
			"key": Some(root_key),
		},
	})
}

fn chain_properties() -> Properties {
	let mut p = Properties::new();

	p.insert("tokenSymbol".into(), "CBT".into());
	p.insert("tokenDecimals".into(), 12.into());
	p.insert("ss58Format".into(), 42.into());

	p
}
