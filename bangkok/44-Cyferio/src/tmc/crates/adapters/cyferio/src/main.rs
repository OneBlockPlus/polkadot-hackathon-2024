use hex;
use subxt::{
    utils::{AccountId32, MultiAddress},
    OnlineClient, SubstrateConfig,
};
use subxt_signer::sr25519::dev;

// Generate an interface that we can use from the node's metadata.
#[subxt::subxt(runtime_metadata_path = "./src/metadata.scale")]
pub mod substrate {}

type StatemintConfig = SubstrateConfig;

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Create a new API client, configured to talk to the local node.
    let api: OnlineClient<SubstrateConfig> =
        OnlineClient::<StatemintConfig>::from_url("ws://127.0.0.1:9944").await?;

    // let alice: MultiAddress<AccountId32, ()> = dev::alice().public_key().into();
    // let alice_pair_signer = dev::alice();

    // // 构建 offchainWorker 的 submitTask 调用
    // let da_height: u64 = 7; // 根据实际需求设置
    // let blob = "hello world ".as_bytes().to_vec(); // 根据实际需求设置 blob 数据
    // let submit_task_tx = substrate::tx()
    //     .offchain_worker()
    //     .submit_task(da_height, blob);

    // // 提交交易并等待其被确认
    // let tx_progress = api
    //     .tx()
    //     .sign_and_submit_then_watch_default(&submit_task_tx, &alice_pair_signer)
    //     .await?;

    // // 获取交易哈希
    // let tx_hash = tx_progress.extrinsic_hash();
    // println!("Transaction hash: 0x{}", hex::encode(tx_hash));

    // // 等待交易被最终确认
    // let events = tx_progress
    //     .wait_for_finalized_success()
    //     .await?;

    // // 查找并打印相关事件
    // // 注意：这里需要根据实际的 pallet 定义来调整事件类型
    // let task_submitted_event = events.find_first::<substrate::offchain_worker::events::TaskSubmitted>()?;
    // if let Some(event) = task_submitted_event {
    //     println!("Task submitted successfully: {event:?}");
    // }

    let mut blocks_sub = api.blocks().subscribe_finalized().await?;

    // For each block, print a bunch of information about it:
    while let Some(block) = blocks_sub.next().await {
        let block = block?;

        let block_number = block.header().number;
        let block_hash = block.hash();

        // println!("Block #{block_number}:");
        // println!("  Hash: {block_hash}");
        // println!("  Extrinsics:");

        // Log each of the extrinsic with it's associated events:
        let extrinsics = block.extrinsics().await?;
        for ext in extrinsics.iter() {
            let ext = ext?; // Unwrap the Result
            let idx = ext.index();
            let events = ext.events().await?;
            let bytes_hex = format!("0x{}", hex::encode(ext.bytes()));

            // See the API docs for more ways to decode extrinsics:
            let decoded_ext = ext.as_root_extrinsic::<substrate::Call>();

            // println!("    Extrinsic #{idx}:");
            // println!("      Bytes: {bytes_hex}");
            // println!("      Decoded: {decoded_ext:?}");

            // Extract the "now" value from the decoded extrinsic
            if let Ok(substrate::Call::Timestamp(substrate::timestamp::Call::set { now })) =
                decoded_ext
            {
                println!("      Timestamp now: {}", now);
            }

            // println!("      Events:");
            for evt in events.iter() {
                let evt = evt?;
                let pallet_name = evt.pallet_name();
                let event_name = evt.variant_name();
                let event_values = evt.field_values()?;

                // println!("        {pallet_name}_{event_name}");
                // println!("          {}", event_values);
            }
        }
    }

    Ok(())
}
