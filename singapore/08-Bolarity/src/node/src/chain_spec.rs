use std::{collections::BTreeMap, str::FromStr};

// 3rd party imports
use hex_literal::hex;

// Substrate
use sc_chain_spec::{ChainType, Properties};
use sp_consensus_babe::AuthorityId as BabeId;
use sp_consensus_grandpa::AuthorityId as GrandpaId;
#[allow(unused_imports)]
use sp_core::ecdsa;
use sp_core::{Pair, Public, H160, U256};
use sp_runtime::{
    traits::{IdentifyAccount, Verify},
    Perbill,
};

// Frontier
use bolarity_runtime::{
    constants::currency::*, opaque::SessionKeys, AccountId, Balance, MaxNominations,
    RuntimeGenesisConfig, SS58Prefix, Signature, StakerStatus, BABE_GENESIS_EPOCH_CONFIG,
    WASM_BINARY,
};
use pallet_im_online::sr25519::AuthorityId as ImOnlineId;

// The URL for the telemetry server.
// const STAGING_TELEMETRY_URL: &str = "wss://telemetry.polkadot.io/submit/";

/// Specialized `ChainSpec`. This is a specialization of the general Substrate ChainSpec type.
pub type ChainSpec = sc_service::GenericChainSpec<RuntimeGenesisConfig>;

// Public account type
#[allow(dead_code)]
type AccountPublic = <Signature as Verify>::Signer;

// Dev chain config
pub fn development_config() -> ChainSpec {
    use devnet_keys::*;

    ChainSpec::builder(WASM_BINARY.expect("WASM not available"), Default::default())
        .with_name("Development")
        .with_id("dev")
        .with_chain_type(ChainType::Development)
        .with_properties(properties())
        .with_genesis_config_patch(testnet_genesis(
            // Sudo account (Alith)
            alith(),
            // Pre-funded accounts
            vec![alith(), baltathar(), charleth(), dorothy(), ethan(), faith(), goliath()],
            // Initial Validators and PoA authorities
            vec![alice_session_keys()],
            // Initial nominators
            vec![],
            // Ethereum chain ID
            SS58Prefix::get() as u64,
        ))
        .build()
}

// Local testnet config
pub fn local_testnet_config() -> ChainSpec {
    use devnet_keys::*;

    ChainSpec::builder(WASM_BINARY.expect("WASM not available"), Default::default())
        .with_name("Local Testnet")
        .with_id("local")
        .with_chain_type(ChainType::Local)
        .with_properties(properties())
        .with_genesis_config_patch(testnet_genesis(
            // Initial PoA authorities
            // Sudo account (Alith)
            alith(),
            // Pre-funded accounts
            vec![alith(), baltathar(), charleth(), dorothy(), ethan(), faith(), goliath()],
            vec![alice_session_keys(), bob_session_keys()],
            vec![],
            // Ethereum chain ID
            SS58Prefix::get() as u64,
        ))
        .build()
}

// Testnet config
pub fn testnet_config() -> ChainSpec {
    use testnet_keys::*;

    ChainSpec::builder(WASM_BINARY.expect("WASM not available"), Default::default())
        .with_name("Bolarity Testnet")
        .with_id("testnet")
        .with_chain_type(ChainType::Custom("Testnet".to_string()))
        .with_properties(properties())
        .with_genesis_config_patch(testnet_genesis(
            // Initial PoA authorities
            // Sudo account (Alith)
            lionel(),
            // Pre-funded accounts
            vec![
                lionel(),
                diego(),
                pele(),
                franz(),
                johan(),
                ronaldo(),
                zinedine(),
                cristiano(),
                michel(),
                roberto(),
            ],
            vec![diego_session_keys(), pele_session_keys(), franz_session_keys()],
            vec![],
            // Ethereum chain ID
            SS58Prefix::get() as u64,
        ))
        .build()
}

