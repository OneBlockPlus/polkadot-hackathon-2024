package config

import (
	"os"
	"path/filepath"

	"github.com/pkg/errors"
	"github.com/spf13/viper"
)

const (
	DEFAULT_CONFIG_PATH    = "./config.yaml"
	TESTNET_PROTO_PREFIX   = "/testnet"
	MAINNET_PROTO_PREFIX   = "/mainnet"
	DEVNET_PROTO_PREFIX    = "/devnet"
	DEFAULT_CACHE_PATH     = "./cache/"
	DEFAULT_WORKSPACE      = "./cdn_node/"
	DEFAULT_P2P_WORKSPACE  = "./cdn_node/cache_p2p"
	DEFAULT_CACHE_PRICE    = "10000000000000000"
	DEFAULT_GAS_FREE_CAP   = 108694000460
	DEFAULT_GAS_LIMIT      = 30000000
	DEFAULT_DOWNLOAD_POINT = 4
	CACHE_BLOCK_SIZE       = 8 * 1024 * 1024
)

var (
	_default DefaultConfig
	TempDir  = "./cdn_node/temp/"
)

type DefaultConfig struct {
	ChainConfig
	ResrcP2P P2PConfig
	CacheP2P P2PConfig
	CacherConfig
	CdnProtoConfig
	NodeWorkSpace string
	ActorSvcPort  int
}

type ChainConfig struct {
	Rpc      []string
	Network  string
	Mnemonic string
}

type P2PConfig struct {
	Boots     []string
	P2PPort   int
	WorkSpace string
}

type CacherConfig struct {
	CachePrice    string
	CacheDir      string
	Expiration    int64
	CacheSize     int64
	FreeDownloads int
}

type CdnProtoConfig struct {
	ChainId           int64
	Staking           string
	GasFreeCap        int64
	GasLimit          uint64
	TokenContract     string
	ProtoContract     string
	NodeTokenId       string
	NodeAccPrivateKey string
	TokenAccAddress   string
	TokenAccSign      string
}

func GetConfig() DefaultConfig {
	return _default
}

func ParseDefaultConfig(fpath string) error {

	err := ParseCommonConfig(fpath, "yaml", &_default)
	if err != nil {
		return err
	}

	if _default.CacheSize <= 32*1024*1024*1024 {
		_default.CacheSize = 32 * 1024 * 1024 * 1024
	}
	if _default.Expiration <= 0 || _default.Expiration > 7*24*60 {
		_default.Expiration = 3 * 60
	}
	if _default.NodeWorkSpace == "" {
		_default.NodeWorkSpace = DEFAULT_CACHE_PATH

	} else {
		TempDir = filepath.Join(_default.NodeWorkSpace, "temp")
	}

	if _default.CacheDir == "" {
		_default.CacheDir = DEFAULT_CACHE_PATH
	}
	_default.CacheDir = filepath.Join(_default.NodeWorkSpace, _default.CacheDir)

	if _default.CacheP2P.WorkSpace == "" {
		_default.CacheP2P.WorkSpace = DEFAULT_P2P_WORKSPACE
	}
	_default.CacheP2P.WorkSpace = filepath.Join(_default.NodeWorkSpace, _default.CacheP2P.WorkSpace)

	if _default.ResrcP2P.WorkSpace == "" {
		_default.ResrcP2P.WorkSpace = "./resource_p2p"
	}
	_default.ResrcP2P.WorkSpace = filepath.Join(_default.NodeWorkSpace, _default.ResrcP2P.WorkSpace)

	if _default.CachePrice == "" {
		_default.CachePrice = DEFAULT_CACHE_PRICE
	}
	if _default.FreeDownloads == 0 {
		_default.FreeDownloads = DEFAULT_DOWNLOAD_POINT
	}

	if _default.ActorSvcPort == 0 {
		_default.ActorSvcPort = 8080
	}

	if _, err := os.Stat(_default.CacheDir); err != nil {
		err = os.MkdirAll(_default.CacheDir, 0755)
		if err != nil {
			return errors.Wrap(err, "parse default config file error")
		}
	}

	if _, err := os.Stat(_default.CacheP2P.WorkSpace); err != nil {
		err = os.MkdirAll(_default.CacheP2P.WorkSpace, 0755)
		if err != nil {
			return errors.Wrap(err, "parse default config file error")
		}
	}

	if _, err := os.Stat(_default.ResrcP2P.WorkSpace); err != nil {
		err = os.MkdirAll(_default.ResrcP2P.WorkSpace, 0755)
		if err != nil {
			return errors.Wrap(err, "parse default config file error")
		}
	}

	if _, err := os.Stat(TempDir); err != nil {
		err = os.MkdirAll(TempDir, 0755)
		if err != nil {
			return errors.Wrap(err, "parse default config file error")
		}
	}
	return nil
}

func ParseCommonConfig(fpath, ctype string, config interface{}) error {
	if fpath == "" {
		fpath = DEFAULT_CONFIG_PATH
	}
	viper.SetConfigFile(fpath)
	viper.SetConfigType(ctype)
	err := viper.ReadInConfig()
	if err != nil {
		return errors.Wrap(err, "parse config file error")
	}
	err = viper.Unmarshal(config)
	if err != nil {
		return errors.Wrap(err, "parse config file error")
	}
	return nil
}
