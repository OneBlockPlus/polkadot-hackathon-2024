use base64::prelude::*;
use sov_sequencer_json_client::types::PublishBatchBody;
use sov_test_utils::sequencer::TestSequencerSetup;

use crate::generate_txs;

#[tokio::test]
async fn axum_submit_batch_ok() {
    let sequencer = TestSequencerSetup::with_real_batch_builder().await.unwrap();
    let client = sequencer.client();

    let txs = generate_txs(sequencer.admin_private_key.clone());

    let response_result = client
        .publish_batch(&PublishBatchBody {
            transactions: txs
                .iter()
                .map(|(_hash, tx)| BASE64_STANDARD.encode(borsh::to_vec(tx).unwrap()))
                .collect(),
        })
        .await;

    let response = response_result.unwrap();
    let response_data = response.data.as_ref().unwrap();

    assert_eq!(response_data.da_height, 0);
    assert_eq!(response_data.num_txs, txs.len() as i32);
}