/// Configure initial storage state for FRAME modules.
fn testnet_genesis(
    sudo_key: AccountId,
    mut endowed_accounts: Vec<AccountId>,
    initial_authorities: Vec<(AccountId, AccountId, BabeId, GrandpaId, ImOnlineId)>,
    initial_nominators: Vec<AccountId>,
    chain_id: u64,
) -> serde_json::Value {
    // endow all authorities and nominators.
    initial_authorities
        .iter()
        .map(|x| &x.0)
        .chain(initial_nominators.iter())
        .for_each(|x| {
            if !endowed_accounts.contains(x) {
                endowed_accounts.push(*x)
            }
        });

    let num_endowed_accounts = endowed_accounts.len();

    // stakers: all validators and nominators.
    const ENDOWMENT: Balance = 100_000_000 * DOLLARS;
    const STASH: Balance = ENDOWMENT / 1000;
    let mut rng = rand::thread_rng();
    let stakers = initial_authorities
        .iter()
        .map(|x| (x.0, x.1, STASH, StakerStatus::Validator))
        .chain(initial_nominators.iter().map(|x| {
            use rand::{seq::SliceRandom, Rng};
            let limit = (MaxNominations::get() as usize).min(initial_authorities.len());
            let count = rng.gen::<usize>() % limit;
            let nominations = initial_authorities
                .as_slice()
                .choose_multiple(&mut rng, count)
                .map(|choice| choice.0)
                .collect::<Vec<_>>();
            (*x, *x, STASH, StakerStatus::Nominator(nominations))
        }))
        .collect::<Vec<_>>();
    let evm_accounts = {
        let mut map = BTreeMap::new();
        map.insert(
            // H160 address of Alice dev account
            // Derived from SS58 (42 prefix) address
            // SS58: 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY
            // hex: 0xd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d
            // Using the full hex key, truncating to the first 20 bytes (the first 40 hex chars)
            H160::from_str("8097c3C354652CB1EEed3E5B65fBa2576470678A")
                .expect("internal H160 is valid; qed"),
            fp_evm::GenesisAccount {
                balance: U256::from_str("0xffffffffffffffffffffffffffffffff")
                    .expect("internal U256 is valid; qed"),
                code: Default::default(),
                nonce: Default::default(),
                storage: Default::default(),
            },
        );
        map.insert(
            // H160 address of CI test runner account
            H160::from_str("6be02d1d3665660d22ff9624b7be0551ee1ac91b")
                .expect("internal H160 is valid; qed"),
            fp_evm::GenesisAccount {
                balance: U256::from_str("0xffffffffffffffffffffffffffffffff")
                    .expect("internal U256 is valid; qed"),
                code: Default::default(),
                nonce: Default::default(),
                storage: Default::default(),
            },
        );
        map.insert(
            // H160 address for benchmark usage
            H160::from_str("1000000000000000000000000000000000000001")
                .expect("internal H160 is valid; qed"),
            fp_evm::GenesisAccount {
                nonce: U256::from(1),
                balance: U256::from(1_000_000_000_000_000_000_000_000u128),
                storage: Default::default(),
                code: vec![0x00],
            },
        );
        map
    };

    serde_json::json!({
        "sudo": {
            "key": Some(sudo_key),
        },
        "balances": {
            "balances": endowed_accounts.iter().cloned().map(|k| (k, ENDOWMENT)).collect::<Vec<_>>(),
        },
        "babe": {
            "epochConfig": Some(BABE_GENESIS_EPOCH_CONFIG),
        },
        "session": {
            "keys": initial_authorities
                .iter()
                .map(|x| (x.1, x.0, session_keys(x.2.clone(), x.3.clone(), x.4.clone())))
                .collect::<Vec<_>>(),
        },
        "staking": {
            "validatorCount": initial_authorities.len() as u32,
            "minimumValidatorCount": initial_authorities.len() as u32,
            "invulnerables": initial_authorities.iter().map(|x| x.0).collect::<Vec<_>>(),
            "slashRewardFraction": Perbill::from_percent(10),
            "stakers": stakers.clone(),
            "minValidatorBond": 75_000 * DOLLARS,
            "minNominatorBond": 10 * DOLLARS,
        },
        "elections": {
            "members": endowed_accounts
                .iter()
                .take((num_endowed_accounts + 1) / 2)
                .cloned()
                .map(|member| (member, STASH))
                .collect::<Vec<_>>(),
        },
        "technicalCommittee": {
            "members": endowed_accounts
                .iter()
                .take((num_endowed_accounts + 1) / 2)
                .cloned()
                .collect::<Vec<_>>(),
        },
        "evmChainId": { "chainId": chain_id },
        "evm": {
            "accounts": evm_accounts,
        },
        "nominationPools": {
            "minCreateBond": 10 * DOLLARS,
            "minJoinBond": DOLLARS,
        },
    })
}

mod devnet_keys {
    use super::*;

