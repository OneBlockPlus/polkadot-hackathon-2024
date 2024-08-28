use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::atomic::AtomicUsize;
use std::sync::Arc;
use std::sync::Mutex;

use futures::channel::oneshot;
use futures::StreamExt;
use libp2p::identity::Keypair;
use libp2p::multiaddr::Protocol;
use libp2p::request_response;
use libp2p::swarm::SwarmEvent;
use libp2p::Multiaddr;
use libp2p::PeerId;
use libp2p::Swarm;
use tokio::sync::mpsc;

use crate::access::AccessClient;
use crate::command::proto::AddPeerRequest;
use crate::command::proto::AddPeerResponse;
use crate::command::proto::ConnectRelayRequest;
use crate::command::proto::ConnectRelayResponse;
use crate::command::proto::CreateTunnelServerRequest;
use crate::command::proto::CreateTunnelServerResponse;
use crate::command::proto::ExpirePeerAccessRequest;
use crate::command::proto::ExpirePeerAccessResponse;
use crate::error::TunnelError;
use crate::p2p::PProxyNetworkBehaviour;
use crate::p2p::PProxyNetworkBehaviourEvent;
use crate::tunnel::proto;
use crate::tunnel::tcp_connect_with_timeout;
use crate::tunnel::Tunnel;
use crate::tunnel::TunnelServer;
use crate::types::*;

mod access;
pub mod command;
pub mod error;
mod p2p;
mod tunnel;
pub mod types;

/// pproxy version
pub const VERSION: &str = env!("CARGO_PKG_VERSION");

/// Default channel size.
const DEFAULT_CHANNEL_SIZE: usize = 4096;

/// Timeout for local TCP server.
pub const LOCAL_TCP_TIMEOUT: u64 = 5;

/// Timeout for remote TCP server.
pub const REMOTE_TCP_TIMEOUT: u64 = 30;

/// Public result type and error type used by the crate.
pub use crate::error::Error;
pub type Result<T> = std::result::Result<T, error::Error>;

type CommandNotification = Result<PProxyCommandResponse>;
type CommandNotifier = oneshot::Sender<CommandNotification>;
type ChannelPackage = std::result::Result<Vec<u8>, TunnelError>;

#[derive(Debug)]
pub enum PProxyCommand {
    AddPeer {
        multiaddr: Multiaddr,
        peer_id: PeerId,
    },
    ConnectRelay {
        multiaddr: Multiaddr,
    },
    SendConnectCommand {
        peer_id: PeerId,
        tunnel_id: TunnelId,
        tunnel_tx: mpsc::Sender<ChannelPackage>,
    },
    SendOutboundPackageCommand {
        peer_id: PeerId,
        tunnel_id: TunnelId,
        data: Vec<u8>,
    },
    ExpirePeerAccess {
        peer_id: PeerId,
    },
}

pub enum PProxyCommandResponse {
    AddPeer { peer_id: PeerId },
    ConnectRelay { relaied_multiaddr: Multiaddr },
    SendConnectCommand {},
    SendOutboundPackageCommand {},
    ExpirePeerAccess {},
}

pub struct PProxy {
    command_tx: mpsc::Sender<(PProxyCommand, CommandNotifier)>,
    command_rx: mpsc::Receiver<(PProxyCommand, CommandNotifier)>,
    swarm: Swarm<PProxyNetworkBehaviour>,
    proxy_addr: Option<SocketAddr>,
    outbound_ready_notifiers: HashMap<request_response::OutboundRequestId, CommandNotifier>,
    inbound_tunnels: HashMap<(PeerId, TunnelId), Tunnel>,
    tunnel_txs: HashMap<(PeerId, TunnelId), mpsc::Sender<ChannelPackage>>,
    access_client: Option<AccessClient>,
}

pub struct PProxyHandle {
    command_tx: mpsc::Sender<(PProxyCommand, CommandNotifier)>,
    next_tunnel_id: Arc<AtomicUsize>,
    tunnel_servers: Mutex<HashMap<PeerId, TunnelServer>>,
}

