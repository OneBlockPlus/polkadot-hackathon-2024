//! Concrete implementation(s) of [`BatchBuilder`].
use core::marker::PhantomData;

use anyhow::bail;
use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use sov_modules_api::capabilities::Authenticator;
use sov_modules_api::digest::Digest;
use sov_modules_api::runtime::capabilities::Kernel;
use sov_modules_api::{CryptoSpec, Gas, GasArray, KernelWorkingSet, RawTx, Spec, StateCheckpoint};
use sov_modules_stf_blueprint::{process_tx, ApplyTxResult, Runtime, TxEffect, TxProcessingError};
use sov_rollup_interface::da::DaSpec;
use sov_rollup_interface::services::batch_builder::{BatchBuilder, TxWithHash};
use tokio::sync::watch;

use crate::db::{MempoolTx, SequencerDb};
use crate::mempool::{FairMempool, MempoolCursor};
use crate::tx_status::TxStatusNotifier;
use crate::TxHash;

/// Configuration for [`FairBatchBuilder`].
#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct FairBatchBuilderConfig<Da: DaSpec> {
    /// Maximum number of transactions in mempool. Once this limit is reached,
    /// the batch builder will evict older transactions.
    pub mempool_max_txs_count: usize,
    /// Maximum size of a batch. The batch builder will not build batches larger
    /// than this size.
    pub max_batch_size_bytes: usize,
    /// DA address of the sequencer.
    pub sequencer_address: Da::Address,
}

/// A [`BatchBuilder`] that creates batches of transactions in a way that's
/// reasonably "fair" to everybody.
///
/// Transactions are included in batches by following a largest-first,
/// least-recent-first priority. Only transactions that were successfully
/// dispatched are included.
pub struct FairBatchBuilder<
    S: Spec,
    Da: DaSpec,
    R: Runtime<S, Da>,
    K,
    Auth: Authenticator<Spec = S>,
> {
    runtime: R,
    kernel: K,
    mempool: FairMempool<Da>,
    max_batch_size_bytes: usize,
    current_storage: watch::Receiver<S::Storage>,
    sequencer: Da::Address,
    _phantom: PhantomData<Auth>,
}

impl<S, Da, R, K, Auth> FairBatchBuilder<S, Da, R, K, Auth>
where
    S: Spec,
    Da: DaSpec,
    R: Runtime<S, Da>,
    Auth: Authenticator<Spec = S, DispatchCall = R>,
{
    /// [`BatchBuilder`] constructor.
    pub fn new(
        runtime: R,
        kernel: K,
        notifier: TxStatusNotifier<Da>,
        current_storage: watch::Receiver<<S as Spec>::Storage>,
        sequencer_db: SequencerDb,
        config: FairBatchBuilderConfig<Da>,
    ) -> anyhow::Result<Self> {
        Ok(Self {
            mempool: FairMempool::new(sequencer_db, notifier, config.mempool_max_txs_count)?,
            max_batch_size_bytes: config.max_batch_size_bytes,
            runtime,
            kernel,
            current_storage,
            sequencer: config.sequencer_address,
            _phantom: PhantomData,
        })
    }

    /// Returns [`None`] if the transaction does not fit inside the batch.
    fn try_add_tx_to_batch(
        &self,
        mempool_tx: &MempoolTx,
        ctx: &mut BatchConstructionContext<S>,
    ) -> anyhow::Result<Option<sov_modules_stf_blueprint::TransactionReceipt>> {
        // To fill a batch as big as possible, we only check if valid
        // tx can fit in the batch.
        let tx_len = mempool_tx.tx_bytes.len();
        if ctx.current_batch_size_in_bytes + tx_len > self.max_batch_size_bytes {
            return Ok(None);
        }

        // TODO(`<https://github.com/Sovereign-Labs/sovereign-sdk-wip/issues/625>`). Hack: we need to temporarily take ownership of the `StateCheckpoint` to be able to call [`sov_modules_api::runtime::capabilities::SequencerAuthorization::authorize_sequencer`].
        let state_checkpoint = ctx.state_checkpoint.take().unwrap();
        let tx_scratchpad = state_checkpoint.to_tx_scratchpad();
        let res = process_tx(
            &self.runtime,
            &RawTx {
                data: mempool_tx.tx_bytes.clone(),
            },
            &self.sequencer,
            &ctx.gas_price,
            ctx.visible_height,
            tx_scratchpad,
        );

        match res {
            Err(TxProcessingError {
                tx_scratchpad,
                reason,
            }) => {
                // ...and immediately store the new `StateCheckpoint`.
                ctx.state_checkpoint = Some(tx_scratchpad.revert());

                bail!("An error occurred when trying to add the tx to the batch: {reason}")
            }
            Ok(ApplyTxResult {
                tx_scratchpad,
                receipt,
                sequencer_reward,
            }) => {
                // ...and immediately store the new `StateCheckpoint`.
                ctx.state_checkpoint = Some(tx_scratchpad.commit());

                let current_reward = ctx.reward;
                let reward = Into::<u64>::into(sequencer_reward);
                ctx.reward = current_reward.checked_add(reward).ok_or_else(|| {
                    anyhow::anyhow!("Rewarding the sequencer would cause overflow")
                })?;

                Ok(Some(receipt))
            }
        }
    }

    fn mempool_cursor(&self, ctx: &BatchConstructionContext<S>) -> MempoolCursor {
        MempoolCursor::new(
            self.max_batch_size_bytes
                .checked_sub(ctx.current_batch_size_in_bytes)
                .unwrap(),
        )
    }
}

