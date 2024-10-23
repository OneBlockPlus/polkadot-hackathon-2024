//! Utilities for writing integration tests against ledger APIs (both Rust API and REST APIs).

use std::net::SocketAddr;
use std::str::FromStr;

use sha2::Digest;
use sov_bank::utils::TokenHolder;
use sov_bank::{Coins, TokenId};
use sov_db::ledger_db::{LedgerDb, SlotCommit};
use sov_db::schema::SchemaBatch;
use sov_ledger_apis::LedgerRoutes;
use sov_mock_da::{MockBlock, MockBlockHeader, MockDaSpec, MockHash};
use sov_modules_api::da::Time;
use sov_modules_api::{AggregatedProofPublicData, CodeCommitment, ModuleId, StoredEvent};
use sov_rollup_interface::stf::{BatchReceipt, TransactionReceipt, TxEffect};
use sov_rollup_interface::zk::aggregated_proof::{AggregatedProof, SerializedAggregatedProof};
use sov_rollup_interface::TxHash;
use tempfile::{tempdir, TempDir};

use crate::storage::SimpleLedgerStorageManager;
use crate::{TestSpec, TestTxReceiptContents};

type TestEvent = demo_stf::runtime::RuntimeEvent<TestSpec, MockDaSpec>;

pub extern crate sov_ledger_json_client;

/// Very simple utility function: it just persists some dummy data to the
/// [`LedgerDb`], so that it's not empty when you read it within tests.
pub async fn materialize_simple_ledger_db_data(
    ledger_db: &LedgerDb,
) -> anyhow::Result<SchemaBatch> {
    let block_a = MockBlock::default();

    let mut slot: SlotCommit<MockBlock, i32, TestTxReceiptContents> = SlotCommit::new(block_a);

    let tx_receipts = vec![TransactionReceipt {
        tx_hash: TxHash::new([1; 32]),
        body_to_save: Some(b"tx-body".to_vec()),
        events: events(),
        receipt: TxEffect::Successful(0),
        gas_used: vec![0, 1, u64::MAX],
    }];

    slot.add_batch(BatchReceipt {
        batch_hash: [10; 32],
        tx_receipts,
        inner: 0,
        gas_price: vec![0, 1, u64::MAX],
    });

    let mut ledger_data = ledger_db.materialize_slot(slot, b"state-root")?;

    ledger_data.merge(ledger_db.materialize_aggregated_proof(AggregatedProof::new(
        SerializedAggregatedProof {
            raw_aggregated_proof: b"aggregated-proof".to_vec(),
        },
        // By filling all the fields, clients can more thoroughly test
        // (de)serialization logic.
        //
        // This data doesn't make any sense (they're not even hashes...), but
        // it's just for testing.
        AggregatedProofPublicData {
            validity_conditions: vec![],
            initial_slot_number: u64::MAX,
            final_slot_number: u64::MAX,
            genesis_state_root: b"genesis-state-root".to_vec(),
            initial_state_root: b"initial-state-root".to_vec(),
            final_state_root: b"final-state-root".to_vec(),
            initial_slot_hash: b"initial-slot-hash".to_vec(),
            final_slot_hash: b"final-slot-hash".to_vec(),
            code_commitment: CodeCommitment(b"code-commitment".to_vec()),
            rewarded_addresses: vec![b"prover-address".to_vec()],
        },
    ))?);

    Ok(ledger_data)
}

fn events() -> Vec<StoredEvent> {
    let holder = TokenHolder::Module(ModuleId::from([0; 32]));
    let token_id =
        TokenId::from_str("token_1rwrh8gn2py0dl4vv65twgctmlwck6esm2as9dftumcw89kqqn3nqrduss6")
            .unwrap();

    let event_value1 = TestEvent::bank(sov_bank::event::Event::TokenCreated {
        token_name: "token".to_string(),
        coins: Coins {
            amount: 0,
            token_id,
        },
        minter: holder.clone(),
        authorized_minters: vec![],
    });
    let event_value2 = TestEvent::bank(sov_bank::event::Event::TokenFrozen {
        token_id,
        freezer: holder,
    });

    vec![
        StoredEvent::new("foo".as_bytes(), &borsh::to_vec(&event_value1).unwrap()),
        StoredEvent::new("bar".as_bytes(), &borsh::to_vec(&event_value2).unwrap()),
    ]
}

