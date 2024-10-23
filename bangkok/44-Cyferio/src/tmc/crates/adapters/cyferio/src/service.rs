use crate::fee::CyferioFee;
use crate::spec::address::CyferioAddress;
use crate::spec::block::CyferioBlock;
use crate::spec::hash::CyferioHash;
use crate::spec::header::CyferioHeader;
use crate::spec::transaction::CyferioBlobTransaction;
use crate::spec::CyferioDaLayerSpec;
use crate::verifier::CyferioDaVerifier;
use anyhow::Error;
use async_stream::try_stream;
use async_trait::async_trait;
use base64::{engine::general_purpose, Engine as _};
use futures::stream::BoxStream;
use parking_lot::Mutex;
use sov_rollup_interface::da::{DaBlobHash, DaSpec, RelevantBlobs, RelevantProofs};
use sov_rollup_interface::services::da::{DaService, MaybeRetryable};
use std::collections::HashSet;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use subxt::backend::legacy::rpc_methods::BlockNumber;
use subxt::backend::{legacy::LegacyRpcMethods, rpc::RpcClient};
use subxt::config::Header;
use subxt::{OnlineClient, SubstrateConfig};
use subxt_signer::sr25519::dev;
use tokio::time::{sleep, Duration};

#[subxt::subxt(runtime_metadata_path = "./src/metadata.scale")]
pub mod substrate {}

type StatemintConfig = SubstrateConfig;

#[derive(Clone, PartialEq, serde::Deserialize, serde::Serialize)]
pub struct CyferioConfig {
    pub node_url: String,
    pub sender_address: CyferioAddress,
}

#[derive(Clone)]
pub struct DaProvider {
    pub rpc_client: RpcClient,
    pub client: Arc<OnlineClient<StatemintConfig>>,
    pub rpc: Arc<LegacyRpcMethods<StatemintConfig>>,
    last_processed_block: Arc<AtomicU64>,
    processed_blocks: Arc<Mutex<HashSet<u64>>>,
    last_processed_height: Arc<AtomicU64>,
    latest_known_height: Arc<AtomicU64>,
}

impl DaProvider {
    pub async fn from_config(config: CyferioConfig) -> Result<Self, Error> {
        let rpc_client = RpcClient::from_url(&config.node_url).await?;
        let client = OnlineClient::<StatemintConfig>::from_rpc_client(rpc_client.clone()).await?;
        let rpc = LegacyRpcMethods::<StatemintConfig>::new(rpc_client.clone());
        Ok(Self {
            rpc_client,
            client: Arc::new(client),
            rpc: Arc::new(rpc),
            last_processed_block: Arc::new(AtomicU64::new(0)),
            processed_blocks: Arc::new(Mutex::new(HashSet::new())),
            last_processed_height: Arc::new(AtomicU64::new(0)),
            latest_known_height: Arc::new(AtomicU64::new(0)),
        })
    }

    pub async fn new(config: CyferioConfig) -> Result<Self, MaybeRetryable<Error>> {
        let rpc_client = RpcClient::from_url(&config.node_url)
            .await
            .map_err(|e| MaybeRetryable::Transient(Error::from(e)))?;
        let client = OnlineClient::<StatemintConfig>::from_rpc_client(rpc_client.clone())
            .await
            .map_err(|e| MaybeRetryable::Transient(Error::from(e)))?;
        let rpc = LegacyRpcMethods::<StatemintConfig>::new(rpc_client.clone());

        let provider = Self {
            rpc_client,
            client: Arc::new(client),
            rpc: Arc::new(rpc),
            last_processed_block: Arc::new(AtomicU64::new(0)),
            processed_blocks: Arc::new(Mutex::new(HashSet::new())),
            last_processed_height: Arc::new(AtomicU64::new(0)),
            latest_known_height: Arc::new(AtomicU64::new(0)),
        };

        provider.update_latest_height().await?;
        println!(
            "Initial latest height: {}",
            provider.latest_known_height.load(Ordering::SeqCst)
        );

        Ok(provider)
    }

