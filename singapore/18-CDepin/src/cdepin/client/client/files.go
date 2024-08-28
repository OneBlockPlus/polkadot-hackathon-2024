package client

import (
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"os"
	"path"
	"path/filepath"
	"strings"
	"sync"
	"time"

	cdnlib "cdepin/lib"
	"cdepin/lib/types"

	"github.com/CESSProject/cess-go-sdk/config"
	"github.com/CESSProject/cess-go-sdk/core/erasure"
	"github.com/CESSProject/cess-go-sdk/core/process"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/crypto"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/pkg/errors"
)

func (c *Client) DownloadFile(ctx context.Context, fdir, fhash, cipher string) (string, error) {

	if _, err := os.Stat(fdir); err != nil {
		return "", errors.Wrap(err, "download file error")
	}
	dlfile := filepath.Join(fdir, fhash)
	f, err := os.Create(dlfile)
	if err != nil {
		return "", errors.Wrap(err, "download file error")
	}
	defer f.Close()
	fmeta, err := c.QueryFile(fhash, -1)
	if err != nil {
		return dlfile, errors.Wrap(err, "download file error")
	}
	cacherNum := c.Cachers.GetPeersNumber()
	segmentPaths := make([]string, 0)

	defer func() {
		for _, segment := range segmentPaths {
			os.Remove(segment)
		}
	}()

	for _, segment := range fmeta.SegmentList {
		cacherdMap, err := c.QuerySegmentFromCachers(fhash, string(segment.Hash[:]), cacherNum, cacherNum)
		if err != nil || len(cacherdMap) <= 0 {

			segPath, err := cdnlib.DownloadSegmentFromStorage(fdir, fhash, string(segment.Hash[:]), c.ChainClient, c.StorageCli)
			if err != nil {
				return dlfile, errors.Wrap(err, "download file error")
			}
			segmentPaths = append(segmentPaths, segPath)
			continue
		}
		fragments := c.DownloadSegmentFromCachers(fhash, string(segment.Hash[:]), fdir, cacherdMap)
		segPath := filepath.Join(fdir, string(segment.Hash[:]))
		if len(fragments) >= config.DataShards {

			err = erasure.RSRestore(segPath, fragments[:config.DataShards])
			if err != nil {
				return dlfile, errors.Wrap(err, "download file error")
			}
			segmentPaths = append(segmentPaths, segPath)
			for _, p := range fragments {
				os.Remove(p)
			}
			continue
		}
		for _, fragment := range segment.FragmentList {
			if DataInList(string(fragment.Hash[:]), fragments) {
				continue
			}
			miner, err := c.QueryMinerItems(fragment.Miner[:], -1)
			if err != nil {
				continue
			}
			fragmentpath := filepath.Join(fdir, string(fragment.Hash[:]))
			_, err = c.StorageCli.ReadDataAction(context.Background(), peer.ID(miner.PeerId[:]), string(segment.Hash[:]), fragmentpath)
			if err != nil {
				continue
			}
			fragments = append(fragments, fragmentpath)
			if len(fragments) >= config.DataShards {
				err = erasure.RSRestore(segPath, fragments)
				if err != nil {
					return dlfile, errors.Wrap(err, "download file error")
				}
				segmentPaths = append(segmentPaths, segPath)
				for _, p := range fragments {
					os.Remove(p)
				}
				break
			}
		}
	}

	if len(segmentPaths) != len(fmeta.SegmentList) {
		err = errors.New("the number of downloaded segments is inconsistent")
		return dlfile, errors.Wrap(err, "download file error")
	}

	err = cdnlib.RecoveryFileViaSegments(segmentPaths, fmeta, cipher, f)
	if err != nil {
		return dlfile, errors.Wrap(err, "download file error")
	}
	return dlfile, nil
}

