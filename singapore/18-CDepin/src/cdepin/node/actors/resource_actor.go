package actors

import (
	"context"
	"encoding/hex"
	"io"
	"log"
	"net/http"
	"os"
	"path"
	"path/filepath"
	"strings"
	"sync"
	"time"

	cdnlib "cdepin/lib"
	cdnconf "cdepin/lib/config"
	"cdepin/lib/p2p"
	"cdepin/lib/types"
	"cdepin/logger"

	"github.com/CESSProject/cess-go-sdk/chain"
	"github.com/CESSProject/cess-go-sdk/config"
	"github.com/CESSProject/cess-go-tools/scheduler"
	"github.com/CESSProject/p2p-go/core"
	"github.com/asynkron/protoactor-go/actor"
	"github.com/ipfs/go-cid"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/multiformats/go-multihash"
	"github.com/pkg/errors"
	"golang.org/x/exp/rand"
)

const (
	ORIGIN_SITE_TAG     = "origin_site_tag"
	SITE_RESOURCE_CACHE = "site resource cache"
	NODE_RESOURCE_CACHE = "node resource cache"
)

type CacheStrategy struct {
	MaxCachedSegmentNum int
	AvgCachedSegmentNum int
	MinCachedSegmentNum int
	NeighborNum         int
}

type ResourceActor struct {
	*chain.ChainClient
	CacherPeer *p2p.PeerNode
	scheduler.Selector
	StoragePeer *core.PeerNode
	CacheStrategy
}

type DownloadResponse struct {
	ResrcPath  string
	Key        string
	OriginNode []byte
}

type DownloadRequest struct {
	Option string
	Data   any
}

func (ra *ResourceActor) RunDiscovery(ctx context.Context, bootNode string) error {
	var err error
	ch := make(chan peer.AddrInfo, 64)
	ticker := time.NewTicker(time.Hour * 3)
	defer ticker.Stop()
	go func() {
		for {
			select {
			case <-ctx.Done():
				return
			case peer := <-ch:
				if peer.ID.Size() == 0 {
					break
				}
				ra.Selector.FlushPeerNodes(5*time.Second, func() bool {
					if _, err := cdnlib.DailCacheNode(ra.CacherPeer.Host, peer.ID); err != nil {
						return false
					} else {
						return true
					}
				}, peer)
			case <-ticker.C:
			}
		}
	}()
	go func() {
		err = p2p.StartDiscoveryFromMDNS(ctx, ra.CacherPeer.Host, ch)
	}()
	err = p2p.StartDiscoveryFromDHT(
		context.Background(),
		ra.CacherPeer.Host,
		ra.CacherPeer.IpfsDHT,
		p2p.DISCOVERY_RENDEZVOUS,
		time.Second*3, ch,
	)
	if err != nil {
		return errors.Wrap(err, "run discovery service error")
	}
	return nil
}

func NewResourceActor(cacher *p2p.PeerNode, storager *core.PeerNode, cachers scheduler.Selector, cli *chain.ChainClient, strategy CacheStrategy) *ResourceActor {
	if strategy.MinCachedSegmentNum == 0 {
		strategy.MinCachedSegmentNum = 3
	}
	if strategy.MaxCachedSegmentNum == 0 {
		strategy.MaxCachedSegmentNum = 16
	}
	if strategy.AvgCachedSegmentNum == 0 {
		strategy.AvgCachedSegmentNum = 5
	}
	if strategy.NeighborNum == 0 {
		strategy.NeighborNum = 64
	}
	return &ResourceActor{
		CacherPeer:    cacher,
		StoragePeer:   storager,
		Selector:      cachers,
		ChainClient:   cli,
		CacheStrategy: strategy,
	}
}

func (ra *ResourceActor) Receive(context actor.Context) {
	req, ok := context.Message().(DownloadRequest)
	if !ok {
		return
	}
	cacheActor := GetGlobalActorSystem().GetActor(CACHE_ACTOR)
	if cacheActor == nil {
		logger.GetLogger(types.LOG_CACHE).Error("resource actor not ready")
		return
	}
	switch req.Option {
	case NODE_RESOURCE_CACHE:
		creq, ok := req.Data.(types.CacheRequest)
		if !ok {
			return
		}
		hashs := strings.Split(creq.WantFile, "/")
		if len(hashs) != 2 {
			return
		}
		resp, err := ra.DownloadStoragedFiles(creq.AccountId, hashs[0], hashs[1])
		if err != nil {
			logger.GetLogger(types.LOG_CACHE).Infof("download file %s error %v", creq.WantFile, err)
		}
		context.Send(cacheActor, resp)
	case SITE_RESOURCE_CACHE:
		creq, ok := req.Data.(types.CacheRequest)
		if !ok {
			return
		}
		hash := cdnlib.GetSha256Hash([]byte(creq.WantUrl))
		fpath := filepath.Join(cdnconf.TempDir, hash)
		n, err := downloadfile(creq.WantUrl, fpath)
		if err != nil {
			logger.GetLogger(types.LOG_CACHE).Infof("download resource from %s error %v", creq.WantUrl, err)
		}
		logger.GetLogger(types.LOG_CACHE).Infof("download file %s success, bytes: %d", creq.WantFile, n)
		context.Send(cacheActor, DownloadResponse{
			ResrcPath:  fpath,
			Key:        creq.WantUrl,
			OriginNode: []byte(ORIGIN_SITE_TAG),
		})
	}
}