#[async_trait]
impl<S, Da, R, K, Auth> BatchBuilder for FairBatchBuilder<S, Da, R, K, Auth>
where
    S: Spec,
    Da: DaSpec,
    R: Runtime<S, Da> + 'static,
    K: Kernel<S, Da> + 'static,
    Auth: Authenticator<Spec = S, DispatchCall = R>,
{
    /// Attempt to add transaction to the mempool.
    ///
    /// The transaction is discarded if:
    /// - mempool is full
    /// - transaction is invalid (deserialization, verification or decoding of the runtime message failed)
    async fn accept_tx(&mut self, raw: Vec<u8>) -> anyhow::Result<TxHash> {
        tracing::trace!(raw_tx = hex::encode(&raw), "`accept_tx` has been called");

        if raw.len() > self.max_batch_size_bytes {
            bail!(
                "Transaction is too big. Max allowed size: {}, submitted size: {}",
                self.max_batch_size_bytes,
                raw.len()
            )
        }

        // Note: We cannot use context here because we test the content of the inner message.
        // Instead of returning [`anyhow::Result`], we should maybe return a custom error type.
        // TODO `<https://github.com/Sovereign-Labs/sovereign-sdk-wip/issues/723>`: We should consider adding this check back, but we would need to give access to the state in this method
        // Auth::authenticate(&raw, &mut unlimited_gas_meter)
        //     .map_err(|e| anyhow::anyhow!("Authentication error while building a batch: {e:?}",))?;

        let hash = calculate_hash::<S>(&raw);
        tracing::debug!(
            raw_tx = hex::encode(&raw),
            %hash,
            "Adding a transaction to the mempool"
        );

        self.mempool.add_new_tx(hash, raw)?;
        tracing::debug!(
            %hash,
            "Transaction has been added to the mempool"
        );

        Ok(hash)
    }

    async fn contains(&self, hash: &TxHash) -> anyhow::Result<bool> {
        Ok(self.mempool.contains(hash))
    }

    /// Builds a new batch of valid transactions in order they were added to mempool.
    /// Only transactions which are dispatched successfully are included in the batch.
    async fn get_next_blob(&mut self, _height: u64) -> anyhow::Result<Vec<TxWithHash>> {
        tracing::debug!("get_next_blob has been called");

        // TODO: https://github.com/Sovereign-Labs/sovereign-sdk-wip/issues/224
        //     Use Kernel Hooks to get correct gas price
        // K: KernelSlotHooks<C, Da>>
        // let gas_price = self.kernel.begin_slot_hook(
        //     slot_header,
        //     validity_condition,
        //     pre_state_root,
        //     state_checkpoint,
        // ););

        let mut state_checkpoint = StateCheckpoint::new(self.current_storage.borrow().clone());
        let gas_price = <S::Gas as Gas>::Price::ZEROED;
        let kernel_working_set = KernelWorkingSet::from_kernel(&self.kernel, &mut state_checkpoint);
        let visible_height = kernel_working_set.virtual_slot();

        let mut ctx = BatchConstructionContext {
            visible_height,
            reward: 0,
            gas_price,
            state_checkpoint: Some(state_checkpoint),
            current_batch_size_in_bytes: 0,
        };

        let mut txs = Vec::new();

        let count_before = self.mempool.len();
        tracing::debug!(
            txs_count = count_before,
            "Going to build batch from transactions in mempool"
        );

        let mut cursor = self.mempool_cursor(&ctx);

        while let Some(mempool_tx) = self.mempool.next(&mut cursor) {
            let tx_receipt = self.try_add_tx_to_batch(&mempool_tx, &mut ctx)?;

            match tx_receipt.map(|r| r.receipt) {
                Some(TxEffect::Successful(_)) => {
                    tracing::info!(
                        hash = %mempool_tx.hash,
                        "Transaction has been included in the batch",
                    );

                    let tx_len = mempool_tx.tx_bytes.len();
                    ctx.current_batch_size_in_bytes += tx_len;

                    txs.push(TxWithHash {
                        raw_tx: mempool_tx.tx_bytes.clone(),
                        hash: mempool_tx.hash,
                    });

                    // Update the cursor to reflect the new amount of available
                    // space inside the batch.
                    cursor = cursor.max(self.mempool_cursor(&ctx));
                }
                Some(tx_receipt) => {
                    // Failed transaction; ignore and process the next one.
                    tracing::warn!(
                        ?tx_receipt,
                        tx = hex::encode(&mempool_tx.tx_bytes),
                        hash = %mempool_tx.hash,
                        "Error during transaction dispatch"
                    );
                    continue;
                }
                None => {
                    // We couldn't find any transaction that fits in the
                    // remaining space inside the batch; we're done.
                    break;
                }
            }
        }

        self.mempool
            .remove_atomically(txs.iter().map(|tx| tx.hash).collect::<Vec<_>>().as_slice())?;

        if txs.is_empty() {
            bail!(
                "No valid transactions are available out of {} were in the pool",
                count_before
            );
        }

        tracing::info!(
            txs_count = txs.len(),
            "Batch of transactions has been built"
        );

        Ok(txs)
    }
}