    // async fn wait_for_block(&self, height: u64) -> Result<CyferioBlock, MaybeRetryable<Error>> {
    //     let polling_interval = Duration::from_secs(1);
    //     let max_retries = 60;
    //     let mut retries = 0;

    //     let mut current_height = height;
    //     loop {
    //         let last_processed = self.last_processed_height.load(Ordering::SeqCst);
    //         if current_height <= last_processed {
    //             let latest_height = self
    //             .rpc
    //             .chain_get_header(None)
    //             .await
    //             .map_err(|e| MaybeRetryable::Transient(Error::from(e)))?
    //             .map(|header| header.number as u64) // Convert to u64
    //                 .unwrap_or(0);
    //             current_height = latest_height;
    //             println!("区块高度 {} 已经被处理，等待下一个区块", current_height);
    //             sleep(polling_interval).await;
    //             continue;
    //         }

    //         // 修改这里：将锁的范围限制在最小范围内
    //         let block_already_processed = {
    //             let processed_blocks = self.processed_blocks.lock();
    //             processed_blocks.contains(&current_height)
    //         };

    //         if block_already_processed {
    //             let latest_height = self
    //             .rpc
    //             .chain_get_header(None)
    //             .await
    //             .map_err(|e| MaybeRetryable::Transient(Error::from(e)))?
    //             .map(|header| header.number as u64) // Convert to u64
    //                 .unwrap_or(0);
    //             current_height = latest_height;
    //             println!("区块高度 {} 已经被处理，等待下一个区块", current_height);
    //             sleep(polling_interval).await;
    //             continue;
    //         }

    //         // 如果区块未被处理，尝试获取
    //         match self.get_block_inner(current_height).await {
    //             Ok(block) => return Ok(block),
    //             Err(MaybeRetryable::Transient(e)) => {
    //                 if retries >= max_retries {
    //                     return Err(MaybeRetryable::Transient(Error::msg(
    //                         "等待新区块时达到最大重试次数",
    //                     )));
    //                 }
    //                 retries += 1;
    //                 println!("获取区块 {} 时遇到暂时性错误: {:?}，重试中...", current_height, e);
    //                 sleep(polling_interval).await;
    //             }
    //             Err(e) => return Err(e),
    //         }
    //     }
    // }

    async fn wait_for_block(&self, height: u64) -> Result<CyferioBlock, MaybeRetryable<Error>> {
        let polling_interval = Duration::from_secs(1);
        let max_retries = 60;
        let mut retries = 0;

        loop {
            self.update_latest_height().await?;
            let latest_height = self.latest_known_height.load(Ordering::SeqCst);

            if height > latest_height {
                println!(
                    "wait block {} generate, current latest height {}",
                    height, latest_height
                );
                sleep(polling_interval).await;
                continue;
            }

            let block_already_processed = {
                let processed_blocks = self.processed_blocks.lock();
                processed_blocks.contains(&height)
            };

            if block_already_processed {
                println!(
                    "block height {} already processed, try get next block",
                    height
                );
                return Err(MaybeRetryable::Transient(Error::msg(
                    "Block already processed",
                )));
            }

            match self.get_block_inner(height).await {
                Ok(block) => {
                    println!("success get and process block {}", height);
                    return Ok(block);
                }
                Err(MaybeRetryable::Transient(e)) => {
                    if retries >= max_retries {
                        return Err(MaybeRetryable::Transient(Error::msg(
                            "wait new block reach max retry times",
                        )));
                    }
                    retries += 1;
                    println!(
                        "get block {} meet transient error: {:?}, retry...",
                        height, e
                    );
                    sleep(polling_interval).await;
                }
                Err(e) => return Err(e),
            }
        }
    }

