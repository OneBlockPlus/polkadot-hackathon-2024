package client

import (
	"context"
	"crypto/ecdsa"
	"encoding/hex"
	"encoding/json"
	"log"
	"math/big"
	"time"

	cdnlib "cdepin/lib"
	"cdepin/lib/credit"
	"cdepin/lib/p2p"
	"cdepin/lib/types"

	"github.com/CESSProject/cess-go-sdk/chain"
	"github.com/CESSProject/cess-go-tools/scheduler"
	"github.com/CESSProject/p2p-go/core"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/mr-tron/base58/base58"
	"github.com/pkg/errors"
)

const (
	MAX_FLUSH_TIMES       = 512
	DEFAULT_NODE_NUM      = 128
	DEFAULT_TASK_INTERVAL = time.Minute * 5
)

var (
	MaxStorageNodeNum = 128
	MaxCacheNodeNum   = 128
)

type Client struct {
	*chain.ChainClient
	Mnemonic      string
	ethAccSk      *ecdsa.PrivateKey
	Cachers       scheduler.Selector
	Storages      scheduler.Selector
	StorageCli    *core.PeerNode
	CacheCli      *p2p.PeerNode
	CacheFeeLimit string
	tmpDir        string
	creditMg      *credit.Credit
	osQueue       chan types.CacheResponse //order settlement queue
	uploadQueue   chan UploadStats
}

type UploadStats struct {
	FileHash    string
	FilePath    string
	CallBack    func(UploadStats)
	SegmentInfo []chain.SegmentDataInfo
	Group       []UploadGroup
}

type UploadGroup struct {
	MinerID   string
	PeerID    string
	Saved     bool
	OnChain   bool
	FlushTime time.Time
}

type FileBox struct {
	FileHash    string      `json:"file_hash"`
	TotalSize   int64       `json:"total_size"`
	PaddingSize int64       `json:"padding_size"`
	Plates      []FilePlate `json:"file_plates"`
}

type FilePlate struct {
	SegmentHash string   `json:"segment_hash"`
	Files       []string `json:"file_names"`
	Indexs      []int    `json:"file_indexs"`
}

func NewClient(chainCli chain.ChainClient, storageCli *core.PeerNode, cacheCli *p2p.PeerNode, cachers, storages scheduler.Selector, creditMg *credit.Credit, ethAccSk *ecdsa.PrivateKey) *Client {
	//mnemonic, tmpDir string
	return &Client{
		ChainClient: &chainCli,
		StorageCli:  storageCli,
		CacheCli:    cacheCli,
		Cachers:     cachers,
		Storages:    storages,
		creditMg:    creditMg,
		ethAccSk:    ethAccSk,
	}
}

func (c *Client) GetPublickey() []byte {
	return crypto.CompressPubkey(&c.ethAccSk.PublicKey)
}

func (c *Client) SetConfig(Mnemonic, tmpDir string, CacheFeeLimit string, uploadQueueSize int) {
	c.Mnemonic = Mnemonic
	c.tmpDir = tmpDir
	c.CacheFeeLimit = CacheFeeLimit
	c.uploadQueue = make(chan UploadStats, uploadQueueSize)
}

func (c *Client) PaymentCacheOrder() error {

	for resp := range c.osQueue {
		debt := (-resp.Info.CreditLimit) / types.FragmentSize
		if resp.Info.CreditLimit > 0 {
			continue
		}
		if debt == 0 {
			debt = 1
		}
		price, ok := big.NewInt(0).SetString(resp.Info.Price, 10)
		if !ok {
			continue
		}
		bill := price.Mul(price, big.NewInt(debt))
		acc := common.BytesToAddress(resp.Info.Account).Hex()
		tx, orderId, err := c.creditMg.PaymentCreditBill(context.Background(), acc, resp.Info.PeerId, bill.String())
		if err != nil {
			log.Println("payment cache order error", err)
			continue
		}
		log.Printf("payment order %s, tx hash: %s \n.", tx, orderId)
		if orderId == "" || tx == "" {
			continue
		}

		oid, err := hex.DecodeString(orderId)
		if err != nil {
			log.Println("decode cache order Id error", err)
			continue
		}

		bpid, err := base58.Decode(string(resp.Info.PeerId))
		if err != nil {
			log.Println("payment cache order error", err)
			continue
		}
		sign, err := crypto.Sign(crypto.Keccak256Hash(oid).Bytes(), c.ethAccSk)
		if err != nil {
			log.Println("sign order id error", err)
			continue
		}
		res, err := cdnlib.QueryFileInfoFromCache(
			c.CacheCli.Host,
			peer.ID(bpid),
			types.CacheRequest{
				AccountId: crypto.CompressPubkey(&c.ethAccSk.PublicKey),
				Data:      oid,
				Sign:      sign,
			},
		)
		if err != nil {
			log.Println("payment cache order error", err)
			continue
		}
		if res.Status != types.STATUS_OK {
			log.Println("payment cache order error, response from cacher not is ok")
		}
	}
	return nil
}

func (c *Client) RunDiscovery(ctx context.Context, bootNode string) error {
	var err error
	peerCh := make(chan peer.AddrInfo, MaxStorageNodeNum)
	cacheCh := make(chan peer.AddrInfo, MaxCacheNodeNum)
	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case peer := <-peerCh:
				if peer.ID.Size() == 0 {
					break
				}
				c.Storages.FlushPeerNodes(5*time.Second, nil, peer)
			case peer := <-cacheCh:
				if peer.ID.Size() == 0 {
					break
				}
				log.Println("find cacher ", peer.ID)
				//
				if c.Cachers.GetPeersNumber() >= MaxCacheNodeNum {
					continue
				}
				if err = c.CacheCli.Connect(context.Background(), peer); err != nil {
					log.Println("connect peer error", err)
					continue
				}
				c.Cachers.FlushPeerNodes(15*time.Second, func() bool {
					if res, err := cdnlib.DailCacheNode(c.CacheCli.Host, peer.ID); err != nil {
						log.Println("dail", peer.ID, " error ", err)
						return false
					} else {
						jbytes, _ := json.Marshal(res)
						log.Println("dail cacher success, response: ", string(jbytes))
						return true
					}
				}, peer)
			}

		}
	}()
	go func() {
		err = p2p.StartDiscoveryFromMDNS(ctx, c.CacheCli.Host, cacheCh)
	}()
	go func() {
		err = p2p.StartDiscoveryFromDHT(
			ctx,
			c.CacheCli.Host,
			c.CacheCli.IpfsDHT,
			p2p.DISCOVERY_RENDEZVOUS,
			time.Second*3, cacheCh,
		)
	}()
	err = p2p.Subscribe(ctx, c.StorageCli.GetHost(), c.StorageCli.GetBootnode(), time.Minute, peerCh)
	if err != nil {
		return errors.Wrap(err, "run discovery service error")
	}
	return nil
}
