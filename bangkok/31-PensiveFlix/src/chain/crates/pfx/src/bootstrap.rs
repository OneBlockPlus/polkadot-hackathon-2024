use super::{expert, Pflix, PflixSafeBox, RpcService};
use anyhow::Result;
use pfx_api::{crpc::pflix_api_server::PflixApiServer, ecall_args::InitArgs};
use serde::{de::DeserializeOwned, Serialize};
use std::net::SocketAddr;
use tokio::sync::mpsc;
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
    info!("Pflix internal server will listening on {}", inner_listener_addr);

    tokio::spawn(expert::run(pfx.clone(), expert_cmd_rx));

    let pflix_service = PflixApiServer::new(RpcService::new_with(pfx))
        .max_decoding_message_size(MAX_DECODED_MSG_SIZE)
        .max_encoding_message_size(MAX_ENCODED_MSG_SIZE);
    let pflix_service = tonic_middleware::MiddlewareFor::new(pflix_service, middleware::MetricsMiddleware::default());

    Server::builder()
        .add_service(pflix_service)
        .serve(inner_listener_addr)
        .await
        .expect("Pflix server catch panic");

    info!("Pflix server quited success");
    Ok(())
}

mod middleware {
    use std::time::Instant;
    use tonic::{
        async_trait,
        body::BoxBody,
        codegen::http::{Request, Response},
    };
    use tonic_middleware::{Middleware, ServiceBound};

    #[derive(Default, Clone)]
    pub struct MetricsMiddleware;

    #[async_trait]
    impl<S> Middleware<S> for MetricsMiddleware
    where
        S: ServiceBound,
        S::Future: Send,
    {
        async fn call(&self, req: Request<BoxBody>, mut service: S) -> Result<Response<BoxBody>, S::Error> {
            let start_time = Instant::now();
            let req_uri = req.uri().clone();
            let result = service.call(req).await?;
            let elapsed_time = start_time.elapsed();
            tracing::debug!(
                "handle request: {:?} processed in {:?}, status: {:?}",
                req_uri,
                elapsed_time,
                result.status()
            );
            Ok(result)
        }
    }
}