    pub(super) fn alith() -> AccountId {
        AccountId::from(hex!("f24FF3a9CF04c71Dbc94D0b566f7A27B94566cac"))
    }

    pub(super) fn baltathar() -> AccountId {
        AccountId::from(hex!("3Cd0A705a2DC65e5b1E1205896BaA2be8A07c6e0"))
    }

    pub(super) fn charleth() -> AccountId {
        AccountId::from(hex!("798d4Ba9baf0064Ec19eB4F0a1a45785ae9D6DFc"))
    }

    pub(super) fn dorothy() -> AccountId {
        AccountId::from(hex!("773539d4Ac0e786233D90A233654ccEE26a613D9"))
    }

    pub(super) fn ethan() -> AccountId {
        AccountId::from(hex!("Ff64d3F6efE2317EE2807d223a0Bdc4c0c49dfDB"))
    }

    pub(super) fn faith() -> AccountId {
        AccountId::from(hex!("C0F0f4ab324C46e55D02D0033343B4Be8A55532d"))
    }

    pub(super) fn goliath() -> AccountId {
        AccountId::from(hex!("7BF369283338E12C90514468aa3868A551AB2929"))
    }

    pub(super) fn alice_session_keys() -> (AccountId, AccountId, BabeId, GrandpaId, ImOnlineId) {
        (
            AccountId::from(hex!("487d29457e604aa45c35778Af0d76fCCaC195822")), // stash
            AccountId::from(hex!("8097c3C354652CB1EEed3E5B65fBa2576470678A")), // controller
            sp_core::sr25519::Public::from_raw(hex!(
                "d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d"
            ))
            .into(),
            sp_core::ed25519::Public::from_raw(hex!(
                "88dc3417d5058ec4b4503e0c12ea1a0a89be200fe98922423d4334014fa6b0ee"
            ))
            .into(),
            sp_core::sr25519::Public::from_raw(hex!(
                "d43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d"
            ))
            .into(),
        )
    }

    pub(super) fn bob_session_keys() -> (AccountId, AccountId, BabeId, GrandpaId, ImOnlineId) {
        (
            AccountId::from(hex!("9D370e560F42d1041eE835169df9A921A6e2589A")), // stash
            AccountId::from(hex!("9Ab9804Ff30EB824b5410FC14231C1cA47A879E8")), // controller
            sp_core::sr25519::Public::from_raw(hex!(
                "8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48"
            ))
            .into(),
            sp_core::ed25519::Public::from_raw(hex!(
                "d17c2d7823ebf260fd138f2d7e27d114c0145d968b5ff5006125f2414fadae69"
            ))
            .into(),
            sp_core::sr25519::Public::from_raw(hex!(
                "8eaf04151687736326c9fea17e25fc5287613693c912909cb226aa4794f26a48"
            ))
            .into(),
        )
    }
}

mod testnet_keys {
    use super::*;

    pub(super) fn lionel() -> AccountId {
        AccountId::from(hex!("1A5E1E46079b69f8c3bB853253005595776B292a"))
    }

    pub(super) fn diego() -> AccountId {
        AccountId::from(hex!("ecE34A4eAb98014B6118Af57737cF20e8C7B6cB7"))
    }

    pub(super) fn pele() -> AccountId {
        AccountId::from(hex!("a70bc22F1b546A070769002E9cd909e15b09A47A"))
    }

    pub(super) fn franz() -> AccountId {
        AccountId::from(hex!("57D650279B0EC63277430868bcA32B31eCf323Dc"))
    }

    pub(super) fn johan() -> AccountId {
        AccountId::from(hex!("795dF05777CCD03e0B568a4C5aed366e231D0c8E"))
    }

    pub(super) fn ronaldo() -> AccountId {
        AccountId::from(hex!("1a36b1ef5AA7439e11CF6A07581ABE473A59B572"))
    }

    pub(super) fn zinedine() -> AccountId {
        AccountId::from(hex!("2c0c3C3A85B0F5cf59b5c290033bAe866e5228c4"))
    }

    pub(super) fn cristiano() -> AccountId {
        AccountId::from(hex!("ae3043bCF47658F266258415363D745FAE009Fb4"))
    }

    pub(super) fn michel() -> AccountId {
        AccountId::from(hex!("C36821F9F66893c683349007B0d82f03948BebC6"))
    }

    pub(super) fn roberto() -> AccountId {
        AccountId::from(hex!("368f9d1D4f3b1EF461dD68F0458D57B32DF4e639"))
    }

