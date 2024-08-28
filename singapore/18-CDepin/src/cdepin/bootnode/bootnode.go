package main

import (
	"context"
	"fmt"
	"log"
	"os"
	"path"

	"github.com/CESSProject/cess-dcdn-components/cd2n-lib/config"
	"github.com/CESSProject/cess-dcdn-components/cd2n-lib/p2p"
	"github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/p2p/discovery/mdns"
	"github.com/libp2p/go-libp2p/p2p/discovery/routing"
)

type Config struct {
	WorkSpace string
	NetWork   string
	Port      int
}

type MDNSDiscoveryNotifee struct {
	h   host.Host
	ctx context.Context
}

func (n *MDNSDiscoveryNotifee) HandlePeerFound(pi peer.AddrInfo) {
}

func main() {
	var conf Config
	err := config.ParseCommonConfig("./config.yaml", "yaml", &conf)
	if err != nil {
		log.Println("parse config file error", err)
		return
	}
	if _, err := os.Stat(conf.WorkSpace); err != nil {
		os.MkdirAll(conf.WorkSpace, 0755)
	}
	key, err := p2p.Identification(path.Join(conf.WorkSpace, ".key"))
	if err != nil {
		log.Println("init p2p identification error", err)
		return
	}
	cachePeerNode, err := p2p.NewPeerNode(
		conf.NetWork, p2p.Version, nil,
		libp2p.Identity(key),
		libp2p.ListenAddrStrings(fmt.Sprintf("/ip4/0.0.0.0/tcp/%d", conf.Port)),
	)
	if err != nil {
		log.Println("init Server P2P Node error", err)
		return
	}
	ctx := context.Background()
	routingDiscovery := routing.NewRoutingDiscovery(cachePeerNode)
	routingDiscovery.Advertise(ctx, p2p.DISCOVERY_RENDEZVOUS)
	s := mdns.NewMdnsService(
		cachePeerNode.Host, p2p.DISCOVERY_SERVICE_TAG,
		&MDNSDiscoveryNotifee{
			h:   cachePeerNode.Host,
			ctx: ctx,
		},
	)
	if err := s.Start(); err != nil {
		log.Println("start mdns discovery error", err)
		return
	}
	select {}
}