impl PProxy {
    pub fn new(
        keypair: Keypair,
        listen_addr: SocketAddr,
        proxy_addr: Option<SocketAddr>,
        access_server_endpoint: Option<reqwest::Url>,
    ) -> Result<(Self, PProxyHandle)> {
        let (command_tx, command_rx) = mpsc::channel(DEFAULT_CHANNEL_SIZE);
        let swarm = crate::p2p::new_swarm(keypair, listen_addr)
            .map_err(|e| Error::Libp2pSwarmCreateError(e.to_string()))?;
        let access_client = access_server_endpoint.map(AccessClient::new);

        Ok((
            Self {
                command_tx: command_tx.clone(),
                command_rx,
                swarm,
                proxy_addr,
                outbound_ready_notifiers: HashMap::new(),
                inbound_tunnels: HashMap::new(),
                tunnel_txs: HashMap::new(),
                access_client,
            },
            PProxyHandle {
                command_tx,
                next_tunnel_id: Default::default(),
                tunnel_servers: Default::default(),
            },
        ))
    }

    pub async fn run(mut self) {
        loop {
            tokio::select! {
                // Events coming from the network have higher priority than user commands
                biased;

                event = self.swarm.select_next_some() => {
                     if let Err(error) = self.handle_p2p_server_event(event).await {
                        tracing::warn!("failed to handle event: {:?}", error);
                    }
                },

                command = self.command_rx.recv() => match command {
                    None => return,
                    Some((command, tx)) => if let Err(error) = self.handle_command(command, tx).await {
                        tracing::warn!("failed to handle command: {:?}", error);
                    }
                }
            }
        }
    }

    async fn dial_tunnel(
        &mut self,
        proxy_addr: SocketAddr,
        peer_id: PeerId,
        tunnel_id: TunnelId,
    ) -> Result<()> {
        let stream = tcp_connect_with_timeout(proxy_addr, LOCAL_TCP_TIMEOUT).await?;

        let mut tunnel = Tunnel::new(peer_id, tunnel_id, self.command_tx.clone());
        let (tunnel_tx, tunnel_rx) = mpsc::channel(1024);
        tunnel.listen(stream, tunnel_rx).await?;

        self.inbound_tunnels.insert((peer_id, tunnel_id), tunnel);
        self.tunnel_txs.insert((peer_id, tunnel_id), tunnel_tx);

        Ok(())
    }

    async fn is_tunnel_valid(&mut self, peer_id: &PeerId) -> bool {
        let Some(ref mut ac) = self.access_client else {
            return true;
        };
        ac.is_valid(peer_id).await
    }

    async fn handle_tunnel_request(
        &mut self,
        peer_id: PeerId,
        request: proto::Tunnel,
    ) -> Result<Option<proto::Tunnel>> {
        let tunnel_id = request
            .tunnel_id
            .parse()
            .map_err(|_| Error::TunnelIdParseError(request.tunnel_id.clone()))?;

        match request.command() {
            proto::TunnelCommand::Connect => {
                tracing::info!("received connect command from peer: {:?}", peer_id);
                if !self.is_tunnel_valid(&peer_id).await {
                    return Err(Error::AccessDenied(peer_id.to_string()));
                }

                let Some(proxy_addr) = self.proxy_addr else {
                    return Err(Error::ProtocolNotSupport("No proxy_addr".to_string()));
                };

                let data = match self.dial_tunnel(proxy_addr, peer_id, tunnel_id).await {
                    Ok(_) => None,
                    Err(e) => {
                        tracing::warn!("failed to dial tunnel: {:?}", e);
                        Some(e.to_string().into_bytes())
                    }
                };

                Ok(Some(proto::Tunnel {
                    tunnel_id: tunnel_id.to_string(),
                    command: proto::TunnelCommand::ConnectResp.into(),
                    data,
                }))
            }

            proto::TunnelCommand::Package => {
                // Note that only inbound package need access check.
                if self.inbound_tunnels.contains_key(&(peer_id, tunnel_id))
                    && !self.is_tunnel_valid(&peer_id).await
                {
                    return Err(Error::AccessDenied(peer_id.to_string()));
                }

                let Some(tx) = self.tunnel_txs.get(&(peer_id, tunnel_id)) else {
                    return Err(Error::ProtocolNotSupport(
                        "No tunnel for Package".to_string(),
                    ));
                };

                tx.send(Ok(request.data.unwrap_or_default())).await?;

                // Have to do this to close the response waiter in remote.
                Ok(None)
            }

            _ => Err(Error::ProtocolNotSupport(
                "Wrong tunnel request command".to_string(),
            )),
        }
    }

