use libp2p::identity::Keypair;
use libp2p::relay;
use libp2p::request_response;
use libp2p::swarm::NetworkBehaviour;
use libp2p::StreamProtocol;

use crate::p2p::codec::Codec;

#[derive(NetworkBehaviour)]
pub(crate) struct PProxyNetworkBehaviour {
    pub(crate) request_response: request_response::Behaviour<Codec>,
    pub(crate) relay: relay::Behaviour,
    pub(crate) relay_client: relay::client::Behaviour,
}

impl PProxyNetworkBehaviour {
    pub fn new(key: &Keypair, relay_client: relay::client::Behaviour) -> Self {
        let request_response = request_response::Behaviour::new(
            [(
                StreamProtocol::new("/pproxy/1.0.0"),
                request_response::ProtocolSupport::Full,
            )],
            request_response::Config::default(),
        );
        let relay = relay::Behaviour::new(key.public().to_peer_id(), Default::default());
        Self {
            request_response,
            relay,
            relay_client,
        }
    }
}
