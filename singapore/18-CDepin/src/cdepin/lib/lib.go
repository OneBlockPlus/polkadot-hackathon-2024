package cdnlib

import (
	"bufio"
	"bytes"
	"context"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"io"
	"log"
	"os"
	"path/filepath"

	"cdepin/lib/p2p"
	"cdepin/lib/types"

	"github.com/CESSProject/cess-go-sdk/chain"
	"github.com/CESSProject/cess-go-sdk/config"
	"github.com/CESSProject/cess-go-sdk/core/crypte"
	"github.com/CESSProject/cess-go-sdk/core/erasure"
	"github.com/CESSProject/p2p-go/core"
	"github.com/libp2p/go-libp2p/core/host"
	"github.com/libp2p/go-libp2p/core/peer"
	"github.com/pkg/errors"
)

func DailCacheNode(h host.Host, peerId peer.ID) (types.CacheResponse, error) {
	var resp types.CacheResponse
	buf := bytes.NewBuffer([]byte{})
	req := types.CacheRequest{
		Option: types.OPTION_DAIL,
	}
	err := SendRequestToCacher(h, peerId, req, buf)
	if err != nil {
		return resp, errors.Wrap(err, "dail cache node error")
	}
	if buf.Len() == 0 {
		err = errors.New("empty response")
		return resp, errors.Wrap(err, "dail cache node error")
	}
	err = json.Unmarshal(buf.Bytes(), &resp)
	if err != nil {
		return resp, errors.Wrap(err, "dail cache node error")
	}
	return resp, nil
}

func QueryFileInfoFromCache(h host.Host, peerId peer.ID, req types.CacheRequest) (types.CacheResponse, error) {
	var (
		resp  types.Response
		cresp struct {
			Status string              `json:"status"`
			Data   types.CacheResponse `json:"data"`
		}
	)

	buf := bytes.NewBuffer([]byte{})
	req.Option = types.OPTION_QUERY
	err := SendRequestToCacher(h, peerId, req, buf)
	if err != nil {
		return cresp.Data, errors.Wrap(err, "query file info error")
	}
	if buf.Len() == 0 {
		err = errors.New("empty response")
		return cresp.Data, errors.Wrap(err, "query file info error")
	}
	err = json.Unmarshal(buf.Bytes(), &resp)
	if err != nil {
		return cresp.Data, errors.Wrap(err, "query file info error")
	}

	if estr, ok := resp.Data.(string); ok {
		return cresp.Data, errors.Wrap(errors.New(estr), "query file info error")
	}

	err = json.Unmarshal(buf.Bytes(), &cresp)
	if err != nil {
		return cresp.Data, errors.Wrap(err, "query file info error")
	}

	return cresp.Data, nil
}

func DownloadFileFromCache(h host.Host, peerId peer.ID, fpath string, req types.CacheRequest) error {
	buf := bytes.NewBuffer([]byte{})
	req.Option = types.OPTION_DOWNLOAD
	err := SendRequestToCacher(h, peerId, req, buf)
	if err != nil {
		return errors.Wrap(err, "download file error")
	}
	fLen := buf.Len()
	if fLen == 0 {
		err = errors.New("empty response")
		return errors.Wrap(err, "download file error")
	}
	f, err := os.Create(fpath)
	if err != nil {
		return errors.Wrap(err, "download file error")
	}
	defer f.Close()
	err = WriteData(f, buf)
	if err != nil {
		return errors.Wrap(err, "download file error")
	}
	return nil
}