struct BatchConstructionContext<S: Spec> {
    visible_height: u64,
    reward: u64,
    gas_price: <S::Gas as Gas>::Price,
    state_checkpoint: Option<StateCheckpoint<S>>,
    current_batch_size_in_bytes: usize,
}

fn calculate_hash<S: Spec>(tx_raw: &[u8]) -> TxHash {
    TxHash::new(<S::CryptoSpec as CryptoSpec>::Hasher::digest(tx_raw).into())
}

#[cfg(test)]
mod tests {
    use rand::Rng;
    use sov_kernels::basic::BasicKernel;
    use sov_mock_da::{MockAddress, MockDaSpec};
    use sov_modules_api::macros::config_value;
    use sov_modules_api::transaction::{Transaction, UnsignedTransaction};
    use sov_modules_api::{Address, EncodeCall, Genesis, PrivateKey};
    use sov_state::{ProverStorage, Storage};
    use sov_test_utils::auth::TestAuth;
    use sov_test_utils::runtime::optimistic::{create_genesis_config, TestRuntime};
    use sov_test_utils::storage::{new_finalized_storage, SimpleStorageManager};
    use sov_test_utils::{
        TestPrivateKey, TestPublicKey, TestSpec, TestStorageSpec as StorageSpec,
        TEST_DEFAULT_MAX_FEE, TEST_DEFAULT_MAX_PRIORITY_FEE, TEST_DEFAULT_USER_BALANCE,
        TEST_DEFAULT_USER_STAKE,
    };
    use sov_value_setter::{CallMessage, ValueSetter};
    use tempfile::TempDir;