func (c *Client) DownloadSegment(ctx context.Context, fhash, shash, sdir string) (string, error) {
	if _, err := os.Stat(sdir); err != nil {
		return "", errors.Wrap(err, "download file segment error")
	}

	cacherNum := c.Cachers.GetPeersNumber()
	cacherdMap, err := c.QuerySegmentFromCachers(fhash, shash, cacherNum, cacherNum)
	if err != nil || len(cacherdMap) <= 0 {

		segPath, err := cdnlib.DownloadSegmentFromStorage(sdir, fhash, shash, c.ChainClient, c.StorageCli)
		if err != nil {
			return "", errors.Wrap(err, "download file segment error")
		}
		return segPath, nil
	}
	fragments := c.DownloadSegmentFromCachers(fhash, shash, sdir, cacherdMap)
	defer func() {
		for _, p := range fragments {
			os.Remove(p)
		}
	}()
	segPath := filepath.Join(sdir, shash)
	if len(fragments) >= config.DataShards {
		err = erasure.RSRestore(segPath, fragments[:config.DataShards])
		if err != nil {
			return "", errors.Wrap(err, "download file segment error")
		}
		return segPath, nil
	}
	fmeta, err := c.QueryFile(fhash, -1)
	if err != nil {
		return "", errors.Wrap(err, "download file segment error")
	}
	for _, segment := range fmeta.SegmentList {
		if string(segment.Hash[:]) != shash {
			continue
		}
		for _, fragment := range segment.FragmentList {
			if DataInList(string(fragment.Hash[:]), fragments) {
				continue
			}
			miner, err := c.QueryMinerItems(fragment.Miner[:], -1)
			if err != nil {
				continue
			}
			fragmentpath := filepath.Join(sdir, string(fragment.Hash[:]))
			_, err = c.StorageCli.ReadDataAction(context.Background(), peer.ID(miner.PeerId[:]), shash, fragmentpath)
			if err != nil {
				continue
			}
			fragments = append(fragments, fragmentpath)
			if len(fragments) >= config.DataShards {
				err = erasure.RSRestore(segPath, fragments[:config.DataShards])
				if err != nil {
					return "", errors.Wrap(err, "download file segment error")
				}
				return segPath, nil
			}
		}
	}
	err = errors.New("the number of downloaded fragment is inconsistent")
	return segPath, errors.Wrap(err, "download file segment error")
}

func (c *Client) UploadFile(territory, bucket, fpath, cipher string, callback func(UploadStats)) (string, error) {
	status, err := c.PreprocessFileAndPutIntoUploadQueue(fpath, cipher, territory, bucket, callback)
	if err != nil {
		return "", errors.Wrap(err, "upload file error")
	}
	return status.FileHash, nil
}

func (c *Client) UploadDirAsBoxFile(territory, bucket, fname, dir, cipher string, callback func(UploadStats)) (string, []byte, error) {

	box, fpath, err := c.CreateAFileBox(fname, dir)
	if err != nil {
		return "", nil, errors.Wrap(err, "upload dir error")
	}

	status, err := c.PreprocessFileAndPutIntoUploadQueue(
		fpath, cipher, territory, bucket, func(us UploadStats) {
			callback(us)
			if _, err := os.Stat(us.FilePath); err == nil {
				os.RemoveAll(us.FilePath)
			}
		})
	if err != nil {
		return "", nil, errors.Wrap(err, "upload dir error")
	}
	if len(status.SegmentInfo) != len(box.Plates) {
		err = errors.New("the number of generated segments is inconsistent")
		return "", nil, errors.Wrap(err, "upload dir error")
	}
	for i := 0; i < len(status.SegmentInfo); i++ {
		box.Plates[i].SegmentHash = status.SegmentInfo[i].SegmentHash
	}

	bytes, err := json.Marshal(box)
	if err != nil {
		return "", nil, errors.Wrap(err, "upload dir error")
	}
	return status.FileHash, bytes, nil
}

func (c Client) DownloadFileInBox(fhash, elemFileName string, boxMeta FileBox) ([]byte, error) {
	sidx, didx := -1, 0
	for i := 0; i < len(boxMeta.Plates); i++ {
		for j, file := range boxMeta.Plates[i].Files {
			if file == elemFileName {
				sidx, didx = i, j
				break
			}
		}
	}
	if sidx == -1 {
		err := errors.New("data not found from box metadata")
		return nil, errors.Wrap(err, "download file in box error")
	}
	spath, err := c.DownloadSegment(context.Background(), fhash, string(boxMeta.Plates[sidx].SegmentHash), c.tmpDir)
	if err != nil {
		return nil, errors.Wrap(err, "download file in box error")
	}
	data, err := os.ReadFile(spath)
	if err != nil {
		return nil, errors.Wrap(err, "download file in box error")
	}
	if len(boxMeta.Plates[sidx].Indexs) > didx+1 {
		data = data[boxMeta.Plates[sidx].Indexs[didx]:boxMeta.Plates[sidx].Indexs[didx+1]]
	} else if len(boxMeta.Plates[sidx].Indexs) == didx+1 {
		data = data[boxMeta.Plates[sidx].Indexs[didx]:]
	}
	return data, nil
}

