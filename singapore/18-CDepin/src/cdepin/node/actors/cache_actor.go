package actors

import (
	"context"
	"encoding/binary"
	"encoding/json"
	"errors"
	"io"
	"io/fs"
	"log"

	"net/url"
	"os"
	"path"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"sync/atomic"
	"time"

	cdnlib "cdepin/lib"
	"cdepin/lib/credit"
	"cdepin/lib/types"
	"cdepin/logger"

	"github.com/CESSProject/cess-go-sdk/config"
	"github.com/CESSProject/cess-go-tools/cacher"
	"github.com/asynkron/protoactor-go/actor"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/libp2p/go-libp2p/core/network"
	"github.com/syndtr/goleveldb/leveldb"
)

var (
	BusyLine = 1024
)

type CacheActor struct {
	cacher.FileCache
	record   *leveldb.DB
	dlQueue  *sync.Map //download queue
	creditMg *credit.Credit
	reqNum   *atomic.Int64
	Account  []byte
}

type DownloadTask struct {
	Source string
	Doing  bool
	Option string
}

func (c *CacheActor) Receive(context actor.Context) {
	switch context.Message().(type) {
	case types.CacheRequest:
		req := context.Message().(types.CacheRequest)
		fpath, err := c.GetCacheRecord(req.WantFile)
		if err != nil {
			logger.GetLogger(types.LOG_CACHE).Error("read cache action error", err)
			return
		}
		if _, err := os.Stat(fpath); err != nil {
			logger.GetLogger(types.LOG_CACHE).Error("read cache action error", err)
			return
		}
		context.Send(context.Sender(), fpath)
	case DownloadResponse:
		resp := context.Message().(DownloadResponse)
		hash := cdnlib.GetSha256Hash([]byte(resp.Key))
		err := c.MoveFileToCache(hash, resp.ResrcPath)
		if err != nil {
			//log
			return
		}
		c.dlQueue.Delete(hash)
	case []DownloadResponse:
		resps := context.Message().([]DownloadResponse)
		if len(resps) >= 4 {
			hashs := strings.Split(resps[0].Key, "/")
			if len(hashs) >= 2 {
				c.dlQueue.Delete(filepath.Join(hashs[0], hashs[1]))
			}
		}
		for _, resp := range resps {
			err := c.MoveFileToCache(resp.Key, resp.ResrcPath)
			if err != nil {
				//log
				continue
			}
			if string(resp.OriginNode) != ORIGIN_SITE_TAG {
				c.creditMg.AddCreditPoint(common.Bytes2Hex(resp.OriginNode), types.FragmentSize)
			}
		}
	}
}

func NewCacher(cache cacher.FileCache, creditMg *credit.Credit) *CacheActor {
	c := &CacheActor{
		FileCache: cache,
		creditMg:  creditMg,
		reqNum:    &atomic.Int64{},
	}
	db, err := leveldb.OpenFile("./file_record", nil)
	if err != nil {
		return nil
	}
	c.record = db
	c.AddCallbackOfAddItem(func(item cacher.CacheItem) {
		k := item.Key().(string)
		if _, err := url.ParseRequestURI(k); err == nil {
			return
		}
		k, _ = filepath.Split(k)
		buf := make([]byte, 4)
		v, err := c.record.Get([]byte(k+types.RECORD_FRAGMENTS), nil)
		if err != nil {
			if err == leveldb.ErrNotFound {
				binary.BigEndian.PutUint32(buf, 1)
				c.record.Put([]byte(k+types.RECORD_FRAGMENTS), buf, nil)
			}
		} else {
			if len(v) < 4 {
				binary.BigEndian.PutUint32(buf, 1)
			} else {
				binary.BigEndian.PutUint32(buf, 1+binary.BigEndian.Uint32(v))
			}
			c.record.Put([]byte(k+types.RECORD_FRAGMENTS), buf, nil)
		}
	})

	c.AddCallbackOfDeleteItem(func(item cacher.CacheItem) {
		k := item.Key().(string)
		k, _ = filepath.Split(k)
		v, err := c.record.Get([]byte(k+types.RECORD_FRAGMENTS), nil)

		if err == nil && len(v) >= 4 {
			value := binary.BigEndian.Uint32(v[:4])
			if value > 0 {
				value -= 1
			}
			binary.BigEndian.PutUint32(v[:4], value)
			c.record.Put([]byte(k+types.RECORD_FRAGMENTS), v[:4], nil)
			if value < config.DataShards {
				buf := make([]byte, 4)
				binary.BigEndian.PutUint32(buf, 0)
				c.record.Put([]byte(k+types.RECORD_REQUESTS), buf, nil)
			}
		}
	})
	return c
}

