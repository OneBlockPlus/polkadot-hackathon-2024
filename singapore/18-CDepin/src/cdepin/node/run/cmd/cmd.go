package cmd

import (
	"context"
	"encoding/hex"
	"fmt"
	"log"
	"os"
	"os/signal"
	"path"
	"path/filepath"
	"syscall"
	"time"

	"cdepin/lib/config"
	"cdepin/lib/credit"
	"cdepin/lib/p2p"
	"cdepin/lib/protocol"
	"cdepin/lib/types"
	"cdepin/logger"
	"cdepin/node/actors"

	sdk "github.com/CESSProject/cess-go-sdk"
	"github.com/CESSProject/cess-go-tools/cacher"
	"github.com/CESSProject/cess-go-tools/scheduler"
	p2pgo "github.com/CESSProject/p2p-go"
	"github.com/CESSProject/p2p-go/out"
	"github.com/asynkron/protoactor-go/actor"
	"github.com/ethereum/go-ethereum/common"
	"github.com/libp2p/go-libp2p"
	"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
	Use:   types.CACHE_NAME,
	Short: "CDepin Node",
}

func Execute() {
	rootCmd.CompletionOptions.HiddenDefaultCmd = true
	err := rootCmd.Execute()
	if err != nil {
		os.Exit(1)
	}
}

func InitCmd() {
	rootCmd.AddCommand(
		cmd_run(),
		cmd_exit_network(),
	)
	rootCmd.PersistentFlags().StringP("config", "c", "", "custom profile")
}

func cmd_run() *cobra.Command {
	return &cobra.Command{
		Use:                   "run",
		Short:                 "Running services",
		DisableFlagsInUseLine: true,
		Run:                   cmd_run_func,
	}
}

func cmd_exit_network() *cobra.Command {
	return &cobra.Command{
		Use:                   "exit",
		Short:                 "exit node from  network and redeem staking",
		DisableFlagsInUseLine: true,
		Run:                   cmd_exit_func,
	}
}

func cmd_exit_func(cmd *cobra.Command, args []string) {
	cpath, _ := cmd.Flags().GetString("config")
	if cpath == "" {
		cpath, _ = cmd.Flags().GetString("c")
		if cpath == "" {
			logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Error("empty config file path")
			log.Println("empty config file path")
			return
		}
	}

	if err := config.ParseDefaultConfig(cpath); err != nil {
		log.Println("error", err)
		return
	}
	conf := config.GetConfig()
	cli, err := protocol.NewClient(
		protocol.AccountPrivateKey(conf.NodeAccPrivateKey),
		protocol.ChainID(conf.ChainId),
		protocol.ConnectionRpcAddresss(conf.Rpc),
		protocol.EthereumGas(conf.GasFreeCap, conf.GasLimit),
	)
	if err != nil {
		log.Fatal(err)
	}

	contract, err := protocol.NewProtoContract(
		cli.GetEthClient(),
		conf.ProtoContract,
		cli.Account.Hex(),
		cli.NewTransactionOption,
		cli.SubscribeFilterLogs,
	)
	if err != nil {
		log.Fatal("init ethereum contract client error", err)
	}
	err = contract.ExitNetwork(context.Background(), cli.Account)
	if err != nil {
		log.Fatal("exit network error", err)
	}
}

