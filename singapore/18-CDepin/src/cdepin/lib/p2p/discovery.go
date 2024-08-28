package p2p

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"time"

	"github.com/CESSProject/p2p-go/core"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	pubsub "github.com/libp2p/go-libp2p-pubsub"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/p2p/discovery/mdns"
	"github.com/libp2p/go-libp2p/p2p/discovery/routing"
	"github.com/pkg/errors"
)

const (
	DISCOVERY_SERVICE_TAG = "cess-cdn-pubsub"
	DISCOVERY_RENDEZVOUS  = "cess-cdn-cacher"
)

type MDNSDiscoveryNotifee struct {
	ch  chan<- peer.AddrInfo
	h   host.Host
	ctx context.Context
}

func (n *MDNSDiscoveryNotifee) HandlePeerFound(pi peer.AddrInfo) {
	n.ch <- pi
}
func StartDiscoveryFromDHT(ctx context.Context, h host.Host, dht *dht.IpfsDHT, rendezvous string, interval time.Duration, recv chan<- peer.AddrInfo) error {
	routingDiscovery := routing.NewRoutingDiscovery(dht)
	routingDiscovery.Advertise(ctx, rendezvous)
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return nil
		case <-ticker.C:
			peers, err := routingDiscovery.FindPeers(ctx, rendezvous)
			if err != nil {
				log.Println("get peer error", err)
				return err
			}
			for p := range peers {
				if p.ID == h.ID() {
					continue
				}
				recv <- p
			}
		}
	}
}

func StartDiscoveryFromMDNS(ctx context.Context, h host.Host, recv chan<- peer.AddrInfo) error {
	s := mdns.NewMdnsService(
		h, DISCOVERY_SERVICE_TAG,
		&MDNSDiscoveryNotifee{
			h:   h,
			ch:  recv,
			ctx: ctx,
		},
	)
	return s.Start()
}

func Subscribe(ctx context.Context, h host.Host, bootnode string, interval time.Duration, recv chan<- peer.AddrInfo) error {
	if recv == nil {
		err := errors.New("empty receive channel")
		return errors.Wrap(err, "subscribe peer node error")
	}
	gossip, err := pubsub.NewGossipSub(ctx, h)
	if err != nil {
		return errors.Wrap(err, "subscribe peer node error")
	}
	room := fmt.Sprintf("%s-%s", core.NetworkRoom, bootnode)
	s := mdns.NewMdnsService(h, "", nil)
	err = s.Start()
	if err != nil {
		errors.Wrap(err, "subscribe peer node error")
	}
	topic, err := gossip.Join(room)
	if err != nil {
		errors.Wrap(err, "subscribe peer node error")
	}
	defer topic.Close()
	subscriber, err := topic.Subscribe()
	if err != nil {
		errors.Wrap(err, "subscribe peer node error")
	}
	ticker := time.NewTicker(interval)
	defer ticker.Stop()
	defer subscriber.Cancel()
	var fpeer peer.AddrInfo
	for {
		select {
		case <-ctx.Done():
			return nil
		case <-ticker.C:
			msg, err := subscriber.Next(ctx)
			if err != nil {
				continue
			}
			if msg.ReceivedFrom == h.ID() {
				continue
			}
			err = json.Unmarshal(msg.Data, &fpeer)
			if err != nil || fpeer.ID.Size() == 0 {
				continue
			}
			recv <- fpeer
		}
	}
}