    async fn get_block_inner(&self, height: u64) -> Result<CyferioBlock, MaybeRetryable<Error>> {
        self.check_and_reset_state().await?;

        let last_processed = self.last_processed_height.load(Ordering::SeqCst);
        if height <= last_processed {
            return Err(MaybeRetryable::Transient(Error::msg(format!(
                "Block at height {} already processed",
                height
            ))));
        }

        {
            let mut processed_blocks = self.processed_blocks.lock();
            if processed_blocks.contains(&height) {
                println!("Skipping already processed block at height: {}", height);
                return Err(MaybeRetryable::Transient(Error::msg(
                    "Block already processed",
                )));
            }
            processed_blocks.insert(height);
        }

        let last_processed = self.last_processed_block.load(Ordering::SeqCst);
        if height <= last_processed {
            println!("Warning: Processing a block with height {} less than or equal to last processed height {}", height, last_processed);
        }

        let latest_height = self
            .rpc
            .chain_get_header(None)
            .await
            .map_err(|e| MaybeRetryable::Transient(Error::from(e)))?
            .map(|header| header.number as u64) // Convert to u64
            .unwrap_or(0);

        if height > latest_height {
            return Err(MaybeRetryable::Transient(Error::msg(format!(
                "Requested height {} exceeds latest height {}",
                height, latest_height
            ))));
        }

        let current_hash = self
            .rpc
            .chain_get_block_hash(Some(BlockNumber::Number(height)))
            .await
            .map_err(|e| MaybeRetryable::Transient(Error::from(e)))?
            .ok_or_else(|| MaybeRetryable::Transient(Error::msg("Block hash not found")))?;

        println!("current_hash: {:?}", current_hash);
        let block_detail = self
            .rpc
            .chain_get_block(Some(current_hash))
            .await
            .map_err(|e| MaybeRetryable::Transient(Error::from(e)))?;
        match block_detail {
            Some(block) => {
                let header = block.block.header;
                let parent_hash = header.parent_hash;
                let state_root = header.state_root;
                let extrinsics_root = header.extrinsics_root;
                let number = header.number;
                let digest = header.digest.clone();
                let cyferio_header = CyferioHeader::new(
                    CyferioHash::from(current_hash),
                    number,
                    CyferioHash::from(parent_hash.0),
                    CyferioHash::from(state_root.0),
                    CyferioHash::from(extrinsics_root.0),
                    digest,
                );
                let transactions: Vec<CyferioBlobTransaction> = block
                    .block
                    .extrinsics
                    .into_iter()
                    .map(|extrinsic| CyferioBlobTransaction::from(extrinsic.0))
                    .collect();
                let cyferio_block = CyferioBlock::new(cyferio_header, transactions);

                // Update last_processed_block only if the new height is greater
                self.last_processed_block
                    .fetch_max(height, Ordering::SeqCst);
                self.last_processed_height.store(height, Ordering::SeqCst);
                Ok(cyferio_block)
            }
            None => Err(MaybeRetryable::Transient(Error::msg("Block not found"))),
        }
    }

    async fn get_next_block(&self) -> Result<CyferioBlock, MaybeRetryable<Error>> {
        let mut current_height = self.last_processed_height.load(Ordering::SeqCst);

        loop {
            current_height += 1;
            self.update_latest_height().await?;
            let latest_height = self.latest_known_height.load(Ordering::SeqCst);

            println!(
                "Attempting to get block at height: {}, Latest known height: {}",
                current_height, latest_height
            );

            if current_height > latest_height {
                println!(
                    "Waiting for new block. Current height: {}, Latest height: {}",
                    current_height, latest_height
                );
                tokio::time::sleep(Duration::from_secs(1)).await;
                continue;
            }

            // 检查是否已处理过此高度的块
            {
                let processed_blocks = self.processed_blocks.lock();
                if processed_blocks.contains(&current_height) {
                    println!(
                        "Block at height {} already processed, moving to next",
                        current_height
                    );
                    continue;
                }
            }

            println!("1");
            match self.get_block_inner(current_height).await {
                Ok(block) => {
                    println!("Successfully processed block at height: {}", current_height);
                    self.last_processed_height
                        .store(current_height, Ordering::SeqCst);

                    // 将处理过的块高度添加到集合中
                    {
                        let mut processed_blocks = self.processed_blocks.lock();
                        processed_blocks.insert(current_height);
                    }

                    return Ok(block);
                }
                Err(MaybeRetryable::Transient(e)) => {
                    println!(
                        "Error processing block at height {}: {:?}",
                        current_height, e
                    );
                    // 如果是暂时性错误，我们可以继续尝试下一个块
                    continue;
                }
                Err(e) => {
                    println!("Unexpected error at height {}: {:?}", current_height, e);
                    return Err(e);
                }
            }
        }
    }

