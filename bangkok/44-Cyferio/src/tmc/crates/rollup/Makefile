PROJECT_ROOT := $(shell git rev-parse --show-toplevel)
SOV_CLI_REL_PATH := $(PROJECT_ROOT)/target/debug/starter-cli-wallet

CELESTIA_CONFIG := $(PROJECT_ROOT)/celestia_rollup_config.toml

DOCKER_COMPOSE_DIR := $(PROJECT_ROOT)/docker
DOCKER_COMPOSE_CFG := $(DOCKER_COMPOSE_DIR)/docker-compose.yml
CREDENTIALS_DIR := $(DOCKER_COMPOSE_DIR)/credentials

# at height 3 the credits will already belong to the keys
START_HEIGHT := 3
KEY_NAME := bridge-0
RPC_PORT := 26658

# get the jwt token
get_auth = $(shell cat $(CREDENTIALS_DIR)/$(KEY_NAME).jwt)

# Docker compose commands
docker_compose := docker compose -f $(DOCKER_COMPOSE_CFG)
# start the service
compose_up := $(docker_compose) up --build --force-recreate -d
# stop the service
compose_down := $(docker_compose) down
# follow the logs
compose_logs := $(docker_compose) logs -f
# check if service is running
# we need a bridge and validator so naive check is to have at least 2 services
compose_is_running = test 2 -le "$(shell $(docker_compose) ps --filter status=running --format json | jq 'length')"

JWT_TOKEN_PATH := $(CREDENTIALS_DIR)/$(KEY_NAME).jwt
get_token := $(docker_compose) exec -it sequencer-0 celestia bridge auth admin --p2p.network "private"
get_token_1 := $(docker_compose) exec -it sequencer-1 celestia bridge auth admin --p2p.network "private"

# start the celestia network and generate a new config
start:
	@echo "Starting celestia docker compose..."
	$(docker_compose) up --build --force-recreate -d --quiet-pull
	echo "waiting for container 'sequencer-0' to become operational..."
	@while true; do \
  		timestamp=$$(date $(DATE_FORMAT)); \
		health=$$(docker inspect --format='{{.State.Health.Status}}' $$($(docker_compose) ps -q sequencer-0)); \
		if [ "$$health" = "healthy" ]; then \
			echo "sequencer-0 is healthy"; \
			break; \
		else \
			echo "health == '$$health': Waiting for sequencer-0 to be up and running..."; \
		fi; \
		sleep 3; \
	done
	@echo "Services are ready, preparing configuration"
	@while [ -z "$$TOKEN" ]; do \
		echo "Waiting JWT for token..."; \
		TOKEN=$$($(get_token) 2>/dev/null); \
		sleep 0.5; \
	done; \
	echo "Token received: $$TOKEN";
	@TOKEN=$$($(get_token) 2>/dev/null); \
	sed -i '' 's/^\(celestia_rpc_auth_token = \)"[^"]*"/\1"'$$TOKEN'"/' $(CELESTIA_CONFIG); \
    echo "Celestia docker compose has started completed."; \

# start the celestia network or attach to existing
start-network: check-docker
	@echo "Starting local celestia network setup"
	@if $(compose_is_running); then $(compose_logs); else $(compose_up); fi

# stop the celestia network
stop: check-docker
	@echo "Stopping local celestia network setup"
	@$(compose_down)

# clean up rollup data and stop the celestia network
clean: stop clean-db

# listen to celestia network logs
compose-logs: check-docker
	@echo "Showing celestia logs"
	@$(compose_logs)

# check if docker is installed
check-docker:
	@command -v docker > /dev/null 2>&1 || { echo "Docker is not installed"; exit 1; }
	@# TODO: check docker compose too

# check if celestia network is running
check-compose-running: check-docker
	@$(compose_is_running)

clean-db:
	rm -rf ../../rollup-starter-data
	rm -rf mock_da.sqlite

build-sov-cli:
ifdef CELESTIA
	cargo build --bin starter-cli-wallet --no-default-features --features celestia_da
else
	cargo build --bin starter-cli-wallet
endif

set-rpc-url: build-sov-cli
	$(SOV_CLI_REL_PATH) rpc set-url --rpc=http://127.0.0.1:12345 --rest-api=http://127.0.0.1:12346

import-keys: build-sov-cli
	$(SOV_CLI_REL_PATH) keys import --nickname DANGER__DO_NOT_USE_WITH_REAL_MONEY --path ../../test-data/keys/token_deployer_private_key.json


test-generate-create-token-tx: build-sov-cli
	$(SOV_CLI_REL_PATH) transactions import from-file bank --chain-id 4321 --max-fee 100000000 --path ../../test-data/requests/create_token.json


test-create-token: set-rpc-url test-generate-create-token-tx import-keys
	$(SOV_CLI_REL_PATH) rpc submit-batch --wait-for-processing by-nickname DANGER__DO_NOT_USE_WITH_REAL_MONEY
	sleep 5


test-bank-supply-of:
	curl -sS -X POST -H "Content-Type: application/json" -d '{"jsonrpc":"2.0","method":"bank_supplyOf","params":{"token_id":"token_1rwrh8gn2py0dl4vv65twgctmlwck6esm2as9dftumcw89kqqn3nqrduss6"},"id":1}' http://127.0.0.1:12345