func (c *Client) UploadFileToGateway(url, territory, bucket, fpath, cipher string) (string, error) {
	hash := sha256.New()
	hash.Write([]byte(fpath))
	chunksDir := filepath.Join(c.tmpDir, hex.EncodeToString(hash.Sum(nil)))
	if err := os.Mkdir(chunksDir, 0755); err != nil {
		return "", errors.Wrap(err, "upload file to gateway error")
	}
	size, num, err := process.SplitFileWithstandardSize(fpath, chunksDir)
	if err != nil {
		return "", errors.Wrap(err, "upload file to gateway error")
	}
	_, name := filepath.Split(fpath)
	tx, err := process.UploadFileChunks(url, c.Mnemonic, chunksDir, territory, bucket, name, cipher, num, size)
	if err != nil {
		return "", errors.Wrap(err, "upload file to gateway error")
	}
	err = os.RemoveAll(chunksDir)
	if err != nil {
		return "", errors.Wrap(err, "upload file to gateway error")
	}
	return tx, nil
}

func (c *Client) UploadDirToGateway(url, territory, bucket, fname, cipher, dir string) (string, []byte, error) {
	box, fpath, err := c.CreateAFileBox(fname, dir)
	if err != nil {
		return "", nil, errors.Wrap(err, "upload dir to gateway error")
	}
	chunksDir := filepath.Join(c.tmpDir, fname)
	err = os.MkdirAll(chunksDir, 0755)
	if err != nil {
		return "", nil, errors.Wrap(err, "upload dir to gateway error")
	}
	size, num, err := process.SplitFileWithstandardSize(fpath, chunksDir)
	if err != nil {
		return "", nil, errors.Wrap(err, "upload dir to gateway error")
	}
	tx, err := process.UploadFileChunks(url, c.Mnemonic, chunksDir, territory, bucket, fname, cipher, num, size)
	if err != nil {
		return "", nil, errors.Wrap(err, "upload dir to gateway error")
	}
	jbytes, err := json.Marshal(box)
	if err != nil {
		return "", nil, errors.Wrap(err, "upload dir to gateway error")
	}
	return tx, jbytes, nil
}

func (c Client) DownloadFileInBoxFromGateway(url, fhash, elemFileName string, boxMeta FileBox) ([]byte, error) {
	sidx, didx := -1, 0
	for i := 0; i < len(boxMeta.Plates); i++ {
		for j, file := range boxMeta.Plates[i].Files {
			if file == elemFileName {
				sidx, didx = i, j
				break
			}
		}
	}
	if sidx == -1 {
		err := errors.New("data not found from box metadata")
		return nil, errors.Wrap(err, "download file in box from gateway error")
	}
	fmeta, err := c.QueryFile(fhash, -1)
	if err != nil {
		return nil, errors.Wrap(err, "download file in box from gateway error")
	}

	if len(fmeta.SegmentList) != len(boxMeta.Plates) {
		err = errors.New("the number of segments in box metadata is inconsistent")
		return nil, errors.Wrap(err, "download file in box from gateway error")
	}
	fpath := filepath.Join(c.tmpDir, string(fmeta.SegmentList[sidx].Hash[:]))
	if f, err := os.Stat(fpath); err == nil && f.IsDir() {
		err = os.RemoveAll(fpath)
		if err != nil {
			return nil, errors.Wrap(err, "download file in box from gateway error")
		}
	}
	err = c.DownloadFileFromGateway(url, fpath, string(fmeta.SegmentList[sidx].Hash[:]))
	if err != nil {
		return nil, errors.Wrap(err, "download file in box error")
	}
	data, err := os.ReadFile(fpath)
	if err != nil {
		return nil, errors.Wrap(err, "download file in box error")
	}
	if len(boxMeta.Plates[sidx].Indexs) > didx+1 {
		data = data[boxMeta.Plates[sidx].Indexs[didx]:boxMeta.Plates[sidx].Indexs[didx+1]]
	} else if len(boxMeta.Plates[sidx].Indexs) == didx+1 {
		data = data[boxMeta.Plates[sidx].Indexs[didx]:]
	}
	return data, nil
}