    use super::*;

    const MAX_TX_POOL_SIZE: usize = 20;
    const DEFAULT_SEQUENCER_DA_ADDRESS: MockAddress = MockAddress::new([0u8; 32]);
    const DEFAULT_SEQUENCER_ROLLUP_ADDRESS: <S as Spec>::Address = Address::new([0u8; 32]);

    type S = TestSpec;

    type BatchBuilder = FairBatchBuilder<
        S,
        MockDaSpec,
        TestRuntime<S, MockDaSpec>,
        BasicKernel<S, MockDaSpec>,
        TestAuth<S, MockDaSpec>,
    >;

    fn generate_random_valid_tx() -> Vec<u8> {
        let private_key = TestPrivateKey::generate();
        let mut rng = rand::thread_rng();
        let value: u32 = rng.gen();
        generate_valid_tx(&private_key, value)
    }

    fn generate_valid_tx(private_key: &TestPrivateKey, value: u32) -> Vec<u8> {
        let msg = CallMessage::SetValue(value);
        let msg = <TestRuntime<_, MockDaSpec> as EncodeCall<ValueSetter<S>>>::encode_call(msg);
        let chain_id = config_value!("CHAIN_ID");
        let max_priority_fee_bips = TEST_DEFAULT_MAX_PRIORITY_FEE;
        let max_fee = TEST_DEFAULT_MAX_FEE;
        let gas_limit = None;
        let nonce = 1;

        borsh::to_vec(&Transaction::<S>::new_signed_tx(
            private_key,
            UnsignedTransaction::new(
                msg,
                chain_id,
                max_priority_fee_bips,
                max_fee,
                nonce,
                gas_limit,
            ),
        ))
        .unwrap()
    }

    // This function is a helper for a test that was temporarily removed
    // TODO (when https://github.com/Sovereign-Labs/sovereign-sdk-wip/issues/723 is fixed) remove the `allow(dead_code)`
    #[allow(dead_code)]
    fn generate_random_bytes() -> Vec<u8> {
        let mut rng = rand::thread_rng();

        let length = rng.gen_range(1..=512);

        (0..length).map(|_| rng.gen()).collect()
    }

    // This function is a helper for a test that was temporarily removed
    // TODO (when https://github.com/Sovereign-Labs/sovereign-sdk-wip/issues/723 is fixed) remove the `allow(dead_code)`
    #[allow(dead_code)]
    fn generate_signed_tx_with_invalid_payload(private_key: &TestPrivateKey) -> Vec<u8> {
        let msg = generate_random_bytes();
        let chain_id = config_value!("CHAIN_ID");
        let max_priority_fee_bips = TEST_DEFAULT_MAX_PRIORITY_FEE;
        let max_fee = TEST_DEFAULT_MAX_FEE;
        let gas_limit = None;
        let nonce = 1;

        borsh::to_vec(&Transaction::<S>::new_signed_tx(
            private_key,
            UnsignedTransaction::new(
                msg,
                chain_id,
                max_priority_fee_bips,
                max_fee,
                nonce,
                gas_limit,
            ),
        ))
        .unwrap()
    }