func downloadfile(url, fpath string) (int64, error) {
	log.Println("download file, url: ", url, " fpath: ", fpath)
	r, err := http.Get(url)
	if err != nil {
		return 0, errors.Wrap(err, "download resource by http error")
	}
	defer r.Body.Close()
	f, err := os.Create(fpath)
	if err != nil {
		return 0, errors.Wrap(err, "download resource by http error")
	}
	defer f.Close()
	n, err := io.Copy(f, r.Body)
	if err != nil {
		return 0, errors.Wrap(err, "download resource by http error")
	}
	return n, nil
}

func (ra *ResourceActor) DownloadStoragedFiles(acc []byte, fhash, shash string) ([]DownloadResponse, error) {
	logger.GetLogger(types.LOG_CACHE).Info("download files ", fhash, " ", shash)
	fmeta, err := ra.QueryFile(fhash, -1)
	if err != nil {
		return nil, errors.Wrap(err, "download fragments from storager error")
	}
	//Active local cache strategy: cache several adjacent data blocks
	cacheNum := ra.CacheStrategy.MinCachedSegmentNum + len(fmeta.SegmentList)/ra.CacheStrategy.NeighborNum
	if cacheNum > ra.CacheStrategy.MaxCachedSegmentNum {
		cacheNum = ra.CacheStrategy.MaxCachedSegmentNum
	}
	ShuffleSegments(fmeta.SegmentList)
	totalResps := make([]DownloadResponse, 0)
	num, done, provide := 0, false, false
	for _, segment := range fmeta.SegmentList {
		if num >= cacheNum {
			break
		}
		//query file from cache node
		if string(segment.Hash[:]) == shash {
			done = true
		}
		if !done && num >= cacheNum-1 {
			continue
		}
		cachedPeers, err := ra.QuerySegmentFromNeighborCacher(fhash, string(segment.Hash[:]), acc)
		logger.GetLogger(types.LOG_CACHE).Info("query segment from neighbor cache node ", cachedPeers)
		if err == nil {
			if len(cachedPeers) >= ra.CacheStrategy.AvgCachedSegmentNum {
				continue
			}
			//shared file from cache node
			logger.GetLogger(types.LOG_CACHE).Info("shared segment from neighbor ")
			resp := ra.SharedSegmentFromNeighborCacher(acc, fhash, segment, cachedPeers)
			if len(resp) > 0 {
				totalResps = append(totalResps, resp...)
				logger.GetLogger(types.LOG_CACHE).Info("fetched segment from neighbor")
				num++
				continue
			}
		}
		count := 0
		logger.GetLogger(types.LOG_CACHE).Info("download segment from storage node ")
		for _, fragment := range segment.FragmentList {
			if count >= config.DataShards {
				break
			}
			hash := string(fragment.Hash[:])
			fname := filepath.Join(fhash, shash, hash)
			miner, err := ra.QueryMinerItems(fragment.Miner[:], -1)
			if err != nil {
				logger.GetLogger(types.LOG_CACHE).Error("query miner items error ", err)
				continue
			}
			// bk := base58.Encode([]byte(string(miner.PeerId[:])))
			fpath := filepath.Join(cdnconf.TempDir, hash)
			//
			logger.GetLogger(types.LOG_CACHE).Infof("read file %s from storage node %v", hash, peer.ID(string(miner.PeerId[:])).String())
			_, err = ra.StoragePeer.ReadDataAction(context.Background(), peer.ID(string(miner.PeerId[:])), hash, fpath)
			if err != nil {
				logger.GetLogger(types.LOG_CACHE).Errorf("read file %s from storage node %v error %v", hash, peer.ID(string(miner.PeerId[:])).String(), err)
				continue
			}
			logger.GetLogger(types.LOG_CACHE).Info("cache file: ", fname, " path: ", fpath)
			totalResps = append(totalResps, DownloadResponse{
				ResrcPath:  fpath,
				Key:        filepath.Join(fhash, shash, hash),
				OriginNode: []byte(ORIGIN_SITE_TAG),
			})
			count++
			if !provide {
				if cid, err := hashToCid(shash); err == nil {
					if err = ra.CacherPeer.Provide(context.Background(), cid, true); err != nil {
						logger.GetLogger(types.LOG_CACHE).Errorf("provide %s error %v", cid.String(), err)
					} else {
						provide = true
					}
				}
			}
		}
		num++
	}
	return totalResps, nil
}