    async fn handle_p2p_server_event(
        &mut self,
        event: SwarmEvent<PProxyNetworkBehaviourEvent>,
    ) -> Result<()> {
        tracing::debug!("received SwarmEvent: {:?}", event);

        match event {
            SwarmEvent::NewListenAddr { mut address, .. } => {
                address.push(Protocol::P2p(*self.swarm.local_peer_id()));
                println!("Local node is listening on {address}");
            }

            SwarmEvent::ConnectionClosed { peer_id, .. } => {
                self.inbound_tunnels.retain(|(p, _), _| p != &peer_id);
                self.tunnel_txs.retain(|(p, _), _| p != &peer_id);
            }

            SwarmEvent::Behaviour(PProxyNetworkBehaviourEvent::RequestResponse(
                request_response::Event::Message { peer, message },
            )) => match message {
                request_response::Message::Request {
                    request, channel, ..
                } => {
                    let tunnel_id = request.tunnel_id.clone();
                    let resp = match self.handle_tunnel_request(peer, request).await {
                        Ok(resp) => resp,
                        Err(e) => {
                            if let Ok(tunnel_id) = tunnel_id.parse() {
                                self.inbound_tunnels.remove(&(peer, tunnel_id));
                                self.tunnel_txs.remove(&(peer, tunnel_id));
                            }
                            Some(proto::Tunnel {
                                tunnel_id,
                                command: proto::TunnelCommand::Break.into(),
                                data: Some(e.to_string().as_bytes().to_vec()),
                            })
                        }
                    };

                    self.swarm
                        .behaviour_mut()
                        .request_response
                        .send_response(channel, resp)
                        .map_err(|_| Error::EssentialTaskClosed)?;
                }

                request_response::Message::Response {
                    request_id,
                    response,
                } => {
                    // This is response of TunnelCommand::Package
                    let Some(response) = response else {
                        return Ok(());
                    };

                    match response.command() {
                        proto::TunnelCommand::ConnectResp => {
                            let tx = self
                                .outbound_ready_notifiers
                                .remove(&request_id)
                                .ok_or_else(|| {
                                    Error::TunnelNotWaiting(format!(
                                        "peer {}, tunnel {} ready but not waiting",
                                        peer, response.tunnel_id
                                    ))
                                })?;

                            match response.data {
                                None => tx.send(Ok(PProxyCommandResponse::SendConnectCommand {})),
                                Some(data) => tx.send(Err(Error::TunnelDialFailed(
                                    String::from_utf8(data)
                                        .unwrap_or("Unknown (decode failed)".to_string()),
                                ))),
                            }
                            .map_err(|_| Error::EssentialTaskClosed)?;
                        }

                        proto::TunnelCommand::Break => {
                            let tunnel_id = response.tunnel_id.parse().map_err(|_| {
                                Error::TunnelIdParseError(response.tunnel_id.clone())
                            })?;

                            // Terminat connecting tunnel
                            if let Some(tx) = self.outbound_ready_notifiers.remove(&request_id) {
                                tx.send(Err(Error::Tunnel(TunnelError::ConnectionAborted)))
                                    .map_err(|_| Error::EssentialTaskClosed)?
                            }

                            // Terminat connected tunnel
                            if let Some(tx) = self.tunnel_txs.remove(&(peer, tunnel_id)) {
                                tx.send(Err(TunnelError::ConnectionAborted)).await?
                            };
                        }

                        _ => {
                            return Err(Error::ProtocolNotSupport(
                                "Wrong tunnel response command".to_string(),
                            ));
                        }
                    }
                }
            },

            SwarmEvent::Behaviour(PProxyNetworkBehaviourEvent::RequestResponse(
                request_response::Event::OutboundFailure {
                    request_id, error, ..
                },
            )) => {
                // Tell tunnel dial failed
                if let Some(tx) = self.outbound_ready_notifiers.remove(&request_id) {
                    tx.send(Err(Error::TunnelDialFailed(error.to_string())))
                        .map_err(|_| Error::EssentialTaskClosed)?
                }

                // TODO: Should also tell tunnel sent failed. But cannot get tunnel_id here.
            }

            _ => {}
        }

        Ok(())
    }