    fn create_batch_builder(
        batch_size_bytes: usize,
        tmpdir: &TempDir,
        initial_storage: Option<ProverStorage<StorageSpec>>,
        sequencer_address: MockAddress,
    ) -> BatchBuilder {
        let sequencer_db_path = tmpdir.path().join("mempool");
        let storage = initial_storage.unwrap_or_else(|| {
            let state_path = tmpdir.path().join("state");
            new_finalized_storage(state_path)
        });
        let storage = watch::Sender::new(storage).subscribe();
        let sequencer_db = SequencerDb::new(sequencer_db_path).unwrap();
        let notifier = TxStatusNotifier::default();

        let config = FairBatchBuilderConfig {
            mempool_max_txs_count: MAX_TX_POOL_SIZE,
            max_batch_size_bytes: batch_size_bytes,
            sequencer_address,
        };
        BatchBuilder::new(
            TestRuntime::<S, MockDaSpec>::default(),
            BasicKernel::default(),
            notifier,
            storage,
            sequencer_db,
            config,
        )
        .unwrap()
    }

    fn setup_runtime(
        storage_manager: &mut SimpleStorageManager<StorageSpec>,
        admin: Option<TestPublicKey>,
        additional_accounts: Vec<(TestPublicKey, u64)>,
        seq_da_address: MockAddress,
        seq_rollup_address: <S as Spec>::Address,
    ) -> ProverStorage<StorageSpec> {
        let runtime = TestRuntime::<S, MockDaSpec>::default();
        let storage = storage_manager.create_storage();
        let state = StateCheckpoint::<S>::new(storage.clone());

        let admin = admin.unwrap_or_else(|| {
            let admin_private_key = TestPrivateKey::generate();
            admin_private_key.pub_key()
        });
        let admin = admin.to_address::<<S as Spec>::Address>();
        let additional_accounts: Vec<(<S as Spec>::Address, u64)> = additional_accounts
            .iter()
            .map(|(addr, balance)| {
                let addr = addr.to_address::<<S as Spec>::Address>();
                (addr, *balance)
            })
            .collect();

        let config = create_genesis_config(
            admin,
            &additional_accounts,
            seq_rollup_address,
            seq_da_address,
            TEST_DEFAULT_USER_STAKE,
            "BatchBuilderTestToken".to_string(),
            TEST_DEFAULT_USER_BALANCE,
        );

        let mut genesis_state =
            state.to_genesis_state_accessor::<TestRuntime<S, MockDaSpec>>(&config);
        runtime.genesis(&config, &mut genesis_state).unwrap();
        let (log, _, witness) = genesis_state.checkpoint().freeze();
        let (_root_hash, change_set) = storage.validate_and_materialize(log, &witness).unwrap();
        storage_manager.commit(change_set);
        storage_manager.create_storage()
    }

    mod accept_tx {
        use sov_rollup_interface::services::batch_builder::BatchBuilder;

        use super::*;

        #[tokio::test]
        async fn accept_valid_tx() {
            let tx = generate_random_valid_tx();

            let tmpdir = tempfile::tempdir().unwrap();
            let mut batch_builder =
                create_batch_builder(tx.len(), &tmpdir, None, DEFAULT_SEQUENCER_DA_ADDRESS);

            batch_builder.accept_tx(tx).await.unwrap();
        }

        #[tokio::test]
        async fn reject_tx_too_big() {
            let tx = generate_random_valid_tx();
            let tx_size = tx.len();
            let batch_size = tx.len().saturating_sub(1);

            let tmpdir = tempfile::tempdir().unwrap();
            let mut batch_builder =
                create_batch_builder(batch_size, &tmpdir, None, DEFAULT_SEQUENCER_DA_ADDRESS);

            let accept_result = batch_builder.accept_tx(tx).await;
            assert!(accept_result.is_err());
            assert_eq!(
                format!("Transaction is too big. Max allowed size: {batch_size}, submitted size: {tx_size}"),
                accept_result.unwrap_err().to_string()
            );
        }

