package main

import (
	"log"
	"os"

	"cdepin/logger"
	"cdepin/node/run/cmd"
)

func main() {
	logger := logger.InitGlobalLogger()
	os.Mkdir("logs", 0755)
	if _, err := logger.RegisterLogger("node", "logs/node.log", "json"); err != nil {
		log.Fatal("register logger error", err)
	}
	if _, err := logger.RegisterLogger("transaction", "logs/transaction.log", "json"); err != nil {
		log.Fatal("register logger error", err)
	}
	if _, err := logger.RegisterLogger("cache", "logs/cache.log", "json"); err != nil {
		log.Fatal("register logger error", err)
	}
	cmd.InitCmd()
	cmd.Execute()
}