func DownloadFragmentFromStorage(fpath, fileHash, segmentHash, fragmentHash string, chainCli *chain.ChainClient, peerNode *core.PeerNode) error {
	fmeta, err := chainCli.QueryFile(fileHash, -1)
	if err != nil {
		return errors.Wrap(err, "download fragment from storage error")
	}
	for _, segment := range fmeta.SegmentList {
		if string(segment.Hash[:]) != segmentHash {
			continue
		}
		for _, fragment := range segment.FragmentList {
			if string(fragment.Hash[:]) != fragmentHash {
				continue
			}
			miner, err := chainCli.QueryMinerItems(fragment.Miner[:], -1)
			if err != nil {
				return errors.Wrap(err, "download fragment from storage error")
			}
			_, err = peerNode.ReadDataAction(context.Background(), peer.ID(miner.PeerId[:]), segmentHash, fpath)
			if err != nil {
				return errors.Wrap(err, "download fragment from storage error")
			}
			break
		}
	}
	return nil
}

func DownloadSegmentFromStorage(fdir, fileHash, segmentHash string, chainCli *chain.ChainClient, peerNode *core.PeerNode) (string, error) {

	segmentPath := filepath.Join(fdir, segmentHash)
	fmeta, err := chainCli.QueryFile(fileHash, -1)
	if err != nil {
		return segmentPath, errors.Wrap(err, "download fragment from storage error")
	}
	count := 0
	paths := make([]string, 0)
	for _, segment := range fmeta.SegmentList {
		if string(segment.Hash[:]) != segmentHash {
			continue
		}
		for _, fragment := range segment.FragmentList {
			if count >= config.DataShards {
				break
			}
			miner, err := chainCli.QueryMinerItems(fragment.Miner[:], -1)
			if err != nil {
				continue
			}
			fragmentPath := filepath.Join(fdir, string(fragment.Hash[:]))
			if _, err = peerNode.ReadDataAction(
				context.Background(),
				peer.ID(miner.PeerId[:]), string(fragment.Hash[:]),
				fragmentPath,
			); err != nil {
				continue
			}
			count++
			paths = append(paths, fragmentPath)
		}
	}
	if count < config.DataShards {
		err := errors.New("not enough fragments were downloaded")
		return segmentPath, errors.Wrap(err, "download segment from storage error")
	}
	err = erasure.RSRestore(segmentPath, paths)
	if err != nil {
		return segmentPath, errors.Wrap(err, "download segment from storage error")
	}
	for _, p := range paths {
		os.Remove(p)
	}
	return segmentPath, nil
}

func DownloadFileFromStorage(fdir, fileHash, cipher string, chainCli *chain.ChainClient, peerNode *core.PeerNode) (string, error) {

	if _, err := os.Stat(fdir); err != nil {
		return "", errors.Wrap(err, "download file from storage error")
	}
	userfile := filepath.Join(fdir, fileHash)
	f, err := os.Create(userfile)
	if err != nil {
		return "", errors.Wrap(err, "download file from storage error")
	}
	defer f.Close()

	fmeta, err := chainCli.QueryFile(fileHash, -1)
	if err != nil {
		return "", errors.Wrap(err, "download file from storage error")
	}

	defer func(basedir string) {
		for _, segment := range fmeta.SegmentList {
			os.Remove(filepath.Join(basedir, string(segment.Hash[:])))
			for _, fragment := range segment.FragmentList {
				os.Remove(filepath.Join(basedir, string(fragment.Hash[:])))
			}
		}
	}(fdir)

	segmentspath := make([]string, 0)
	for _, segment := range fmeta.SegmentList {
		fragmentpaths := make([]string, 0)
		for _, fragment := range segment.FragmentList {
			miner, err := chainCli.QueryMinerItems(fragment.Miner[:], -1)
			if err != nil {
				return "", errors.Wrap(err, "download file from storage error")
			}

			fragmentpath := filepath.Join(fdir, string(fragment.Hash[:]))

			if _, err = peerNode.ReadDataAction(
				context.Background(),
				peer.ID(miner.PeerId[:]),
				string(fragment.Hash[:]),
				fragmentpath); err != nil {
				continue
			}
			fragmentpaths = append(fragmentpaths, fragmentpath)
			segmentpath := filepath.Join(fdir, string(segment.Hash[:]))
			if len(fragmentpaths) >= config.DataShards {
				err = erasure.RSRestore(segmentpath, fragmentpaths)
				if err != nil {
					return "", err
				}
				segmentspath = append(segmentspath, segmentpath)
				break
			}
		}
	}

	if len(segmentspath) != len(fmeta.SegmentList) {
		err = errors.New("the number of downloaded segments is inconsistent")
		return "", errors.Wrap(err, "download file from storage error")
	}

	err = RecoveryFileViaSegments(segmentspath, fmeta, cipher, f)
	if err != nil {
		return "", errors.Wrap(err, "download file from storage error")
	}
	return userfile, nil
}

