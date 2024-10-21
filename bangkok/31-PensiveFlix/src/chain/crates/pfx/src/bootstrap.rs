use super::{expert, expert::PflixExpertStub, greeting, types::PflixProperties, Pflix, PflixSafeBox, RpcService};
use anyhow::{anyhow, Result};
use pfx_api::{crpc::pflix_api_server::PflixApiServer, ecall_args::InitArgs};
use serde::{de::DeserializeOwned, Serialize};
use std::net::SocketAddr;
use tokio::sync::{mpsc, oneshot};
use tonic::transport::Server;

pub async fn run_pflix_server<Platform>(
    init_args: InitArgs,
    platform: Platform,
    inner_listener_addr: SocketAddr,
) -> Result<()>
where
    Platform: pal::Platform + Serialize + DeserializeOwned,
{
    // TODO(billw): If `enfrost` turns on the `fast-sync` switch,
    // it will load the current chain state to `pflix`, and the chain state increases over time,
    // so increasing the size of the request packet is not the final solution.
    const MAX_ENCODED_MSG_SIZE: usize = 48 << 20; // 48MiB
    const MAX_DECODED_MSG_SIZE: usize = MAX_ENCODED_MSG_SIZE;

    let (expert_cmd_tx, expert_cmd_rx) = mpsc::channel(16);
    let pfx = if init_args.enable_checkpoint {
        match Pflix::restore_from_checkpoint(&platform, &init_args) {
            Ok(Some(factory)) => {
                info!("Loaded checkpoint");
                PflixSafeBox::new_with(factory, Some(expert_cmd_tx))
            },
            Ok(None) => {
                info!("No checkpoint found");
                PflixSafeBox::new(platform, Some(expert_cmd_tx))
            },
            Err(err) => {
                anyhow::bail!("Failed to load checkpoint: {:?}", err);
            },
        }
    } else {
        info!("Checkpoint disabled.");
        PflixSafeBox::new(platform, Some(expert_cmd_tx))
    };

    pfx.lock(true, true).expect("Failed to lock Pflix").init(init_args);
    info!("Enclave init OK");

    tokio::spawn(expert::run(pfx.clone(), expert_cmd_rx));

    let pflix_service = RpcService::new_with(pfx);
    info!("Pflix internal server will listening on {}", inner_listener_addr);
    Server::builder()
        .add_service(
            PflixApiServer::new(pflix_service)
                .max_decoding_message_size(MAX_DECODED_MSG_SIZE)
                .max_encoding_message_size(MAX_ENCODED_MSG_SIZE),
        )
        .serve(inner_listener_addr)
        .await
        .expect("Pflix server catch panic");

    info!("Pflix server quited success");
    Ok(())
}

pub(crate) fn spawn_external_server<Platform>(
    pflix: &mut Pflix<Platform>,
    pflix_props: PflixProperties,
    shutdown_rx: oneshot::Receiver<()>,
    stopped_tx: oneshot::Sender<()>,
) -> Result<()> {
    let listener_addr = {
        let ip = pflix.args.ip_address.as_ref().map_or("0.0.0.0", String::as_str);
        let port = pflix.args.public_port.unwrap_or(19999);
        format!("{ip}:{port}").parse().unwrap()
    };

    let expert_cmd_sender = pflix
        .expert_cmd_sender
        .clone()
        .ok_or(anyhow!("the pflix.expert_cmd_sender must be set"))?;

    {
        use rsa::pkcs1::EncodeRsaPublicKey;
        debug!(
            "Successfully load podr2 key public key is: {:?}",
            hex::encode(&pflix_props.master_key.rsa_public_key().to_pkcs1_der().unwrap().as_bytes())
        );
    }

    tokio::spawn(async move {
        let pflix_expert = PflixExpertStub::new(pflix_props, expert_cmd_sender);
        let pubkeys = greeting::new_greeting_server(pflix_expert);

        let mut server = Server::builder();
        let router = server.add_service(pubkeys);
        info!("the external server will listening on {}", listener_addr);
        let result = router
            .serve_with_shutdown(listener_addr, async {
                shutdown_rx.await.ok();
                info!("external server starts shutting down");
            })
            .await
            .map_err(|e| anyhow!("start external server failed: {e}"))?;
        stopped_tx.send(()).ok();
        Ok::<(), anyhow::Error>(result)
    });
    Ok(())
}