    pub(super) fn diego_session_keys() -> (AccountId, AccountId, BabeId, GrandpaId, ImOnlineId) {
        (
            AccountId::from(hex!("60dD15D650881EFbDDc7687E53Cca8C59918F7dE")), // stash
            diego(),
            sp_core::sr25519::Public::from_raw(hex!(
                "46c4b1db570721a9a63b15d64a18079a22a07359904197d3dc495cadf6f4f819"
            ))
            .into(),
            sp_core::ed25519::Public::from_raw(hex!(
                "184421c2c8895ca3e2c153bfe05197235addfa1f29c885f00d517c00ae6a97cd"
            ))
            .into(),
            sp_core::sr25519::Public::from_raw(hex!(
                "46c4b1db570721a9a63b15d64a18079a22a07359904197d3dc495cadf6f4f819"
            ))
            .into(),
        )
    }

    pub(super) fn pele_session_keys() -> (AccountId, AccountId, BabeId, GrandpaId, ImOnlineId) {
        (
            AccountId::from(hex!("a5af63F5c55f107100968F7061466148FBdFFB73")), // stash
            pele(),
            sp_core::sr25519::Public::from_raw(hex!(
                "f21ebebfb3dc7410f49616e33e30e0f3cecd77229e6948c1a37298dc9f69bd74"
            ))
            .into(),
            sp_core::ed25519::Public::from_raw(hex!(
                "3fd3328b86cdd20c83741e43840dd2255b7b4533d29939695a02f5cbbbae89a4"
            ))
            .into(),
            sp_core::sr25519::Public::from_raw(hex!(
                "f21ebebfb3dc7410f49616e33e30e0f3cecd77229e6948c1a37298dc9f69bd74"
            ))
            .into(),
        )
    }

    pub(super) fn franz_session_keys() -> (AccountId, AccountId, BabeId, GrandpaId, ImOnlineId) {
        (
            AccountId::from(hex!("2Ad92a54f35c1f1C557ED818dA4F3BF25c9A1C32")), // stash
            franz(),
            sp_core::sr25519::Public::from_raw(hex!(
                "08c6047923ddfbafa2f6a42b20132456f6e9afb01552441b0fc13e35f799dc1a"
            ))
            .into(),
            sp_core::ed25519::Public::from_raw(hex!(
                "6064c973e8353e0064b00e9b21c7aedabc2b410792d020cbd1483b0ef48c9f06"
            ))
            .into(),
            sp_core::sr25519::Public::from_raw(hex!(
                "08c6047923ddfbafa2f6a42b20132456f6e9afb01552441b0fc13e35f799dc1a"
            ))
            .into(),
        )
    }
}

fn session_keys(babe: BabeId, grandpa: GrandpaId, im_online: ImOnlineId) -> SessionKeys {
    SessionKeys { babe, grandpa, im_online }
}

/// Generate a crypto pair from seed.
pub fn get_from_seed<TPublic: Public>(seed: &str) -> <TPublic::Pair as Pair>::Public {
    TPublic::Pair::from_string(&format!("//{}", seed), None)
        .expect("static values are valid; qed")
        .public()
}

/// Generate an account ID from seed.
/// For use with `AccountId32`, `dead_code` if `AccountId20`.
#[allow(dead_code)]
pub fn get_account_id_from_seed<TPublic: Public>(seed: &str) -> AccountId
where
    AccountPublic: From<<TPublic::Pair as Pair>::Public>,
{
    AccountPublic::from(get_from_seed::<TPublic>(seed)).into_account()
}

/// Generate authority keys
// pub fn authority_keys_from_seed(s: &str) -> (AccountId, AccountId, BabeId, GrandpaId, ImOnlineId) {
//     (
//         AccountId::from(hex!("487d29457e604aa45c35778Af0d76fCCaC195822")),   // Alice//stash
//         AccountId::from(hex!("8097c3C354652CB1EEed3E5B65fBa2576470678A")),   // Alice
//         get_from_seed::<BabeId>(s),
//         get_from_seed::<GrandpaId>(s),
//         get_from_seed::<ImOnlineId>(s),
//     )
// }

// Chain properties
fn properties() -> Properties {
    let mut properties = Properties::new();
    properties.insert("tokenSymbol".into(), "BOL".into());
    properties.insert("tokenDecimals".into(), 18.into());
    properties.insert("ss58Format".into(), SS58Prefix::get().into());
    properties
}