func SendRequestToCacher(handle host.Host, peerId peer.ID, req types.CacheRequest, resp io.Writer) error {
	extData, err := json.Marshal(req)
	if err != nil {
		return errors.Wrap(err, "send request to cacher error")
	}
	s, err := handle.NewStream(context.Background(), peerId, p2p.CdnCacheProtocol)
	if err != nil {
		return errors.Wrap(err, "send request to cacher error")
	}
	defer s.Close()
	if _, err = s.Write(extData); err != nil {
		s.Reset()
		return errors.Wrap(err, "send request to cacher error")
	}
	log.Println("send data", string(extData))
	rn, err := io.Copy(resp, s)
	if err != nil {
		s.Reset()
		return errors.Wrap(err, "send request to cacher error")
	}
	log.Println("send bytes ", rn)
	if rn == 0 {
		s.Reset()
		return errors.Wrap(errors.New("empty response"), "send request to cacher error")
	}
	return nil
}

func RecoveryFileViaSegments(segmentspath []string, fmeta chain.FileMetadata, cipher string, writer io.Writer) error {
	var writecount = 0
	for i := 0; i < len(fmeta.SegmentList); i++ {
		for j := 0; j < len(segmentspath); j++ {
			if string(fmeta.SegmentList[i].Hash[:]) == filepath.Base(segmentspath[j]) {
				buf, err := os.ReadFile(segmentspath[j])
				if err != nil {
					return errors.Wrap(err, "file recovery via segments failed")
				}
				if cipher != "" {
					buf, err = crypte.AesCbcDecrypt(buf, []byte(cipher))
					if err != nil {
						return errors.Wrap(err, "file recovery via segments failed")
					}
				}
				if (writecount + 1) >= len(fmeta.SegmentList) {
					if cipher != "" {
						writer.Write(buf[:(fmeta.FileSize.Uint64() - uint64(writecount*(config.SegmentSize-16)))])
					} else {
						writer.Write(buf[:(fmeta.FileSize.Uint64() - uint64(writecount*config.SegmentSize))])
					}
				} else {
					writer.Write(buf)
				}
				writecount++
				break
			}
		}
	}
	if writecount != len(fmeta.SegmentList) {
		err := errors.New("the number of processed segments is inconsistent")
		return errors.Wrap(err, "file recovery via segments failed")
	}
	return nil
}

func GetSha256Hash(data []byte) string {
	h := sha256.New()
	h.Write(data)
	return hex.EncodeToString(h.Sum(nil))
}

func ReadData(r io.Reader) ([]byte, error) {
	var res []byte
	buf := make([]byte, 1024)
	reader := bufio.NewReader(r)
	for {
		n, err := reader.Read(buf)
		if err != nil {
			return nil, err
		}
		res = append(res, buf[:n]...)
		if n < 1024 {
			break
		}
	}
	return res, nil
}

func WriteData(w io.Writer, r io.Reader) error {
	buf := make([]byte, 1024)
	reader := bufio.NewReader(r)
	for {
		n, err := reader.Read(buf)
		if err != nil {
			return err
		}
		_, err = w.Write(buf[:n])
		if err != nil {
			return err
		}
		if n < 1024 {
			break
		}
	}
	return nil
}
