use tonic::Request;
use tonic::Response;
use tonic::Status;

use crate::PProxyHandle;

pub mod proto {
    tonic::include_proto!("org.dephy.pproxy.command.v1");
}

pub struct PProxyCommander {
    handle: PProxyHandle,
}

impl PProxyCommander {
    pub fn new(handle: PProxyHandle) -> Self {
        Self { handle }
    }

    pub fn into_tonic_service(self) -> proto::command_service_server::CommandServiceServer<Self> {
        proto::command_service_server::CommandServiceServer::new(self)
    }
}

#[tonic::async_trait]
impl proto::command_service_server::CommandService for PProxyCommander {
    async fn add_peer(
        &self,
        request: Request<proto::AddPeerRequest>,
    ) -> Result<Response<proto::AddPeerResponse>, Status> {
        tracing::debug!("handle request: {:?}", request);

        self.handle
            .add_peer(request.into_inner())
            .await
            .map(Response::new)
            .map_err(|e| tonic::Status::internal(format!("{:?}", e)))
    }

    async fn create_tunnel_server(
        &self,
        request: tonic::Request<proto::CreateTunnelServerRequest>,
    ) -> std::result::Result<tonic::Response<proto::CreateTunnelServerResponse>, tonic::Status>
    {
        tracing::debug!("handle request: {:?}", request);

        self.handle
            .create_tunnel_server(request.into_inner())
            .await
            .map(Response::new)
            .map_err(|e| tonic::Status::internal(format!("{:?}", e)))
    }

    async fn connect_relay(
        &self,
        request: tonic::Request<proto::ConnectRelayRequest>,
    ) -> std::result::Result<tonic::Response<proto::ConnectRelayResponse>, tonic::Status> {
        tracing::debug!("handle request: {:?}", request);

        self.handle
            .connect_relay(request.into_inner())
            .await
            .map(Response::new)
            .map_err(|e| tonic::Status::internal(format!("{:?}", e)))
    }

    async fn expire_peer_access(
        &self,
        request: tonic::Request<proto::ExpirePeerAccessRequest>,
    ) -> std::result::Result<tonic::Response<proto::ExpirePeerAccessResponse>, tonic::Status> {
        tracing::debug!("handle request: {:?}", request);

        self.handle
            .expire_peer_access(request.into_inner())
            .await
            .map(Response::new)
            .map_err(|e| tonic::Status::internal(format!("{:?}", e)))
    }
}