func cmd_run_func(cmd *cobra.Command, args []string) {
	cpath, _ := cmd.Flags().GetString("config")
	if cpath == "" {
		cpath, _ = cmd.Flags().GetString("c")
		if cpath == "" {
			logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Error("empty config file path")
			log.Println("empty config file path")
			return
		}
	}

	if err := config.ParseDefaultConfig(cpath); err != nil {
		logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Error("error", err)
		log.Println("error", err)
		return
	}

	ctx := context.Background()
	conf := config.GetConfig()
	actors.InitGlobalActorSystem(actor.NewActorSystem())

	chainSdk, err := sdk.New(
		ctx,
		sdk.ConnectRpcAddrs(conf.Rpc),
		sdk.Mnemonic(conf.Mnemonic),
		sdk.TransactionTimeout(time.Second*30),
	)
	if err != nil {
		logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Error("init chain client error", err)
		log.Println("init chain client error", err)
		return
	}

	for {
		syncSt, err := chainSdk.SystemSyncState()
		if err != nil {
			out.Err(err.Error())
			os.Exit(1)
		}
		if syncSt.CurrentBlock == syncSt.HighestBlock {
			out.Tip(fmt.Sprintf("Synchronization main chain completed: %d", syncSt.CurrentBlock))
			break
		}
		out.Tip(fmt.Sprintf("In the synchronization main chain: %d ...", syncSt.CurrentBlock))
		time.Sleep(time.Second * time.Duration(Ternary(int64(syncSt.HighestBlock-syncSt.CurrentBlock)*6, 30)))
	}
	log.Println("node p2p port", conf.CacheP2P.P2PPort)
	peerNode, err := p2pgo.New(
		ctx,
		p2pgo.ListenPort(conf.ResrcP2P.P2PPort),
		p2pgo.Workspace(conf.ResrcP2P.WorkSpace),
		p2pgo.BootPeers(conf.ResrcP2P.Boots),
		p2pgo.ProtocolPrefix("/testnet"),
	)

	if err != nil {
		logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Error("init P2P Node error", err)
		log.Println("init Client P2P Node error", err)
		return
	}
	defer peerNode.Close()

	key, err := p2p.Identification(path.Join(conf.CacheP2P.WorkSpace, ".key"))
	if err != nil {
		logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Error("init P2P Node error", err)
		log.Println("init p2p identification error", err)
		return
	}

	cachePeerNode, err := p2p.NewPeerNode(
		conf.Network, p2p.Version, conf.CacheP2P.Boots,
		libp2p.Identity(key),
		libp2p.ListenAddrStrings(fmt.Sprintf("/ip4/0.0.0.0/tcp/%d", conf.CacheP2P.P2PPort)),
	)
	if err != nil {
		logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Error("init P2P Node error", err)
		log.Println("init Server P2P Node error", err)
		return
	}
	defer cachePeerNode.Host.Close()

	if _, err = os.Stat(config.TempDir); err != nil {
		if err = os.Mkdir(config.TempDir, 0755); err != nil {
			logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Error("make temp dir error ", err)
			log.Println("make temp dir error", err)
			return
		}
	}

	cacheModule := cacher.NewCacher(
		time.Duration(conf.Expiration)*time.Minute,
		conf.CacheSize,
		conf.CacheDir,
	)
	selector, err := scheduler.NewNodeSelector(
		scheduler.PRIORITY_STRATEGY,
		"./node_list",
		64,
		int64(time.Millisecond*300),
		int64(time.Hour*6),
	)
	if err != nil {
		logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Error("init node selector error", err)
		log.Println("init node selector error", err)
		return
	}

	cli, err := protocol.NewClient(
		protocol.AccountPrivateKey(conf.NodeAccPrivateKey),
		protocol.ChainID(conf.ChainId),
		protocol.ConnectionRpcAddresss(conf.Rpc),
		protocol.EthereumGas(conf.GasFreeCap, conf.GasLimit),
	)
	if err != nil {
		logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Error("init ethereum client error", err)
		log.Println("init ethereum client error", err)
		return
	}

	contract, err := protocol.NewProtoContract(
		cli.GetEthClient(),
		conf.ProtoContract,
		cli.Account.Hex(),
		cli.NewTransactionOption,
		cli.SubscribeFilterLogs,
	)
	if err != nil {
		logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Error("init ethereum client error", err)
		log.Println("init ethereum client error", err)
		return
	}

	if info, err := contract.QueryRegisterInfo(cli.Account); err != nil {

		sign, err := hex.DecodeString(conf.TokenAccSign)
		if err != nil {
			logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Error("decode sign error", err)
			log.Println("decode sign error", err)
			return
		}
		if err = contract.RegisterNode(
			context.Background(),
			cli.Account,
			common.HexToAddress(conf.TokenAccAddress),
			peerNode.GetHost().ID().String(),
			conf.NodeTokenId,
			conf.Staking, sign,
		); err != nil {
			logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Error("register node on chain error", err)
			log.Println("register node on chain error", err)
			return
		}
	} else {
		logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Info("get registered node information:", info.String())
		log.Println("get registered node information:", info.String())
	}
	creditModule, err := credit.NewCreditManager(
		cli.Account.Hex(),
		filepath.Join(conf.NodeWorkSpace, "credit_record"),
		conf.CachePrice, 0, contract,
	)
	if err != nil {
		logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Error("init ethereum client error", err)
		log.Println("init ethereum client error", err)
		return
	}
	//new and run actors
	cacher := actors.NewCacher(cacheModule, creditModule)
	p2pTs := actors.NewP2pNodeActor(cachePeerNode)
	resrc := actors.NewResourceActor(
		cachePeerNode, peerNode, selector,
		chainSdk, actors.CacheStrategy{},
	)

	actorSys := actors.GetGlobalActorSystem()

	cacheProps := actor.PropsFromProducer(func() actor.Actor { return cacher })
	actorSys.RegisterActor(actors.CACHE_ACTOR, actorSys.Root.Spawn(cacheProps))

	p2pTsProps := actor.PropsFromProducer(func() actor.Actor { return p2pTs })
	actorSys.RegisterActor(actors.P2P_TS_ACTOR, actorSys.Root.Spawn(p2pTsProps))

	resrcProps := actor.PropsFromProducer(func() actor.Actor { return resrc })
	actorSys.RegisterActor(actors.RESOURCE_ACTOR, actorSys.Root.Spawn(resrcProps))

	// server cache service
	cachePeerNode.SetStreamHandler(p2p.CdnCacheProtocol, cacher.CacheService)
	// restore cache file records
	err = cacher.RestoreCacheFiles(conf.CacheDir)
	if err != nil {
		logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Error("restore cache file error", err)
		log.Println("restore cache file error", err)
		return
	}

	ctx, stop := context.WithCancel(ctx)
	go func() {
		signals := make(chan os.Signal, 1)
		signal.Notify(signals, os.Interrupt, syscall.SIGTERM)
		<-signals
		log.Println("get system cancel signal.")
		stop()
		log.Println("wait for service to stop ...")
	}()
	go func() {
		if len(conf.CacheP2P.Boots) <= 0 {
			stop()
			logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Error("empty boot node list.")
			log.Println("please configure boot node.")
			return
		}
		err = resrc.RunDiscovery(ctx, conf.CacheP2P.Boots[0])
		if err != nil {
			stop()
			logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Error("run discovery service error", err)
			log.Println("run discovery service error", err)
			return
		}
	}()
	go func() {
		err = contract.ClaimWorkRewardServer(ctx, cli.Account)
		if err != nil {
			logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Error("run claim work reward server error", err)
			log.Println("run claim work reward server error", err)
			stop()
			return
		}
	}()

	log.Println("cache node network profix", peerNode.ProtocolPrefix)
	logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Info("🚀  cache service is running ...")
	log.Println("🚀  cache service is running ...")

	cacher.RunDownloadServer(ctx, 0) //automatically allocate download threads

	logger.GetGlobalLogger().GetLogger(types.LOG_NODE).Info("🔚  cache service done.")
	log.Println("🔚  cache service done.")
}

func Ternary(a, b int64) int64 {
	if a > b {
		return b
	}
	return a
}