func (c *Client) DownloadFileFromGateway(url, fpath, fhash string) error {
	err := process.RetrieveFile(url, fhash, c.Mnemonic, fpath)
	if err != nil {
		return errors.Wrap(err, "download file from gateway error")
	}
	return nil
}

func (c *Client) QuerySegmentFromCachers(fileHash, segmentHash string, cacherNum, threadNum int) (map[peer.ID]types.CacheResponse, error) {
	cachedPeers := make(map[peer.ID]types.CacheResponse)
	peerNum := c.Cachers.GetPeersNumber()
	if cacherNum > peerNum {
		cacherNum = peerNum
	}
	if cacherNum <= 0 {
		return nil, errors.New("cache node not found")
	}
	if cacherNum < threadNum {
		threadNum = peerNum
	}
	itor, err := c.Cachers.NewPeersIterator(cacherNum)
	if err != nil {
		return nil, err
	}
	pubkey := crypto.CompressPubkey(&c.ethAccSk.PublicKey)
	wg := sync.WaitGroup{}
	lock := sync.Mutex{}
	wg.Add(threadNum)
	for i := 0; i < threadNum; i++ {
		go func() {
			defer wg.Done()
			for {
				lock.Lock()
				peer, ok := itor.GetPeer()
				lock.Unlock()
				if !ok {
					return
				}
				resp, err := cdnlib.QueryFileInfoFromCache(
					c.CacheCli.Host, peer.ID,
					types.CacheRequest{
						AccountId: pubkey,
						WantFile:  path.Join(fileHash, segmentHash),
					},
				)
				if err != nil {
					c.Cachers.Feedback(peer.ID.String(), false)
					continue
				}
				c.Cachers.Feedback(peer.ID.String(), true)
				if resp.Status == types.STATUS_HIT {
					lock.Lock()
					cachedPeers[peer.ID] = resp
					lock.Unlock()
					c.osQueue <- resp //check and payment cache order
				}
				//TODO: about credit
			}
		}()
	}
	wg.Wait()
	return cachedPeers, nil
}

func (c *Client) DownloadSegmentFromCachers(fileHash, segmentHash, fdir string, cachedPeer map[peer.ID]types.CacheResponse) []string {
	cachedFragments := map[string]struct{}{}
	res := make([]string, 0)
	dl, dld := 0, 0
	lock := sync.Mutex{}
	pubkey := crypto.CompressPubkey(&c.ethAccSk.PublicKey)
	wg := sync.WaitGroup{}
	wg.Add(len(cachedPeer))
	for id, resp := range cachedPeer {
		go func(id peer.ID, fragments []string, acc []byte) {
			defer wg.Done()
			for {
				lock.Lock()
				if dld >= config.DataShards {
					lock.Unlock()
					return
				}
				if dl < config.DataShards {
					dl += 1
					lock.Unlock()
				} else {
					lock.Unlock()
					continue
				}
				for _, fragment := range fragments {
					lock.Lock()
					if dld >= config.DataShards {
						lock.Unlock()
						return
					}
					if _, ok := cachedFragments[fragment]; ok {
						lock.Unlock()
						continue
					} else {
						cachedFragments[fragment] = struct{}{}
						lock.Unlock()
					}
					fpath := filepath.Join(fdir, fragment)
					if err := cdnlib.DownloadFileFromCache(
						c.CacheCli.Host, id, fpath,
						types.CacheRequest{
							AccountId: pubkey,
							WantFile:  path.Join(fileHash, segmentHash, fragment),
						},
					); err != nil {
						lock.Lock()
						dl -= 1
						delete(cachedFragments, fragment)
						lock.Unlock()
					}
					lock.Lock()
					dld += 1
					res = append(res, fpath)
					lock.Unlock()
					c.creditMg.AddCreditPoint(common.BytesToAddress(acc).Hex(), types.FragmentSize)
				}
			}
		}(id, resp.CachedFiles, resp.Info.Account)
	}
	wg.Wait()
	return res
}