        #[tokio::test]
        async fn new_tx_on_full_mempool_causes_evictions() {
            let tmpdir = tempfile::tempdir().unwrap();
            let mut batch_builder =
                create_batch_builder(usize::MAX, &tmpdir, None, DEFAULT_SEQUENCER_DA_ADDRESS);

            for _ in 0..MAX_TX_POOL_SIZE {
                let tx = generate_random_valid_tx();
                batch_builder.accept_tx(tx).await.unwrap();
            }

            assert_eq!(MAX_TX_POOL_SIZE, batch_builder.mempool.len());

            let tx = generate_random_valid_tx();
            batch_builder.accept_tx(tx).await.unwrap();

            assert_eq!(MAX_TX_POOL_SIZE, batch_builder.mempool.len());
        }

        // TODO(@theochap, https://github.com/Sovereign-Labs/sovereign-sdk-wip/issues/723): These two tests should be fixed once we find a way to add the authentication mechanism back to
        // the `accept_tx` method
        // #[tokio::test]
        // async fn reject_random_bytes_tx() {
        //     let tx = generate_random_bytes();

        //     let tmpdir = tempfile::tempdir().unwrap();
        //     let mut batch_builder =
        //         create_batch_builder(tx.len(), &tmpdir, None, DEFAULT_SEQUENCER_DA_ADDRESS);

        //     let accept_result = batch_builder.accept_tx(tx).await;
        //     assert!(accept_result.is_err());
        // }

        // #[tokio::test]
        // async fn reject_signed_tx_with_invalid_payload() {
        //     let private_key = TestPrivateKey::generate();
        //     let tx = generate_signed_tx_with_invalid_payload(&private_key);

        //     let tmpdir = tempfile::tempdir().unwrap();
        //     let mut batch_builder =
        //         create_batch_builder(tx.len(), &tmpdir, None, DEFAULT_SEQUENCER_DA_ADDRESS);

        //     let accept_result = batch_builder.accept_tx(tx).await;
        //     assert!(accept_result.is_err());
        //     assert!(accept_result
        //         .unwrap_err()
        //         .to_string()
        //         .to_lowercase()
        //         .contains("transaction decoding error"));
        // }
    }

    mod build_batch {
        use sov_rollup_interface::services::batch_builder::BatchBuilder;
        use sov_test_utils::storage::SimpleStorageManager;

        use super::*;

        #[tokio::test]
        async fn error_on_empty_mempool() {
            let tmpdir = tempfile::tempdir().unwrap();
            let mut storage_manager = SimpleStorageManager::new(tmpdir.path());
            let storage = setup_runtime(
                &mut storage_manager,
                None,
                vec![],
                DEFAULT_SEQUENCER_DA_ADDRESS,
                DEFAULT_SEQUENCER_ROLLUP_ADDRESS,
            );
            let mut batch_builder =
                create_batch_builder(10, &tmpdir, Some(storage), DEFAULT_SEQUENCER_DA_ADDRESS);

            let build_result = batch_builder.get_next_blob(1).await;
            assert!(build_result.is_err());
            assert_eq!(
                "No valid transactions are available out of 0 were in the pool",
                build_result.unwrap_err().to_string()
            );
        }

        #[tokio::test]
        async fn duplicate_txs_are_ignored() {
            let value_setter_admin = TestPrivateKey::generate();
            let txs = [
                // Two identical txs...
                generate_valid_tx(&value_setter_admin, 1),
                generate_valid_tx(&value_setter_admin, 1),
            ];

            let tmpdir = tempfile::tempdir().unwrap();
            let mut storage_manager = SimpleStorageManager::new(tmpdir.path());
            let storage = setup_runtime(
                &mut storage_manager,
                Some(value_setter_admin.pub_key()),
                vec![],
                DEFAULT_SEQUENCER_DA_ADDRESS,
                DEFAULT_SEQUENCER_ROLLUP_ADDRESS,
            );
            let mut batch_builder = create_batch_builder(
                usize::MAX,
                &tmpdir,
                Some(storage),
                DEFAULT_SEQUENCER_DA_ADDRESS,
            );

            for tx in &txs {
                batch_builder.accept_tx(tx.clone()).await.unwrap();
            }

            // The resulting batch should contain only one transaction (not two,
            // because we the second one is a duplicate!).
            assert_eq!(batch_builder.get_next_blob(1).await.unwrap().len(), 1);
        }