    async fn handle_command(&mut self, command: PProxyCommand, tx: CommandNotifier) -> Result<()> {
        match command {
            PProxyCommand::AddPeer { multiaddr, peer_id } => {
                self.on_add_peer(multiaddr, peer_id, tx).await
            }
            PProxyCommand::ConnectRelay { multiaddr } => self.on_connect_relay(multiaddr, tx).await,
            PProxyCommand::SendConnectCommand {
                peer_id,
                tunnel_id,
                tunnel_tx,
            } => {
                self.on_send_connect_command(peer_id, tunnel_id, tunnel_tx, tx)
                    .await
            }
            PProxyCommand::SendOutboundPackageCommand {
                peer_id,
                tunnel_id,
                data,
            } => {
                self.on_send_outbound_package_command(peer_id, tunnel_id, data, tx)
                    .await
            }
            PProxyCommand::ExpirePeerAccess { peer_id } => {
                self.on_expire_peer_access(peer_id, tx).await
            }
        }
    }

    async fn on_add_peer(
        &mut self,
        multiaddr: Multiaddr,
        peer_id: PeerId,
        tx: CommandNotifier,
    ) -> Result<()> {
        self.swarm.add_peer_address(peer_id, multiaddr);

        tx.send(Ok(PProxyCommandResponse::AddPeer { peer_id }))
            .map_err(|_| Error::EssentialTaskClosed)
    }

    async fn on_connect_relay(&mut self, multiaddr: Multiaddr, tx: CommandNotifier) -> Result<()> {
        let relaied_multiaddr = multiaddr
            .with(Protocol::P2pCircuit)
            .with(Protocol::P2p(*self.swarm.local_peer_id()));

        self.swarm.listen_on(relaied_multiaddr.clone())?;

        tx.send(Ok(PProxyCommandResponse::ConnectRelay {
            relaied_multiaddr,
        }))
        .map_err(|_| Error::EssentialTaskClosed)
    }

    async fn on_send_connect_command(
        &mut self,
        peer_id: PeerId,
        tunnel_id: TunnelId,
        tunnel_tx: mpsc::Sender<ChannelPackage>,
        tx: CommandNotifier,
    ) -> Result<()> {
        self.tunnel_txs.insert((peer_id, tunnel_id), tunnel_tx);

        let request = proto::Tunnel {
            tunnel_id: tunnel_id.to_string(),
            command: proto::TunnelCommand::Connect.into(),
            data: None,
        };

        tracing::info!("send connect command to peer_id: {:?}", peer_id);
        let request_id = self
            .swarm
            .behaviour_mut()
            .request_response
            .send_request(&peer_id, request);

        self.outbound_ready_notifiers.insert(request_id, tx);

        Ok(())
    }

    async fn on_send_outbound_package_command(
        &mut self,
        peer_id: PeerId,
        tunnel_id: TunnelId,
        data: Vec<u8>,
        tx: CommandNotifier,
    ) -> Result<()> {
        let request = proto::Tunnel {
            tunnel_id: tunnel_id.to_string(),
            command: proto::TunnelCommand::Package.into(),
            data: Some(data),
        };

        self.swarm
            .behaviour_mut()
            .request_response
            .send_request(&peer_id, request);

        tx.send(Ok(PProxyCommandResponse::SendOutboundPackageCommand {}))
            .map_err(|_| Error::EssentialTaskClosed)
    }