func (c *CacheActor) GetFileRecord(key, rType string) (int, bool) {
	if rType != types.RECORD_FRAGMENTS && rType != types.RECORD_REQUESTS {
		return 0, false
	}
	v, err := c.record.Get([]byte(key+rType), nil)
	if err != nil {
		return 0, false
	}
	if len(v) < 4 {
		return 0, false
	}
	return int(binary.BigEndian.Uint32(v[:4])), true
}

func (c *CacheActor) PutFileRecord(key, rType string, value int) error {
	if rType != types.RECORD_FRAGMENTS && rType != types.RECORD_REQUESTS {
		return errors.New("bad record type")
	}
	buf := make([]byte, 4)
	binary.BigEndian.PutUint32(buf, uint32(value))
	return c.record.Put([]byte(key+rType), buf, nil)
}

func (c *CacheActor) RestoreCacheFiles(cacheDir string) error {
	return filepath.Walk(cacheDir, func(path string, info fs.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}
		if info.Size() == config.FragmentSize {
			paths := strings.Split(path, "/")
			l := len(paths)
			if l < 4 {
				return nil
			}
			c.AddCacheRecord(filepath.Join(paths[l-1], paths[l-2], paths[l-3]), path)
		} else if info.Size() > 0 {
			c.AddCacheRecord(info.Name(), path)
		}
		logger.GetLogger(types.LOG_CACHE).Info("restore file ", path)
		return nil
	})
}

func (c *CacheActor) QueryCacheResource(acc, key string, isUrl bool) []string {

	option := NODE_RESOURCE_CACHE
	source := key
	if isUrl {
		option = SITE_RESOURCE_CACHE
		key = cdnlib.GetSha256Hash([]byte(key))

	}
	req, _ := c.GetFileRecord(key, types.RECORD_REQUESTS)
	req += 1
	c.PutFileRecord(key, types.RECORD_REQUESTS, req)
	citem, ok := c.creditMg.GetCreditRecord(acc)
	if citem.Level == credit.LEVEL_OWNER ||
		c.GetLoadRatio() < 0.8 && citem.Level < credit.LEVEL_UNTRUST ||
		(citem.Level < credit.LEVEL_COMMON && req >= 2) || req > 4 {
		_, ok = c.dlQueue.LoadOrStore(key, DownloadTask{
			Source: source,
			Option: option,
		})
	}
	logger.GetLogger(types.LOG_CACHE).Info("try to queue the data for download ", !ok)

	var res []string
	if !isUrl {
		count, _ := c.GetFileRecord(key, types.RECORD_FRAGMENTS)
		if count <= 0 {
			return res
		}
		c.TraverseCache(func(k interface{}, item cacher.CacheItem) {
			itemKey := k.(string)
			if strings.Compare(itemKey, key) == 0 {
				res = append(res, itemKey)
			} else if strings.Contains(itemKey, key) {
				_, file := filepath.Split(itemKey)
				res = append(res, file)
			}
		})
		logger.GetLogger(types.LOG_CACHE).Info("query cached files ", res)
	} else {
		v, err := c.GetCacheItem(key)
		if err != nil || v == nil {
			return res
		}
		return append(res, key)
	}
	return res
}

func (c *CacheActor) SetRequestNumber(delta int64) {
	c.reqNum.Add(delta)
}

func (c *CacheActor) GetRequestNumber() int64 {
	return c.reqNum.Load()
}