func (c *Client) DeleteFile(fhash string) (string, error) {
	res, err := c.ChainClient.DeleteFile(c.ChainClient.GetSignatureAccPulickey(), fhash)
	if err != nil {
		return res, errors.Wrap(err, "delete files error")
	}
	return res, nil
}

func (c *Client) PreprocessFileAndPutIntoUploadQueue(fpath, cipher, territory, bucket string, callback func(UploadStats)) (UploadStats, error) {
	var status UploadStats
	f, err := os.Stat(fpath)
	if err != nil || f.IsDir() || f.Size() <= 0 {
		return status, errors.Wrap(err, "preprocess file error")
	}

	segmentInfo, rootHash, err := process.FullProcessing(fpath, cipher, c.tmpDir)
	if err != nil {
		return status, errors.Wrap(err, "preprocess file error")
	}
	fmeta, err := c.QueryFile(rootHash, -1)
	deduplication := false
	if err == nil {
		for _, v := range fmeta.Owner {
			if CompareSlice(v.User[:], c.ChainClient.GetSignatureAccPulickey()) {
				return status, nil
			}
		}
		deduplication = true
	}

	if _, err = c.PlaceStorageOrder(
		rootHash, f.Name(), bucket, territory,
		segmentInfo, c.ChainClient.GetSignatureAccPulickey(),
		uint64(f.Size())); err != nil {
		return status, errors.Wrap(err, "preprocess file error")
	}
	if deduplication {
		return status, nil
	}
	//upload file
	status = UploadStats{
		FileHash:    rootHash,
		FilePath:    fpath,
		SegmentInfo: segmentInfo,
		CallBack:    callback,
	}
	status.Group = make([]UploadGroup, config.ParShards+config.DataShards)
	c.uploadQueue <- status
	return status, nil
}

func (c *Client) QueryFileSates(fhash string) (string, error) {
	order, err := c.QueryDealMap(fhash, -1)
	if err != nil {
		return "", errors.Wrap(err, "query file states error")
	}
	data := map[string]any{"OrderInfo": order}
	meta, err := c.QueryFile(fhash, -1)
	if err == nil {
		data["FileMetadata"] = meta
	}
	jbytes, err := json.Marshal(data)
	if err != nil {
		return "", errors.Wrap(err, "query file states error")
	}
	return string(jbytes), nil
}

func (c *Client) UploadServer(ctx context.Context) {
	var task UploadStats
	for {
		select {
		case <-ctx.Done():
			return
		case task = <-c.uploadQueue:
			if task.FileHash == "" {
				return
			}
		}
		_, err := c.QueryFile(task.FileHash, -1)
		if err == nil {
			ClearTmpFile(task)
			if task.CallBack != nil {
				task.CallBack(task)
			}
			continue
		}
		sucCount := 0
		savedPeers := make(map[string]struct{})
		for _, g := range task.Group {
			if g.Saved && g.PeerID != "" {
				savedPeers[g.PeerID] = struct{}{}
			}
		}
		order, err := c.QueryDealMap(task.FileHash, -1)
		if err != nil {
			c.uploadQueue <- task
			continue
		}
		itor, err := c.Storages.NewPeersIterator(config.DataShards + config.ParShards)
		if err != nil {
			c.uploadQueue <- task
			time.Sleep(time.Minute)
			continue
		}
		for i := 0; i < len(task.Group); i++ {
			for j := 0; j < len(order.CompleteList); j++ {
				if int(order.CompleteList[j].Index) == i && !task.Group[i].OnChain {
					task.Group[i].Saved = true
					task.Group[i].OnChain = true
					task.Group[i].FlushTime = time.Now()
					task.Group[i].MinerID = string(order.CompleteList[j].Miner[:])
				}
			}
			if task.Group[i].OnChain {
				sucCount++
				continue
			}
			if task.Group[i].Saved && time.Since(task.Group[i].FlushTime) < DEFAULT_TASK_INTERVAL {
				continue
			}
			for peer, ok := itor.GetPeer(); ok; peer, ok = itor.GetPeer() {
				if _, ok := savedPeers[peer.ID.String()]; ok {
					continue
				}
				err = c.StorageCli.Connect(context.Background(), peer)
				if err != nil {
					c.Storages.Feedback(peer.ID.String(), false)
					continue
				}
				uploaded := true
				for j := 0; j < len(task.SegmentInfo); j++ {
					hashs := strings.Split(task.SegmentInfo[j].FragmentHash[i], "/")
					if len(hashs) != 3 {
						continue
					}
					err = c.StorageCli.WriteDataAction(context.Background(), peer.ID, task.SegmentInfo[j].FragmentHash[i], task.FileHash, hashs[2])
					if err != nil {
						uploaded = false
						time.Sleep(6 * 3)
						break
					}
				}
				if !uploaded {
					c.Storages.Feedback(peer.ID.String(), false)
					continue
				}
				task.Group[i].Saved = true
				task.Group[i].PeerID = peer.ID.String()
				task.Group[i].FlushTime = time.Now()
				break
			}

		}
		if sucCount < config.DataShards+config.ParShards {
			c.uploadQueue <- task
			continue
		}
		ClearTmpFile(task)
		if task.CallBack != nil {
			task.CallBack(task)
		}
	}
}

