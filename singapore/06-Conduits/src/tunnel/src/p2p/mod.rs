use std::net::IpAddr;
use std::net::SocketAddr;

use libp2p::identity::Keypair;
use libp2p::noise;
use libp2p::swarm::Swarm;
use libp2p::tcp;
use libp2p::yamux;

pub(crate) use crate::p2p::behaviour::PProxyNetworkBehaviour;
pub(crate) use crate::p2p::behaviour::PProxyNetworkBehaviourEvent;

mod behaviour;
mod codec;

pub(crate) fn new_swarm(
    keypair: Keypair,
    listen_addr: SocketAddr,
) -> std::result::Result<Swarm<PProxyNetworkBehaviour>, Box<dyn std::error::Error>> {
    let (ip_type, ip, port) = match listen_addr.ip() {
        IpAddr::V4(ip) => ("ip4", ip.to_string(), listen_addr.port()),
        IpAddr::V6(ip) => ("ip6", ip.to_string(), listen_addr.port()),
    };

    let listen_multiaddr = format!("/{ip_type}/{ip}/tcp/{port}").parse()?;

    let mut swarm = libp2p::SwarmBuilder::with_existing_identity(keypair)
        .with_tokio()
        .with_tcp(
            tcp::Config::default(),
            noise::Config::new,
            yamux::Config::default,
        )?
        .with_relay_client(noise::Config::new, yamux::Config::default)?
        .with_behaviour(PProxyNetworkBehaviour::new)?
        .with_swarm_config(|c| c.with_idle_connection_timeout(std::time::Duration::from_secs(60)))
        .build();

    swarm.listen_on(listen_multiaddr)?;

    Ok(swarm)
}