func (ra *ResourceActor) QuerySegmentFromNeighborCacher(fileHash, segmentHash string, acc []byte) (map[peer.ID]types.CacheResponse, error) {
	cachedFilePeers := make(map[peer.ID]types.CacheResponse)
	peerNum := ra.Selector.GetPeersNumber() - 1
	if peerNum <= 0 {
		return nil, errors.New("no neighbor cache node")
	}
	//randomly find 1/3 neighbors and send a query
	if peerNum > ra.CacheStrategy.NeighborNum/3 {
		peerNum = ra.CacheStrategy.NeighborNum
	}
	threadNum := ra.CacheStrategy.NeighborNum / 3
	if peerNum < threadNum {
		threadNum = peerNum
	}
	if threadNum <= 0 {
		threadNum = 1
	}
	itor, err := ra.Selector.NewPeersIterator(peerNum)
	if err != nil {
		return nil, err
	}
	wg := sync.WaitGroup{}
	lock := sync.Mutex{}
	peerCh := make(chan peer.AddrInfo, threadNum)
	wg.Add(threadNum + 1) //add one routine to provide peers
	go func() {
		defer wg.Done()
		var peers []peer.AddrInfo
		if cid, err := hashToCid(segmentHash); err == nil {
			peers, err = ra.CacherPeer.FindProviders(context.Background(), cid)
			if err != nil {
				logger.GetLogger(types.LOG_CACHE).Errorf("find cid %s providers error %v", cid.String(), err)
			}
		}
		for _, p := range peers {
			peerCh <- p
		}
		for peer, ok := itor.GetPeer(); ok; peer, ok = itor.GetPeer() {
			peerCh <- peer
		}
		close(peerCh)
	}()
	for i := 0; i < threadNum; i++ {
		go func() {
			defer wg.Done()
			for peer := range peerCh {
				if err = ra.CacherPeer.Host.Connect(context.Background(), peer); err != nil {
					continue
				}
				resp, err := cdnlib.QueryFileInfoFromCache(
					ra.CacherPeer.Host, peer.ID,
					types.CacheRequest{
						AccountId: acc,
						WantFile:  path.Join(fileHash, segmentHash),
					},
				)
				if err != nil {
					ra.Selector.Feedback(peer.ID.String(), false)
					continue
				}
				ra.Selector.Feedback(peer.ID.String(), true)
				if resp.Status != types.STATUS_HIT && resp.Status != types.STATUS_LOADING {
					continue
				}
				lock.Lock()
				if len(cachedFilePeers) >= ra.CacheStrategy.AvgCachedSegmentNum {
					lock.Unlock()
					return
				}
				cachedFilePeers[peer.ID] = resp
				lock.Unlock()
			}
		}()
	}
	wg.Wait()
	return cachedFilePeers, nil
}

func (ra *ResourceActor) SharedSegmentFromNeighborCacher(acc []byte, fhash string, segment chain.SegmentInfo, peers map[peer.ID]types.CacheResponse) []DownloadResponse {
	cachedFragments := map[string]struct{}{}
	shash := string(segment.Hash[:])
	resps := make([]DownloadResponse, 0)
	count, provide := 0, false
	for id, res := range peers {
		if res.Status == types.STATUS_LOADING {
			continue
		}
		if count >= config.DataShards {
			break
		}
		for i := 0; i < len(res.CachedFiles); i++ {
			if _, ok := cachedFragments[res.CachedFiles[i]]; ok {
				continue
			}
			fpath := filepath.Join(cdnconf.TempDir, res.CachedFiles[i])

			if err := cdnlib.DownloadFileFromCache(
				ra.CacherPeer.Host, id, fpath,
				types.CacheRequest{
					WantFile:  path.Join(fhash, string(shash), res.CachedFiles[i]),
					AccountId: acc,
				},
			); err != nil {
				continue
			}
			count++
			cachedFragments[res.CachedFiles[i]] = struct{}{}
			//res.CachedFiles[i]
			resps = append(resps, DownloadResponse{
				ResrcPath:  fpath,
				Key:        filepath.Join(fhash, shash, res.CachedFiles[i]),
				OriginNode: res.Info.Account,
			})
			if !provide {
				if cid, err := hashToCid(shash); err == nil {
					if err = ra.CacherPeer.Provide(context.Background(), cid, true); err != nil {
						logger.GetLogger(types.LOG_CACHE).Errorf("provide %s error %v", cid.String(), err)
					} else {
						provide = true
					}
				}
			}
		}
	}
	return resps
}

func ShuffleSegments(segments []chain.SegmentInfo) {
	for i := len(segments) - 1; i > 0; i-- {
		j := rand.Intn(i + 1)
		segments[i], segments[j] = segments[j], segments[i]
	}
}

func hashToCid(hash string) (cid.Cid, error) {
	bytes, err := hex.DecodeString(hash)
	if err != nil {
		return cid.Cid{}, err
	}
	mh, err := multihash.Encode(bytes, multihash.SHA2_256)
	if err != nil {
		return cid.Cid{}, err
	}
	return cid.NewCidV1(multihash.SHA2_256, mh), nil
}
