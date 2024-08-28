package p2p

import (
	"context"
	"crypto/rand"
	"fmt"
	"log"
	"net"
	"os"
	"strings"

	"github.com/libp2p/go-libp2p"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	"github.com/libp2p/go-libp2p/config"
	"github.com/libp2p/go-libp2p/core/crypto"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/libp2p/go-libp2p/core/protocol"
	tls "github.com/libp2p/go-libp2p/p2p/security/tls"
	"github.com/libp2p/go-libp2p/p2p/transport/tcp"
	ma "github.com/multiformats/go-multiaddr"
	"github.com/pkg/errors"
)

var (
	CdnCacheProtocol = protocol.ID("/cdn_cache_stream/v0")
	Version          = "v0"
)

type PeerNode struct {
	host.Host
	*dht.IpfsDHT
}

func NewPeerNode(network, version string, boots []string, opts ...config.Option) (*PeerNode, error) {
	opts = append([]config.Option{
		libp2p.Transport(tcp.NewTCPTransport),
		libp2p.Security(tls.ID, tls.New),
		libp2p.DisableMetrics(),
		libp2p.EnableRelay(),
		libp2p.ProtocolVersion(fmt.Sprintf("%s/protoco/%s", network, version)),
	}, opts...)
	host, err := libp2p.New(opts...)

	if err != nil {
		return nil, errors.Wrap(err, "new peer node error")
	}

	var usefulBoots []peer.AddrInfo
	for _, boot := range boots {
		addrs, err := ParseMultiaddrs(boot)
		if err != nil {
			continue
		}
		for _, addr := range addrs {
			multiaddr, err := ma.NewMultiaddr(addr)
			if err != nil {
				continue
			}
			addrInfo, err := peer.AddrInfoFromP2pAddr(multiaddr)
			if err != nil {
				continue
			}
			host.Connect(context.Background(), *addrInfo)
			usefulBoots = append(usefulBoots, *addrInfo)
		}
	}

	ipfsDHT, err := dht.New(
		context.Background(), host,
		dht.ProtocolPrefix(protocol.ID(network)),
		dht.V1ProtocolOverride(protocol.ID(fmt.Sprintf("/dht/%s", version))),
		dht.BootstrapPeers(usefulBoots...),
	)
	if err != nil {
		return nil, errors.Wrap(err, "new peer node error")
	}
	err = ipfsDHT.Bootstrap(context.Background())
	if err != nil {
		return nil, errors.Wrap(err, "new peer node error")
	}
	log.Println("node ID", host.ID().String())

	return &PeerNode{host, ipfsDHT}, nil
}

func Identification(fpath string) (crypto.PrivKey, error) {

	if _, err := os.Stat(fpath); err == nil {
		content, err := os.ReadFile(fpath)
		if err != nil {
			return nil, err
		}
		if len(content) > 0 {
			return crypto.UnmarshalEd25519PrivateKey(content)
		}
	}
	// Creates a new RSA key pair for this host.
	prvKey, _, err := crypto.GenerateKeyPairWithReader(crypto.Ed25519, -1, rand.Reader)
	if err != nil {
		return nil, err
	}

	b, err := prvKey.Raw()
	if err != nil {
		return nil, err
	}
	f, err := os.Create(fpath)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	if _, err = f.Write(b); err != nil {
		return nil, err
	}
	if err = f.Sync(); err != nil {
		return nil, err
	}

	return prvKey, nil
}

func ParseMultiaddrs(domain string) ([]string, error) {
	var result = make([]string, 0)
	var realDns = make([]string, 0)

	addr, err := ma.NewMultiaddr(domain)
	if err == nil {
		_, err = peer.AddrInfoFromP2pAddr(addr)
		if err == nil {
			result = append(result, domain)
			return result, nil
		}
	}

	dnsnames, err := net.LookupTXT(domain)
	if err != nil {
		return result, err
	}
	for _, v := range dnsnames {
		if strings.Contains(v, "ip4") && strings.Contains(v, "tcp") {
			result = append(result, strings.TrimPrefix(v, "dnsaddr="))
		}
	}

	trims := strings.Split(domain, ".")
	domainname := fmt.Sprintf("%s.%s", trims[len(trims)-2], trims[len(trims)-1])

	for _, v := range dnsnames {
		trims = strings.Split(v, "/")
		for _, vv := range trims {
			if strings.Contains(vv, domainname) {
				realDns = append(realDns, vv)
				break
			}
		}
	}

	for _, v := range realDns {
		dnses, err := net.LookupTXT("_dnsaddr." + v)
		if err != nil {
			continue
		}
		for i := 0; i < len(dnses); i++ {
			if strings.Contains(dnses[i], "ip4") && strings.Contains(dnses[i], "tcp") && strings.Count(dnses[i], "=") == 1 {
				var multiaddr = strings.TrimPrefix(dnses[i], "dnsaddr=")
				result = append(result, multiaddr)
			}
		}
	}
	return result, nil
}