    async fn on_expire_peer_access(&mut self, peer_id: PeerId, tx: CommandNotifier) -> Result<()> {
        if let Some(ref mut ac) = self.access_client {
            ac.expire(&peer_id);
        }

        tx.send(Ok(PProxyCommandResponse::ExpirePeerAccess {}))
            .map_err(|_| Error::EssentialTaskClosed)?;

        Ok(())
    }
}

impl PProxyHandle {
    pub async fn add_peer(&self, request: AddPeerRequest) -> Result<AddPeerResponse> {
        let (tx, rx) = oneshot::channel();

        let multiaddr: Multiaddr = request
            .multiaddr
            .parse()
            .map_err(|_| Error::MultiaddrParseError(request.multiaddr.clone()))?;

        let peer_id = request.peer_id.map_or_else(
            || extract_peer_id_from_multiaddr(&multiaddr),
            |peer_id| {
                peer_id
                    .parse()
                    .map_err(|_| Error::PeerIdParseError(peer_id))
            },
        )?;

        self.command_tx
            .send((PProxyCommand::AddPeer { multiaddr, peer_id }, tx))
            .await?;

        let response = rx.await??;

        match response {
            PProxyCommandResponse::AddPeer { peer_id } => Ok(AddPeerResponse {
                peer_id: peer_id.to_string(),
            }),
            _ => Err(Error::UnexpectedResponseType),
        }
    }

    pub async fn create_tunnel_server(
        &self,
        request: CreateTunnelServerRequest,
    ) -> Result<CreateTunnelServerResponse> {
        let peer_id = request
            .peer_id
            .parse()
            .map_err(|_| Error::PeerIdParseError(request.peer_id))?;

        let address = request.address.unwrap_or("127.0.0.1:0".to_string());
        let address = address
            .parse()
            .map_err(|_| Error::SocketAddrParseError(address))?;

        let mut tunnel_server = TunnelServer::new(
            peer_id,
            self.next_tunnel_id.clone(),
            self.command_tx.clone(),
        );
        let address = tunnel_server.listen(address).await?;

        self.tunnel_servers
            .lock()
            .unwrap()
            .insert(peer_id, tunnel_server);

        Ok(CreateTunnelServerResponse {
            peer_id: peer_id.to_string(),
            address: address.to_string(),
        })
    }

    pub async fn connect_relay(
        &self,
        request: ConnectRelayRequest,
    ) -> Result<ConnectRelayResponse> {
        let (tx, rx) = oneshot::channel();

        let multiaddr: Multiaddr = request
            .multiaddr
            .parse()
            .map_err(|_| Error::MultiaddrParseError(request.multiaddr.clone()))?;

        self.command_tx
            .send((PProxyCommand::ConnectRelay { multiaddr }, tx))
            .await?;

        let response = rx.await??;

        match response {
            PProxyCommandResponse::ConnectRelay { relaied_multiaddr } => Ok(ConnectRelayResponse {
                relaied_multiaddr: relaied_multiaddr.to_string(),
            }),
            _ => Err(Error::UnexpectedResponseType),
        }
    }

    pub async fn expire_peer_access(
        &self,
        request: ExpirePeerAccessRequest,
    ) -> Result<ExpirePeerAccessResponse> {
        let (tx, rx) = oneshot::channel();

        let peer_id = request
            .peer_id
            .parse()
            .map_err(|_| Error::PeerIdParseError(request.peer_id))?;

        self.command_tx
            .send((PProxyCommand::ExpirePeerAccess { peer_id }, tx))
            .await?;

        rx.await??;

        Ok(ExpirePeerAccessResponse {})
    }
}

fn extract_peer_id_from_multiaddr(multiaddr: &Multiaddr) -> Result<PeerId> {
    let protocol = multiaddr.iter().last();

    let Some(Protocol::P2p(peer_id)) = protocol else {
        return Err(Error::FailedToExtractPeerIdFromMultiaddr(
            multiaddr.to_string(),
        ));
    };

    Ok(peer_id)
}