/// Materialize some complex data for the [`LedgerDb`]. Returns a [`SchemaBatch`] containing the description of the data to be stored.
pub fn materialize_complex_ledger_db_data(ledger_db: &LedgerDb) -> anyhow::Result<SchemaBatch> {
    let mut slots: Vec<SlotCommit<MockBlock, u32, TestTxReceiptContents>> =
        vec![SlotCommit::new(MockBlock {
            header: MockBlockHeader {
                prev_hash: MockHash(sha2::Sha256::digest(b"prev_header").into()),
                hash: MockHash(sha2::Sha256::digest(b"slot_data").into()),
                height: 0,
                time: Time::now(),
            },
            validity_cond: Default::default(),
            batch_blobs: Default::default(),
            proof_blobs: Default::default(),
        })];

    let batches = vec![
        BatchReceipt {
            batch_hash: sha2::Sha256::digest(b"batch_receipt").into(),
            tx_receipts: vec![
                TransactionReceipt::<TestTxReceiptContents> {
                    tx_hash: sha2::Sha256::digest(b"tx1").into(),
                    body_to_save: Some(b"tx1 body".to_vec()),
                    events: vec![],
                    receipt: TxEffect::Successful(0),
                    gas_used: vec![0, 0],
                },
                TransactionReceipt::<TestTxReceiptContents> {
                    tx_hash: sha2::Sha256::digest(b"tx2").into(),
                    body_to_save: Some(b"tx2 body".to_vec()),
                    events: vec![
                        StoredEvent::new("event1_key".as_bytes(), "event1_value".as_bytes()),
                        StoredEvent::new("event2_key".as_bytes(), "event2_value".as_bytes()),
                    ],
                    receipt: TxEffect::Successful(1),
                    gas_used: vec![2, 3],
                },
            ],
            inner: 0,
            gas_price: vec![0, 0],
        },
        BatchReceipt {
            batch_hash: sha2::Sha256::digest(b"batch_receipt2").into(),
            tx_receipts: batch2_tx_receipts(),
            inner: 1,
            gas_price: vec![0, 0],
        },
    ];

    for batch in batches {
        slots.get_mut(0).unwrap().add_batch(batch);
    }

    let mut ledger_data = SchemaBatch::new();
    for slot in slots {
        let state_root = format!("state-root-{}", slot.slot_data().header.height);
        ledger_data.merge(ledger_db.materialize_slot(slot, state_root.as_bytes())?);
    }

    ledger_data.merge(ledger_db.materialize_aggregated_proof(AggregatedProof::new(
        SerializedAggregatedProof {
            raw_aggregated_proof: b"aggregated-proof".to_vec(),
        },
        // By filling all the fields, clients can more thoroughly test
        // (de)serialization logic.
        //
        // This data doesn't make any sense (they're not even hashes...), but
        // it's just for testing.
        AggregatedProofPublicData {
            validity_conditions: vec![],
            initial_slot_number: u64::MAX,
            final_slot_number: u64::MAX,
            genesis_state_root: b"genesis-state-root".to_vec(),
            initial_state_root: b"initial-state-root".to_vec(),
            final_state_root: b"final-state-root".to_vec(),
            initial_slot_hash: b"initial-slot-hash".to_vec(),
            final_slot_hash: b"final-slot-hash".to_vec(),
            code_commitment: CodeCommitment(b"code-commitment".to_vec()),
            rewarded_addresses: vec![b"prover-address".to_vec()],
        },
    ))?);

    Ok(ledger_data)
}

fn batch2_tx_receipts() -> Vec<TransactionReceipt<TestTxReceiptContents>> {
    (0..260u64)
        .map(|i| TransactionReceipt::<TestTxReceiptContents> {
            tx_hash: ::sha2::Sha256::digest(i.to_string()).into(),
            body_to_save: Some(b"tx body".to_vec()),
            events: vec![],
            receipt: TxEffect::Skipped(0),
            gas_used: vec![0, 0],
        })
        .collect()
}

/// The different types of data that can be used to test the [`LedgerDb`].
pub enum LedgerTestServiceData {
    /// The data used to test the [`LedgerDb`] is simple.
    Simple,
    /// The data used to test the [`LedgerDb`] is complex.
    Complex,
}

/// Everything that one needs to run tests against the ledger APIs.
pub struct LedgerTestService {
    // Must be kept in scope during the test to avoid directory deletion.
    _dir: TempDir,
    /// An Axum server handle.
    pub axum_handle: axum_server::Handle,
    /// An Axum client.
    pub axum_client: sov_ledger_json_client::Client,
}

impl LedgerTestService {
    /// Instantiates a new [`LedgerDb`] and starts serving data over both JSON-RPC and Axum.
    pub async fn new(data: LedgerTestServiceData) -> anyhow::Result<LedgerTestService> {
        let dir = tempdir()?;

        let mut storage_manager = SimpleLedgerStorageManager::new(dir.path());
        let reader = storage_manager.create_ledger_storage();
        let ledger_db = LedgerDb::with_reader(reader)?;

        let ledger_data = match data {
            LedgerTestServiceData::Simple => materialize_simple_ledger_db_data(&ledger_db).await?,
            LedgerTestServiceData::Complex => materialize_complex_ledger_db_data(&ledger_db)?,
        };

        ledger_db.send_notifications();
        storage_manager.commit(ledger_data);

        let axum_handle = axum_server::Handle::new();
        let axum_handle1 = axum_handle.clone();
        let ledger_db1 = ledger_db.clone();
        tokio::spawn(async move {
            let addr = SocketAddr::from_str("127.0.0.1:0").unwrap();
            axum_server::Server::bind(addr)
                .handle(axum_handle1)
                .serve(
                    LedgerRoutes::<LedgerDb, u32, TestTxReceiptContents, TestEvent>::axum_router(
                        ledger_db1.clone(),
                        "/ledger",
                    )
                    .with_state::<()>(ledger_db1)
                    .into_make_service(),
                )
                .await
                .unwrap();
        });

        let axum_addr = axum_handle
            .listening()
            .await
            .ok_or(anyhow::anyhow!("Failed to bind"))?;
        let axum_client = sov_ledger_json_client::Client::new(&format!("http://{}", axum_addr));

        Ok(Self {
            _dir: dir,
            axum_handle,
            axum_client,
        })
    }
}

#[cfg(test)]
mod tests {
    use sov_mock_da::MockDaSpec;

    use super::*;
    use crate::TestSpec;

    #[test]
    fn events_deserialize_correctly() {
        let events = events();
        for event in events {
            <demo_stf::runtime::RuntimeEvent<TestSpec, MockDaSpec> as borsh::BorshDeserialize>::deserialize(
                &mut &event.value().inner()[..]).unwrap();
        }
    }
}
