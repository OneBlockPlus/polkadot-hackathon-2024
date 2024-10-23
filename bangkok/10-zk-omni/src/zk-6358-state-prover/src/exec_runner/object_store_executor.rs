
use circuit_local_storage::object_store::proof_object_store::KZGProofBatchStorage;
use exec_system::{database::ObjectStoreUrlConfig, traits::EnvConfig};

use anyhow::Result;
use colored::Colorize;

pub struct ObjectStorageExec {
    pub o_s_config: ObjectStoreUrlConfig
}

impl ObjectStorageExec {
    pub fn new() -> Self {
        let o_s_config = ObjectStoreUrlConfig::from_env();

        Self { o_s_config }
    }

    pub async fn reset_kzg_store_local(&self, kzg_batch_path: String) -> Result<()> {
        let mut obj_store_url = self.o_s_config.clone();
        obj_store_url.remote_url = "unavailable".to_string();
        let mut kzg_batch_o_s = KZGProofBatchStorage::new(&self.o_s_config, kzg_batch_path).await;
        kzg_batch_o_s.reset_kzg_store().await?;

        Ok(())
    }

    pub async fn reset_kzg_store_remote(&self, kzg_batch_path: String) -> Result<()> {
        let mut kzg_batch_o_s = KZGProofBatchStorage::new(&self.o_s_config, kzg_batch_path).await;
        kzg_batch_o_s.reset_kzg_store().await?;

        Ok(())
    }
}

pub async fn run_proof_o_s_exec() {
    let mut rl = rustyline::DefaultEditor::new().unwrap();

    let o_s_line = rl.readline(">>input bucket type(`local`|`remote`): ").unwrap();
    match o_s_line.as_str() {
        "local" => {
            let o_s_exec = ObjectStorageExec::new();

            let op_line = rl.readline(">>input operation type(`reset`): ").unwrap();
            match op_line.as_str() {
                "reset" => {
                    let kzg_batch_path = rl.readline(">>input kzg proof path: ").unwrap();
                    o_s_exec.reset_kzg_store_local(kzg_batch_path).await.unwrap();
                },
                _ => { panic!("{}", format!("invalid op type {op_line}. expected `reset`").red().bold()); }
            }
        },
        "remote" => {
            let o_s_exec = ObjectStorageExec::new();

            let op_line = rl.readline(">>input operation type(`reset`): ").unwrap();
            match op_line.as_str() {
                "reset" => {
                    let kzg_batch_path = rl.readline(">>input kzg proof path: ").unwrap();
                    o_s_exec.reset_kzg_store_remote(kzg_batch_path).await.unwrap();
                },
                _ => { panic!("{}", format!("invalid op type {op_line}. expected `reset`").red().bold()); }
            }
        },
        _ => { panic!("{}", format!("invalid bucket type {o_s_line}. expected `local` or `remote`").red().bold()) }
    }
}
