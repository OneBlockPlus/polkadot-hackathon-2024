//! Setup code for [`super::command`] which would otherwise bloat that module.
//!
//! Should only be used for benchmarking as it may break in other contexts.

use crate::service::FullClient;

use node_template_runtime as runtime;
use runtime::{AccountId, Balance, BalancesCall, SystemCall};
use sc_cli::Result;
use sc_client_api::BlockBackend;
use sp_core::{ConstU32, Encode, Pair};
use sp_inherents::{InherentData, InherentDataProvider};
use sp_runtime::{MultiAddress, OpaqueExtrinsic};

use sp_core::bounded_vec::BoundedVec;
use sp_runtime::generic::Era;
use std::{sync::Arc, time::Duration};
use zklogin_support::{
    test_helper::{get_raw_data, get_test_eph_key, get_zklogin_inputs},
    JWKProvider, JwkId, Signature as InnerZkSignature,
};

/// Generates extrinsics for the `benchmark overhead` command.
///
/// Note: Should only be used for benchmarking.
pub struct ZkLoginRemarkBuilder {
    client: Arc<FullClient>,
}

impl ZkLoginRemarkBuilder {
    /// Creates a new [`Self`] from the given client.
    pub fn new(client: Arc<FullClient>) -> Self {
        Self { client }
    }
}

impl frame_benchmarking_cli::ExtrinsicBuilder for ZkLoginRemarkBuilder {
    fn pallet(&self) -> &str {
        "system"
    }

    fn extrinsic(&self) -> &str {
        "remark"
    }

    fn build(&self, nonce: u32) -> std::result::Result<OpaqueExtrinsic, &'static str> {
        let acc = get_test_eph_key();
        let extrinsic: OpaqueExtrinsic = create_zklogin_benchmark_extrinsic(
            self.client.as_ref(),
            acc,
            SystemCall::remark { remark: vec![] }.into(),
            nonce,
        )
        .into();

        Ok(extrinsic)
    }
}

/// Generates `Balances::TransferKeepAlive` extrinsics for the benchmarks.
///
/// Note: Should only be used for benchmarking.
pub struct ZkTransferKeepAliveBuilder {
    client: Arc<FullClient>,
    dest: AccountId,
    value: Balance,
}

impl ZkTransferKeepAliveBuilder {
    /// Creates a new [`Self`] from the given client.
    pub fn new(client: Arc<FullClient>, dest: AccountId, value: Balance) -> Self {
        Self { client, dest, value }
    }
}

impl frame_benchmarking_cli::ExtrinsicBuilder for ZkTransferKeepAliveBuilder {
    fn pallet(&self) -> &str {
        "balances"
    }

    fn extrinsic(&self) -> &str {
        "transfer_keep_alive"
    }

    fn build(&self, nonce: u32) -> std::result::Result<OpaqueExtrinsic, &'static str> {
        // hardcode eph private key
        let acc = get_test_eph_key();
        let extrinsic: OpaqueExtrinsic = create_zklogin_benchmark_extrinsic(
            self.client.as_ref(),
            acc,
            BalancesCall::transfer_keep_alive { dest: self.dest.clone().into(), value: self.value }
                .into(),
            nonce,
        )
        .into();

        Ok(extrinsic)
    }
}

/// Create a transaction using the given `call`.
///
/// Note: Should only be used for benchmarking.
pub fn create_zklogin_benchmark_extrinsic(
    client: &FullClient,
    eph_signer: sp_core::ed25519::Pair,
    call: runtime::RuntimeCall,
    nonce: u32,
) -> runtime::UncheckedExtrinsic {
    let genesis_hash = client.block_hash(0).ok().flatten().expect("Genesis block exists; qed");
    let best_hash = client.chain_info().best_hash;

    let extra: runtime::SignedExtra = (
        frame_system::CheckNonZeroSender::<runtime::Runtime>::new(),
        frame_system::CheckSpecVersion::<runtime::Runtime>::new(),
        frame_system::CheckTxVersion::<runtime::Runtime>::new(),
        frame_system::CheckGenesis::<runtime::Runtime>::new(),
        frame_system::CheckEra::<runtime::Runtime>::from(Era::immortal()),
        frame_system::CheckNonce::<runtime::Runtime>::from(nonce),
        frame_system::CheckWeight::<runtime::Runtime>::new(),
        pallet_transaction_payment::ChargeTransactionPayment::<runtime::Runtime>::from(0),
    );

    let raw_payload = runtime::SignedPayload::from_raw(
        call.clone(),
        extra.clone(),
        (
            (),
            runtime::VERSION.spec_version,
            runtime::VERSION.transaction_version,
            genesis_hash,
            best_hash,
            (),
            (),
            (),
        ),
    );

    let signature = raw_payload.using_encoded(|e| eph_signer.sign(e));

    let eph_pubkey = eph_signer.public();
    let (address_seed, input_data, max_epoch, _) = get_raw_data();
    let input = get_zklogin_inputs(input_data);

    let google_kid = "1f40f0a8ef3d880978dc82f25c3ec317c6a5b781";
    let google_jwk_id = JwkId::new(
        JWKProvider::Google,
        BoundedVec::<u8, ConstU32<256>>::truncate_from(google_kid.as_bytes().to_vec()),
    );

    // construct inner zk sig
    let inner_zk_sig =
        InnerZkSignature::new(google_jwk_id, input, max_epoch, eph_pubkey.into(), signature.into());

    // the address that excute the call and deducting fee from
    let address = MultiAddress::from(address_seed);

    let utx = runtime::UncheckedExtrinsic::new_signed(
        call,
        address,
        runtime::Signature::Zk(inner_zk_sig),
        extra,
    );

    let encoded = Encode::encode(&utx);
    println!("sending tx: {}", &hex::encode(encoded));

    utx
}

/// Generates inherent data for the `benchmark overhead` command.
///
/// Note: Should only be used for benchmarking.
pub fn inherent_benchmark_data() -> Result<InherentData> {
    let mut inherent_data = InherentData::new();
    let d = Duration::from_millis(0);
    let timestamp = sp_timestamp::InherentDataProvider::new(d.into());

    futures::executor::block_on(timestamp.provide_inherent_data(&mut inherent_data))
        .map_err(|e| format!("creating inherent data: {:?}", e))?;
    Ok(inherent_data)
}