    fn clean_old_processed_blocks(&self, current_height: u64) {
        let mut processed_blocks = self.processed_blocks.lock();
        if current_height >= 1000 {
            processed_blocks.retain(|&height| height > current_height - 1000);
        }
    }

    // 在 update_latest_height 方法中添加清理逻辑
    async fn update_latest_height(&self) -> Result<(), MaybeRetryable<Error>> {
        let latest_height = self
            .rpc
            .chain_get_header(None)
            .await
            .map_err(|e| MaybeRetryable::Transient(Error::from(e)))?
            .map(|header| header.number as u64)
            .unwrap_or(0);

        let previous_height = self
            .latest_known_height
            .swap(latest_height, Ordering::SeqCst);
        println!(
            "Updated latest height from {} to {}",
            previous_height, latest_height
        );

        // 清理旧的处理记录
        self.clean_old_processed_blocks(latest_height);

        Ok(())
    }

    async fn check_and_reset_state(&self) -> Result<(), MaybeRetryable<Error>> {
        let latest_height = self
            .rpc
            .chain_get_header(None)
            .await
            .map_err(|e| MaybeRetryable::Transient(Error::from(e)))?
            .map(|header| header.number as u64)
            .unwrap_or(0);

        let last_processed = self.last_processed_height.load(Ordering::SeqCst);

        if latest_height < last_processed {
            println!("Detected chain reset. Resetting internal state.");
            self.last_processed_height.store(0, Ordering::SeqCst);
            self.processed_blocks.lock().clear();
        }

        Ok(())
    }
}

#[async_trait]
impl DaService for DaProvider {
    type Spec = CyferioDaLayerSpec;
    type Verifier = CyferioDaVerifier;
    type FilteredBlock = CyferioBlock;
    type HeaderStream = BoxStream<'static, Result<CyferioHeader, Self::Error>>;
    type Error = MaybeRetryable<Error>;
    type Fee = CyferioFee;

    async fn get_block_at(&self, height: u64) -> Result<Self::FilteredBlock, Self::Error> {
        self.wait_for_block(height).await
    }

    async fn get_last_finalized_block_header(
        &self,
    ) -> Result<<Self::Spec as DaSpec>::BlockHeader, Self::Error> {
        let finalized_hash = self
            .rpc
            .chain_get_finalized_head()
            .await
            .map_err(|e| MaybeRetryable::Transient(Error::from(e)))?;

        let block_detail = self
            .rpc
            .chain_get_block(Some(finalized_hash))
            .await
            .map_err(|e| MaybeRetryable::Transient(Error::from(e)))?;
        match block_detail {
            Some(block) => {
                let header = block.block.header;
                let parent_hash = header.parent_hash;
                let state_root = header.state_root;
                let extrinsics_root = header.extrinsics_root;
                let number = header.number;
                let digest = header.digest.clone();
                let cyferio_header = CyferioHeader::new(
                    CyferioHash::from(header.hash()),
                    number,
                    CyferioHash::from(parent_hash.0),
                    CyferioHash::from(state_root.0),
                    CyferioHash::from(extrinsics_root.0),
                    digest,
                );
                Ok(cyferio_header)
            }
            None => Err(MaybeRetryable::Transient(Error::msg("Block not found"))),
        }
    }

