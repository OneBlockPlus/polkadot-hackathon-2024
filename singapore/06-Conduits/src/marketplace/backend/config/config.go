package config

import (
	"log"
	"os"

	"github.com/spf13/viper"
)

type AppConfig struct {
	Name      string           `mapstructure:"name"`
	Mode      string           `mapstructure:"mode"`
	Port      int              `mapstructure:"port"`
	Version   string           `mapstructure:"version"`
	Contracts *ContractsConfig `mapstructure:"contracts"`
	Postgres  *PostgresConfig  `mapstructure:"postgres"`
}

type ContractsConfig struct {
	BASE_SEPOLIA struct {
		RPC         string
		Marketplace *ContractConfig
		Application *ContractConfig
	}
}

type ContractConfig struct {
	Address       string `mapstructure:"address"`
	StartAt       int64  `mapstructure:"start_at"`
	QueryHistory  bool   `mapstructure:"query_history"`
	QueryInterval int64  `mapstructure:"query_interval"`
}

type PostgresConfig struct {
	Host         string `mapstructure:"host"`
	User         string `mapstructure:"user"`
	Password     string `mapstructure:"password"`
	DB           string `mapstructure:"dbname"`
	Schema       string `mapstructure:"schema"`
	Port         int    `mapstructure:"port"`
	MaxOpenConns int    `mapstructure:"max_open_conns"`
	MaxIdleConns int    `mapstructure:"max_idle_conns"`
}

var Config = new(AppConfig)

func Init() (err error) {
	if len(os.Args) < 2 {
		log.Fatalln("Please provide the path to the config file as a command line argument.")
		return
	}

	configFilePath := os.Args[1]

	viper.SetConfigFile(configFilePath)
	if err = viper.ReadInConfig(); err != nil {
		log.Panicf("Fatal error config file: %s\n", err)
	}

	if err = viper.Unmarshal(Config); err != nil {
		log.Fatalln("Viper unmarshal failed:", err)
	}

	return
}
