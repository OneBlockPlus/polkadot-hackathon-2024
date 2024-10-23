use futures::stream::StreamExt;
use sov_sequencer_json_client::types::TxStatus;
use sov_test_utils::sequencer::TestSequencerSetup;

use crate::generate_txs;

#[tokio::test]
async fn mempool_eviction_event() {
    let mempool_max_txs_count = 1;
    let sequencer = TestSequencerSetup::with_real_batch_builder_and_mempool_max_txs_count(
        mempool_max_txs_count,
    )
    .await
    .unwrap();

    let txs = generate_txs(sequencer.admin_private_key.clone());
    let (tx_hash_1, tx_1) = &txs[0];
    let (_, tx_2) = &txs[1];

    let client = sequencer.client();
    let mut subscription = client
        .subscribe_to_tx_status_updates(*tx_hash_1)
        .await
        .unwrap();

    // Before submitting a transaction, its status is unknown.
    assert_eq!(
        subscription.next().await.unwrap().unwrap().status,
        TxStatus::Unknown
    );

    let tx_bytes = borsh::to_vec(&tx_1).unwrap();
    sequencer.sequencer.accept_tx(tx_bytes).await.unwrap();

    // The transaction enters the mempool.
    assert_eq!(
        subscription.next().await.unwrap().unwrap().status,
        TxStatus::Submitted
    );

    // In the meantime, another transaction enters the mempool and causes the
    // first one to be evicted.
    let tx_bytes = borsh::to_vec(&tx_2).unwrap();
    sequencer.sequencer.accept_tx(tx_bytes).await.unwrap();

    assert_eq!(
        subscription.next().await.unwrap().unwrap().status,
        TxStatus::Dropped,
    );

    // No more events.
    assert!(subscription.next().await.is_none());
}

#[tokio::test]
async fn rpc_subscribe() {
    let sequencer = TestSequencerSetup::with_real_batch_builder().await.unwrap();
    let client = sequencer.client();

    let txs = generate_txs(sequencer.admin_private_key.clone());
    let (tx_hash, tx) = &txs[0];

    let mut subscription = client
        .subscribe_to_tx_status_updates(*tx_hash)
        .await
        .unwrap();

    // Before submitting a transaction, its status is unknown.
    assert_eq!(
        subscription.next().await.unwrap().unwrap().status,
        TxStatus::Unknown
    );

    client
        .publish_batch_with_serialized_txs(&[tx])
        .await
        .unwrap();

    // The transaction status should change once it enters the mempool...
    assert_eq!(
        subscription.next().await.unwrap().unwrap().status,
        TxStatus::Submitted
    );

    // ...and then change again shortly after, once it gets included in a block.
    assert_eq!(
        subscription.next().await.unwrap().unwrap().status,
        TxStatus::Published,
    );

    // TODO: finalized status (https://github.com/Sovereign-Labs/sovereign-sdk-wip/issues/1088).

    // No more events.
    //assert!(subscription.next().await.is_none());
}