func (c *CacheActor) GetCacheInfo(userAcc string) types.CacheInfo {
	reqNum := c.GetRequestNumber()
	addr := common.HexToAddress(c.creditMg.Owner)
	info := types.CacheInfo{
		Status: func() string {
			if c.GetRequestNumber() >= int64(BusyLine) {
				return "busy"
			}
			return "idle"
		}(),
		LoadRatio: c.GetLoadRatio(),
		Account:   addr.Bytes(),
		Price:     c.creditMg.Price,
	}
	limit, ok := c.creditMg.IsLimited(userAcc)
	if ok {
		info.CreditLimit = -int64(limit)
	} else {
		info.CreditLimit = int64(limit)
	}
	if reqNum > int64(BusyLine) && c.GetRequestNumber()-reqNum > 0 {
		info.Status = types.CACHE_BUSY
	} else {
		info.Status = types.CACHE_IDLE
	}
	return info
}

func WriteJsonResponse(s network.Stream, status string, data any) error {
	resp := types.Response{
		Status: status,
		Data:   data,
	}
	res, err := json.Marshal(resp)
	if err != nil {
		s.Reset()
		return err
	}
	if _, err = s.Write(res); err != nil {
		s.Reset()
		return err
	}
	return nil
}

func (c *CacheActor) CacheService(s network.Stream) {
	defer s.Close()
	var (
		extReq  types.CacheRequest
		extResp types.CacheResponse
	)
	data, err := cdnlib.ReadData(s)
	if err != nil {
		logger.GetLogger(types.LOG_CACHE).Error("read cache service error", err)
		WriteJsonResponse(s, types.STATUS_ERROR, err.Error())
		return
	}
	err = json.Unmarshal(data, &extReq)
	if err != nil {
		logger.GetLogger(types.LOG_CACHE).Error("read cache service error", err)
		WriteJsonResponse(s, types.STATUS_ERROR, err.Error())
		return
	}
	paths := strings.Split(extReq.WantFile, "/")

	switch extReq.Option {
	case types.OPTION_DAIL:
		userAcc := common.BytesToAddress(extReq.AccountId).Hex()
		extResp.Info = c.GetCacheInfo(userAcc)
		extResp.Status = types.STATUS_OK
		WriteJsonResponse(s, types.STATUS_OK, extResp)
		return
	case types.OPTION_QUERY:
		pk, err := crypto.DecompressPubkey(extReq.AccountId)
		if err != nil {
			WriteJsonResponse(s, types.STATUS_ERROR, err.Error())
			return
		}
		userAcc := crypto.PubkeyToAddress(*pk).Hex()
		extResp.Info = c.GetCacheInfo(userAcc)
		key, isUrl := "", false
		func() {
			if !c.creditMg.CheckCredit(context.Background(), extReq.AccountId, extReq.Data, extReq.Sign) {
				extResp.Status = types.STATUS_FROZEN
				return
			}
			if extReq.WantUrl != "" {
				key = extReq.WantUrl
				isUrl = true
			} else {
				if len(paths) < 2 {
					extResp.Status = types.STATUS_OK
					return
				}
				key = path.Join(paths[0], paths[1])
				if _, ok := c.dlQueue.Load(key); ok {
					extResp.Status = types.STATUS_LOADING
					return
				}
			}
			if fragments := c.QueryCacheResource(
				userAcc, key, isUrl); len(fragments) > 0 {
				extResp.Status = types.STATUS_HIT
				extResp.CachedFiles = fragments
				return
			}
			extResp.Status = types.STATUS_MISS
		}()
		WriteJsonResponse(s, types.STATUS_OK, extResp)
		return
	case types.OPTION_DOWNLOAD:
		var fname string
		if extReq.WantUrl != "" {
			fname = cdnlib.GetSha256Hash([]byte(extReq.WantUrl))
		} else {
			if len(paths) < 3 {
				WriteJsonResponse(s, types.STATUS_ERROR, "illegal file Id and segment Id")
				return
			}
			if !c.creditMg.CheckCredit(context.Background(), extReq.AccountId, extReq.Data, extReq.Sign) {
				WriteJsonResponse(s, types.STATUS_ERROR, "failed credit check")
				logger.GetLogger(types.LOG_CACHE).Error("read cache service error", "failed credit check")
				return
			}
			fname = filepath.Join(paths[0], paths[1], paths[2])
		}

		fpath, err := c.GetCacheRecord(fname)
		if err != nil {
			logger.GetLogger(types.LOG_CACHE).Error("read cache service error", err)
			WriteJsonResponse(s, types.STATUS_ERROR, err.Error())
			return
		}
		var size int64
		if f, err := os.Stat(fpath); err != nil {
			logger.GetLogger(types.LOG_CACHE).Error("read cache service error", err)
			WriteJsonResponse(s, types.STATUS_ERROR, err.Error())
			return
		} else {
			size = f.Size()
		}
		f, err := os.Open(fpath)
		if err != nil {
			logger.GetLogger(types.LOG_CACHE).Error("read cache service error", err)
			WriteJsonResponse(s, types.STATUS_ERROR, err.Error())
			return
		}
		defer f.Close()
		bytes, err := io.ReadAll(f)
		log.Println("read file from cache ", f.Name(), " size:", len(bytes))
		if err != nil {
			logger.GetLogger(types.LOG_CACHE).Error("read cache service error", err)
			WriteJsonResponse(s, types.STATUS_ERROR, err.Error())
			return
		}
		_, err = s.Write(bytes)
		if err != nil {
			logger.GetLogger(types.LOG_CACHE).Error("read cache service error", err)
			s.Reset()
		}
		pk, err := crypto.DecompressPubkey(extReq.AccountId)
		if err != nil {
			WriteJsonResponse(s, types.STATUS_ERROR, err.Error())
			return
		}
		userAcc := crypto.PubkeyToAddress(*pk).Hex()
		c.creditMg.AddCreditPoint(userAcc, -size)
	default:
		s.Reset()
	}
}