        #[tokio::test]
        async fn build_batch_invalidates_everything_on_missed_genesis() {
            let value_setter_admin = TestPrivateKey::generate();
            let txs = [
                // Should be included: 113 bytes
                generate_valid_tx(&value_setter_admin, 1),
                generate_valid_tx(&value_setter_admin, 2),
            ];

            let tmpdir = tempfile::tempdir().unwrap();
            let batch_size = txs[0].len() * 3 + 1;
            let mut batch_builder =
                create_batch_builder(batch_size, &tmpdir, None, DEFAULT_SEQUENCER_DA_ADDRESS);

            for tx in &txs {
                batch_builder.accept_tx(tx.clone()).await.unwrap();
            }

            assert_eq!(txs.len(), batch_builder.mempool.len());

            let batch_builder_result = batch_builder.get_next_blob(1).await;
            assert!(
                batch_builder_result.is_err(),
                "The batch builder should fail and not accept any txs"
            );
            assert!(
                batch_builder_result
                    .unwrap_err()
                    .to_string()
                    .to_lowercase()
                    .contains("the sequencer is not registered"),
                "The batch builder should have failed because the sequencer is not registered.
            This is because genesis has been skipped"
            );
        }

        #[tokio::test]
        async fn builds_batch_skipping_invalid_txs() {
            let value_setter_admin = TestPrivateKey::generate();
            let additional_account = TestPrivateKey::generate();
            let txs = [
                // Should be included
                generate_valid_tx(&value_setter_admin, 1),
                // Should be rejected, not admin
                generate_valid_tx(&additional_account, 2),
                // Should be included
                generate_valid_tx(&value_setter_admin, 3),
                // Should be skipped, more than batch size
                generate_valid_tx(&value_setter_admin, 4),
            ];

            assert!(
                txs.iter().all(|tx| tx.len() == txs[0].len()),
                "the test assumes all txs have equal length"
            );

            let tmpdir = tempfile::tempdir().unwrap();
            let mut storage_manager = SimpleStorageManager::new(tmpdir.path());
            let storage = setup_runtime(
                &mut storage_manager,
                Some(value_setter_admin.pub_key()),
                vec![(additional_account.pub_key(), 1_000_000_000)],
                DEFAULT_SEQUENCER_DA_ADDRESS,
                DEFAULT_SEQUENCER_ROLLUP_ADDRESS,
            );

            let batch_size = txs[0].len() + txs[2].len() + 1;
            let mut batch_builder = create_batch_builder(
                batch_size,
                &tmpdir,
                Some(storage),
                DEFAULT_SEQUENCER_DA_ADDRESS,
            );

            for tx in &txs {
                batch_builder.accept_tx(tx.clone()).await.unwrap();
            }

            assert_eq!(txs.len(), batch_builder.mempool.len());

            let build_result = batch_builder.get_next_blob(1).await;
            let blob = build_result
                .unwrap()
                .iter()
                // We discard hashes for the sake of comparison
                .map(|t| t.raw_tx.clone())
                .collect::<Vec<_>>();
            assert_eq!(2, blob.len());
            assert!(blob.contains(&txs[0]));
            assert!(!blob.contains(&txs[1]));
            assert!(blob.contains(&txs[2]));
            assert!(!blob.contains(&txs[3]));
            assert_eq!(2, batch_builder.mempool.len());
        }
    }
}
