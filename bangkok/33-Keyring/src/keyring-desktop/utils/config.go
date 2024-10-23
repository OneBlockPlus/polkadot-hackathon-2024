package utils

import (
	"encoding/json"
	"errors"
	"keyring-desktop/crosschain"
	"os"
)

type AppConfig struct {
	ShowTestnet bool `json:"showTestnet"`
}

func ReadAppConfig() (*AppConfig, error) {
	configPath, err := AppConfigPath()
	if err != nil {
		return nil, err
	}

	file, err := os.Open(configPath)
	if err != nil {
		if os.IsNotExist(err) {
			defaultConfig := AppConfig{
				ShowTestnet: false,
			}
			err := WriteAppConfig(defaultConfig)
			if err != nil {
				return nil, err
			}
			return &defaultConfig, nil
		}
		return nil, err
	}
	defer file.Close()

	var config AppConfig
	decoder := json.NewDecoder(file)
	err = decoder.Decode(&config)
	if err != nil {
		return nil, err
	}

	return &config, nil
}

func WriteAppConfig(config AppConfig) error {
	filePath, err := AppConfigPath()
	if err != nil {
		return err
	}
	file, err := os.Create(filePath)
	if err != nil {
		return err
	}
	defer file.Close()

	encoder := json.NewEncoder(file)
	err = encoder.Encode(config)
	if err != nil {
		return err
	}

	return nil
}

type InitConfig struct {
	WalletConnectProjectId string `json:"walletConnectProjectId"`
}

type ChainConfig struct {
	Name                string        `json:"name"`
	Symbol              string        `json:"symbol"`
	Img                 string        `json:"img"`
	Path                string        `json:"path"`
	PriceId             string        `json:"priceId"`
	Driver              string        `json:"driver"`
	RpcUrl              string        `json:"rpcUrl"`
	RpcAuth             string        `json:"rpcAuth"`
	RpcProvider         string        `json:"rpcProvider"`
	ChainId             int64         `json:"chainId"`
	AddressPrefix       int64         `json:"addressPrefix"`
	Explorer            string        `json:"explorer"`
	ExplorerTx          string        `json:"explorerTx"`
	ExplorerAddr        string        `json:"explorerAddr"`
	Decimals            int32         `json:"decimals"`
	GasLimit            uint64        `json:"gasLimit"`
	TokenGasLimit       uint64        `json:"tokenGasLimit"`
	MaxFee              string        `json:"maxFee"`
	Testnet             bool          `json:"testnet"`
	Disable             bool          `json:"disable"`
	EnableWalletConnect bool          `json:"enableWalletConnect"`
	TxHistoryUrl        string        `json:"txHistoryUrl"`
	TxHistoryAuth       string        `json:"txHistoryAuth"`
	TxHistoryProvider   string        `json:"txHistoryProvider"`
	Tokens              []TokenConfig `json:"tokens"`
}

type TokenConfig struct {
	Symbol   string `json:"symbol"`
	Img      string `json:"img"`
	PriceId  string `json:"priceId"`
	Decimals uint8  `json:"decimals"`
	Contract string `json:"contract"`
}

func ReadInitConfig(config []byte) (*InitConfig, error) {

	var initConfig InitConfig
	err := json.Unmarshal(config, &initConfig)
	if err != nil {
		Sugar.Error(err)
		return nil, errors.New("failed to parse configuration")
	}

	if initConfig.WalletConnectProjectId == "env:WALLET_CONNECT_PROJECT_ID" {
		initConfig.WalletConnectProjectId = os.Getenv("WALLET_CONNECT_PROJECT_ID")
		return &initConfig, nil
	}

	return &initConfig, nil
}

func ReadChainConfigs(bytes []byte) []ChainConfig {
	var chainConfigs []ChainConfig
	err := json.Unmarshal(bytes, &chainConfigs)
	if err != nil {
		Sugar.Fatal(err)
	}

	infuraApiToken := os.Getenv("INFURA_API_TOKEN")
	lbryRpcSecret := os.Getenv("LBRY_RPC_SECRET")
	if infuraApiToken != "" || lbryRpcSecret != "" {
		for i, c := range chainConfigs {
			if c.RpcAuth == "env:INFURA_API_TOKEN" {
				c.RpcAuth = infuraApiToken
			} else if c.RpcAuth == "env:LBRY_RPC_SECRET" {
				c.RpcAuth = lbryRpcSecret
			}
			chainConfigs[i] = c
		}
	}

	return chainConfigs
}

func GetChainConfig(config []ChainConfig, chainName string) *ChainConfig {
	var chainConfig *ChainConfig
	for _, c := range config {
		if c.Name == chainName {
			chainConfig = &c
			break
		}
	}

	return chainConfig
}

func GetTokenConfig(configs []TokenConfig, contract string) *TokenConfig {
	var tokenConfig *TokenConfig
	for _, c := range configs {
		if c.Contract == contract {
			tokenConfig = &c
			break
		}
	}

	return tokenConfig
}

func ConvertAssetConfig(chainConfig *ChainConfig, contract string, chainName string, allowEmptyConfig bool) (crosschain.ITask, error) {
	var net = "mainnet"
	if chainConfig.Testnet {
		net = "testnet"
	}

	nativeConfig := crosschain.NativeAssetConfig{
		GasLimit:      chainConfig.GasLimit,
		TokenGasLimit: chainConfig.TokenGasLimit,

		NativeAsset:   crosschain.NativeAsset(chainConfig.Symbol),
		Asset:         chainConfig.Symbol,
		Driver:        chainConfig.Driver,
		URL:           chainConfig.RpcUrl,
		Auth:          chainConfig.RpcAuth,
		Provider:      chainConfig.RpcProvider,
		ExplorerURL:   chainConfig.Explorer,
		Decimals:      chainConfig.Decimals,
		MaxFee:        chainConfig.MaxFee,
		Net:           net,
		ChainID:       chainConfig.ChainId,
		AddressPrefix: chainConfig.AddressPrefix,
		Type:          crosschain.AssetTypeNative,
	}

	if contract == "" {
		return &nativeConfig, nil
	}

	tokenConfig := GetTokenConfig(chainConfig.Tokens, contract)

	if tokenConfig == nil {
		if !allowEmptyConfig {
			return nil, errors.New("token not found")

		}
		tokenConfig = &TokenConfig{
			Contract: contract,
		}
	}

	tokenAsset := crosschain.AssetConfig{
		Asset:         tokenConfig.Symbol,
		Driver:        chainConfig.Driver,
		URL:           chainConfig.RpcUrl,
		Auth:          chainConfig.RpcAuth,
		Provider:      chainConfig.RpcProvider,
		ExplorerURL:   chainConfig.Explorer,
		Decimals:      int32(tokenConfig.Decimals),
		MaxFee:        chainConfig.MaxFee,
		ChainID:       chainConfig.ChainId,
		AddressPrefix: chainConfig.AddressPrefix,
		Type:          crosschain.AssetTypeToken,
		Contract:      tokenConfig.Contract,
	}

	res := crosschain.TokenAssetConfig{
		Asset:             tokenConfig.Symbol,
		Chain:             chainName,
		Decimals:          int32(tokenConfig.Decimals),
		Contract:          tokenConfig.Contract,
		Type:              crosschain.AssetTypeToken,
		AssetConfig:       tokenAsset,
		NativeAssetConfig: &nativeConfig,
	}

	return &res, nil
}