    async fn subscribe_finalized_header(&self) -> Result<Self::HeaderStream, Self::Error> {
        let provider = self.clone();
        Ok(Box::pin(try_stream! {
            loop {
                provider.update_latest_height().await?;
                let block = provider.get_next_block().await?;
                yield block.header;
            }
        }))
    }

    async fn get_head_block_header(
        &self,
    ) -> Result<<Self::Spec as DaSpec>::BlockHeader, Self::Error> {
        let node_client = self.client.clone();
        let latest_block = node_client
            .blocks()
            .at_latest()
            .await
            .map_err(|e| MaybeRetryable::Transient(Error::from(e)))?;
        let header = latest_block.header();
        Ok(CyferioHeader::from((header, header.hash())))
    }

    fn extract_relevant_blobs(
        &self,
        block: &Self::FilteredBlock,
    ) -> RelevantBlobs<<Self::Spec as DaSpec>::BlobTransaction> {
        block.as_relevant_blobs()
    }

    async fn get_extraction_proof(
        &self,
        block: &Self::FilteredBlock,
        _blobs: &RelevantBlobs<<Self::Spec as DaSpec>::BlobTransaction>,
    ) -> RelevantProofs<
        <Self::Spec as DaSpec>::InclusionMultiProof,
        <Self::Spec as DaSpec>::CompletenessProof,
    > {
        block.get_relevant_proofs()
    }

    async fn send_transaction(
        &self,
        blob: &[u8],
        _fee: Self::Fee,
    ) -> Result<DaBlobHash<Self::Spec>, Self::Error> {
        let alice_pair_signer = dev::alice();

        let blob_base64 = general_purpose::STANDARD.encode(blob);
        println!("blob_base64: {:?}", blob_base64);

        // Construct the offchainWorker submitTask call
        let da_height = self
            .client
            .blocks()
            .at_latest()
            .await
            .map_err(|e| MaybeRetryable::Transient(Error::from(e)))?
            .header()
            .number as u64;

        // let submit_task_tx = substrate::tx()
        //     .offchain_worker()
        //     .submit_task(da_height, blob.to_vec());
        let submit_task_tx = substrate::tx()
            .offchain_worker()
            .submit_task(da_height, blob_base64.into_bytes());

        // Submit the transaction and wait for confirmation
        let tx_progress = self
            .client
            .tx()
            .sign_and_submit_then_watch_default(&submit_task_tx, &alice_pair_signer)
            .await
            .map_err(|e| MaybeRetryable::Transient(Error::from(e)))?;

        // Get the transaction hash
        let tx_hash = tx_progress.extrinsic_hash();

        // Wait for the transaction to be finalized
        let events = tx_progress
            .wait_for_finalized_success()
            .await
            .map_err(|e| MaybeRetryable::Transient(Error::from(e)))?;

        // Look for the relevant event
        let task_submitted_event = events
            .find_first::<substrate::offchain_worker::events::TaskSubmitted>()
            .map_err(|e| MaybeRetryable::Transient(Error::from(e)))?;

        if task_submitted_event.is_some() {
            Ok(CyferioHash::from(tx_hash.0))
        } else {
            Err(MaybeRetryable::Transient(anyhow::Error::msg(
                "Task submission event not found",
            )))
        }
    }

    async fn send_aggregated_zk_proof(
        &self,
        _aggregated_proof_data: &[u8],
        _fee: Self::Fee,
    ) -> Result<DaBlobHash<Self::Spec>, Self::Error> {
        Ok(CyferioHash::from([0u8; 32]))
    }

    async fn get_aggregated_proofs_at(&self, _height: u64) -> Result<Vec<Vec<u8>>, Self::Error> {
        Ok(vec![vec![0u8]])
    }

    async fn estimate_fee(&self, _blob_size: usize) -> Result<Self::Fee, Self::Error> {
        Ok(CyferioFee::new(0u128))
    }
}
