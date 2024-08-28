package main

import (
	"dephy-conduits/config"
	"dephy-conduits/constants"
	"dephy-conduits/contracts"
	"dephy-conduits/dao"
	"dephy-conduits/listener"
	"dephy-conduits/router"
	"fmt"
	"log"
)

func main() {
	if err := config.Init(); err != nil {
		log.Fatalln("Init config failed, ", err)
		return
	}

	if err := contracts.Init(); err != nil {
		log.Fatalln("Init contract abi failed, ", err)
		return
	}

	if err := dao.Init(config.Config.Postgres); err != nil {
		log.Fatalln("Init postgres failed, ", err)
		return
	}

	listener.QueryMarketplaceEvents(constants.BASE_SEPOLIA)
	listener.QueryApplicationEvents(constants.BASE_SEPOLIA)

	go listener.MarketplaceListener(constants.BASE_SEPOLIA)
	go listener.ApplicationListener(constants.BASE_SEPOLIA)

	r := router.SetupRouter(config.Config.Mode)
	if err := r.Run(fmt.Sprintf(":%d", config.Config.Port)); err != nil {
		log.Fatalln("Run server failed, ", err)
		return
	}
}