func (c *CacheActor) RunDownloadServer(ctx context.Context, threadNum int) {
	if c.dlQueue != nil {
		return
	}
	if threadNum <= 0 {
		threadNum = runtime.NumCPU()/4 + 1
	}
	actorCtx := GetGlobalActorSystem().ActorSystem.Root
	resrcActor := GetGlobalActorSystem().GetActor(RESOURCE_ACTOR)
	if resrcActor == nil {
		logger.GetLogger(types.LOG_CACHE).Error("resource actor not ready")
		return
	}
	c.dlQueue = &sync.Map{}
	defer func() { c.dlQueue = nil }()
	wg := &sync.WaitGroup{}
	for i := 0; i < threadNum; i++ {
		wg.Add(1)
		idx := i
		go func() {
			defer wg.Done()
			for {
				select {
				case <-ctx.Done():
					return
				default:
					time.Sleep((5*time.Duration(idx) + 15) * time.Second)
				}
				c.dlQueue.Range(func(key, value any) bool {
					//download file
					task := value.(DownloadTask)
					if task.Doing {
						return true
					}

					if task.Option == NODE_RESOURCE_CACHE {
						hashs := strings.Split(task.Source, "/")
						if len(hashs) != 2 {
							return true
						}
						count, ok := c.GetFileRecord(key.(string), types.RECORD_FRAGMENTS)
						if ok && count >= config.DataShards {
							c.dlQueue.Delete(key)
							return true
						}
						task.Doing = true
						c.dlQueue.Store(key, task)
						actorCtx.Send(resrcActor, DownloadRequest{
							Option: NODE_RESOURCE_CACHE,
							Data: types.CacheRequest{
								AccountId: c.Account,
								WantFile:  task.Source,
							},
						})
					} else {
						item, err := c.GetCacheRecord(key.(string))
						if err == nil && item != "" {
							c.dlQueue.Delete(key)
						}
						task.Doing = true
						c.dlQueue.Store(key, task)
						actorCtx.Send(resrcActor, DownloadRequest{
							Option: SITE_RESOURCE_CACHE,
							Data: types.CacheRequest{
								AccountId: c.Account,
								WantUrl:   task.Source,
							},
						})
					}
					return true
				})
			}
		}()
	}
	wg.Wait()
}