func (c *Client) CreateAFileBox(fname, dir string) (FileBox, string, error) {
	var box FileBox

	entries, err := os.ReadDir(dir)
	if err != nil {
		return box, "", errors.Wrap(err, "create a file box error")
	}
	fpath := filepath.Join(dir, fname)
	f, err := os.Create(fpath)
	if err != nil {
		return box, "", errors.Wrap(err, "create a file box error")
	}
	defer f.Close()
	writeData := func(bytes []byte) error {
		n, err := f.Write(bytes)
		if err != nil {
			return err
		}
		if n != len(bytes) {
			err = fmt.Errorf("written data is inconsistent, expected %d, actual %d", len(bytes), n)
			return err
		}
		return nil
	}
	var size, totalSize int64
	var plate FilePlate
	for _, entry := range entries {
		if entry.IsDir() {
			continue
		}
		info, err := entry.Info()
		if err != nil || info.Size() <= 0 {
			continue
		}
		if size == config.FragmentSize || info.Size()+size > config.FragmentSize {
			paddingSize := config.FragmentSize - size
			if paddingSize > 0 {
				if err = writeData(make([]byte, paddingSize)); err != nil {
					return box, "", errors.Wrap(err, "create a file box error")
				}
				plate.Indexs = append(plate.Indexs, int(size))
				box.PaddingSize += paddingSize
			}
			box.Plates = append(box.Plates, plate)
			plate = FilePlate{}
			size = 0
		}

		plate.Indexs = append(plate.Indexs, int(size))
		plate.Files = append(plate.Files, info.Name())
		size += info.Size()
		totalSize += info.Size()

		bytes, err := os.ReadFile(filepath.Join(dir, info.Name()))
		if err != nil {
			return box, "", errors.Wrap(err, "create a file box error")
		}
		if err = writeData(bytes); err != nil {
			return box, "", errors.Wrap(err, "create a file box error")
		}
	}

	if err = f.Sync(); err != nil {
		return box, "", errors.Wrap(err, "create a file box error")
	}

	box.TotalSize = totalSize + size + box.PaddingSize
	plateNum := len(box.Plates)
	box.Plates[plateNum-1].Files = append(box.Plates[plateNum-1].Files, "")
	box.Plates[plateNum-1].Indexs = append(box.Plates[plateNum-1].Indexs, int(size))
	return box, fpath, nil
}

func DataInList(data string, list []string) bool {
	for _, elem := range list {
		if strings.Contains(elem, data) {
			return true
		}
	}
	return false
}

func CompareSlice(s1, s2 []byte) bool {
	if len(s1) != len(s2) {
		return false
	}
	for i := 0; i < len(s1); i++ {
		if s1[i] != s2[i] {
			return false
		}
	}
	return true
}

func ClearTmpFile(task UploadStats) {
	for _, segment := range task.SegmentInfo {
		if len(segment.FragmentHash[0]) <= 0 {
			continue
		}
		dir := filepath.Dir(segment.FragmentHash[0])
		if _, err := os.Stat(dir); err == nil {
			os.RemoveAll(dir)
		}
	}
}
