package listener

import (
	"context"
	"dephy-conduits/config"
	"dephy-conduits/constants"
	"dephy-conduits/logic"
	"dephy-conduits/utils"
	"errors"
	"log"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/crypto"
	"gorm.io/gorm"
)

var (
	topicList     = crypto.Keccak256Hash([]byte("List(address,address,uint256,uint256,address,uint256,address)"))
	topicDelist   = crypto.Keccak256Hash([]byte("Delist(address,address)"))
	topicRelist   = crypto.Keccak256Hash([]byte("Relist(address,address,uint256,uint256,address,uint256,address)"))
	topicRent     = crypto.Keccak256Hash([]byte("Rent(address,uint256,address,uint256,uint256,uint256,uint256)"))
	topicPayRent  = crypto.Keccak256Hash([]byte("PayRent(address,uint256)"))
	topicEndLease = crypto.Keccak256Hash([]byte("EndLease(address,address)"))
	topicWithdraw = crypto.Keccak256Hash([]byte("Withdraw(address,address)"))
)

func MarketplaceListener(chainId uint64) {
	var contract string
	if chainId == constants.BASE_SEPOLIA {
		contract = config.Config.Contracts.BASE_SEPOLIA.Marketplace.Address
	} else {
		log.Fatalf("Unsupported chain id: %v", chainId)
	}

	ethClient, err := utils.GetEthClient(chainId)
	if err != nil {
		log.Fatalf("[%d]: GetEthClient failed, %v", chainId, err)
		return
	}

	_currentBlockNumber, err := ethClient.BlockNumber(context.Background())
	if err != nil {
		log.Fatalf("[%d]: Get current BlockNumber failed, %v", chainId, err)
	}

	currentBlockNumber := big.NewInt(int64(_currentBlockNumber))

	query := ethereum.FilterQuery{
		Addresses: []common.Address{common.HexToAddress(contract)},
		FromBlock: currentBlockNumber,
	}

	bookmark := _currentBlockNumber
	for {
		logs := make(chan types.Log)
		sub, err := ethClient.SubscribeFilterLogs(context.Background(), query, logs)
		if err != nil {
			log.Printf("[%d]: SubscribeFilterLogs Marketplace failed, %v", chainId, err)
			time.Sleep(2000 * time.Millisecond)
			continue
		}
		log.Printf("[%d]: Listener Marketplace started.", chainId)

		outerLoop:
		for {
			select {
			case err := <-sub.Err():
				log.Printf("[%d]: Listener Marketplace received error: %v", chainId, err)
				break outerLoop

			case vLog := <-logs:
				if vLog.BlockNumber > bookmark {
					err = logic.UpdateBookmark(chainId, contract, bookmark)
					if err != nil {
						log.Printf("[%d]: Update MarketplaceBookmark failed, %v", chainId, err)
					}
					bookmark = vLog.BlockNumber
				}
				if vLog.Topics[0] == topicList {
					log.Printf("[%d]: <List> received.", chainId)
					err = logic.ParseList(chainId, vLog)
					if err != nil {
						log.Fatalf("[%d]: <List> failed to handle, %v", chainId, err)
					} else {
						log.Printf("[%d]: <List> handled.", chainId)
					}
				} else if vLog.Topics[0] == topicDelist {
					log.Printf("[%d]: <Delist> received.", chainId)
					err = logic.ParseDelist(chainId, vLog)
					if err != nil {
						log.Fatalf("[%d]: <Delist> failed to handle, %v", chainId, err)
					} else {
						log.Printf("[%d]: <Delist> handled.", chainId)
					}
				} else if vLog.Topics[0] == topicRelist {
					log.Printf("[%d]: <Relist> received.", chainId)
					err = logic.ParseRelist(chainId, vLog)
					if err != nil {
						log.Fatalf("[%d]: <Relist> failed to handle, %v", chainId, err)
					} else {
						log.Printf("[%d]: <Relist> handled.", chainId)
					}
				} else if vLog.Topics[0] == topicRent {
					log.Printf("[%d]: <Rent> received.", chainId)
					err = logic.ParseRent(chainId, vLog)
					if err != nil {
						log.Fatalf("[%d]: <Rent> failed to handle, %v", chainId, err)
					} else {
						log.Printf("[%d]: <Rent> handled.", chainId)
					}
				} else if vLog.Topics[0] == topicPayRent {
					log.Printf("[%d]: <PayRent> received.", chainId)
					err = logic.ParsePayRent(chainId, vLog)
					if err != nil {
						log.Fatalf("[%d]: <PayRent> failed to handle, %v", chainId, err)
					} else {
						log.Printf("[%d]: <PayRent> handled.", chainId)
					}
				} else if vLog.Topics[0] == topicEndLease {
					log.Printf("[%d]: <EndLease> received.", chainId)
					err = logic.ParseEndLease(chainId, vLog)
					if err != nil {
						log.Fatalf("[%d]: <EndLease> failed to handle, %v", chainId, err)
					} else {
						log.Printf("[%d]: <EndLease> handled.", chainId)
					}
				} else if vLog.Topics[0] == topicWithdraw {
					log.Printf("[%d]: <Withdraw> received.", chainId)
					err = logic.ParseWithdraw(chainId, vLog)
					if err != nil {
						log.Fatalf("[%d]: <Withdraw> failed to handle, %v", chainId, err)
					} else {
						log.Printf("[%d]: <Withdraw> handled.", chainId)
					}
				}
			}
		}
	}
}

func QueryMarketplaceEvents(chainId uint64) {
	var contractConfig *config.ContractConfig
	if chainId == constants.BASE_SEPOLIA {
		contractConfig = config.Config.Contracts.BASE_SEPOLIA.Marketplace
	} else {
		log.Fatalf("Unsupported chain id: %v", chainId)
	}

	if !contractConfig.QueryHistory {
		return
	}
	ethClient, err := utils.GetEthClient(chainId)
	if err != nil {
		log.Fatalf("[%d]: GetEthClient failed, %v", chainId, err)
		return
	}

	var _startAt *big.Int
	var _endAt *big.Int = big.NewInt(0)
	previousAt, err := logic.GetBookmark(chainId, contractConfig.Address)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			err = logic.InsertBookmark(chainId, contractConfig.Address, uint64(contractConfig.StartAt))
			if err != nil {
				log.Fatalf("[%d]: InsertBookmark for %s failed, %v", chainId, contractConfig.Address, err)
				return
			} else {
				log.Printf("[%d]: InsertBookmark for %s at %d successfully.", chainId, contractConfig.Address, contractConfig.StartAt)
			}
		}
		previousAt = uint64(contractConfig.StartAt)
	}

	_startAt = big.NewInt(int64(previousAt) + 1)
	log.Printf("[%d]: Continue query Marketplace events at [%d]...", chainId, _startAt.Uint64())

	var _currentBlockNumber uint64
	var currentBlockNumber *big.Int

	_currentBlockNumber, err = ethClient.BlockNumber(context.Background())
	if err != nil {
		log.Fatalf("[%d]: Get current BlockNumber failed, %v", chainId, err)
		return
	}
	currentBlockNumber = big.NewInt(int64(_currentBlockNumber))

	bookmark := _currentBlockNumber
	var (
		countList     = 0
		countDelist   = 0
		countRelist   = 0
		countRent     = 0
		countPayRent  = 0
		countEndLease = 0
		countWithdraw = 0
	)
	for {
		_endAt.Add(_startAt, big.NewInt(contractConfig.QueryInterval))
		if _endAt.Cmp(currentBlockNumber) > 0 {
			_endAt.Set(currentBlockNumber)
		}

		query := ethereum.FilterQuery{
			Addresses: []common.Address{common.HexToAddress(contractConfig.Address)},
			FromBlock: _startAt,
			ToBlock:   _endAt,
		}

		historyLogs, err := ethClient.FilterLogs(context.Background(), query)
		if err != nil {
			log.Fatalf("[%d]: FilterLogs Marketplace failed, %v", chainId, err)
			return
		}

		for _, historyLog := range historyLogs {
			if historyLog.BlockNumber > bookmark {
				err = logic.UpdateBookmark(chainId, contractConfig.Address, bookmark)
				if err != nil {
					log.Printf("[%d]: Update MarketplaceBookmark failed, %v", chainId, err)
				}
				bookmark = historyLog.BlockNumber
			}
			if historyLog.Topics[0] == topicList {
				err = logic.ParseList(chainId, historyLog)
				if err != nil {
					log.Fatalf("[%d]: ParseList failed, %v", chainId, err)
				} else {
					countList++
				}
			} else if historyLog.Topics[0] == topicDelist {
				err = logic.ParseDelist(chainId, historyLog)
				if err != nil {
					log.Fatalf("[%d]: ParseDelist failed, %v", chainId, err)
				} else {
					countDelist++
				}
			} else if historyLog.Topics[0] == topicRelist {
				err = logic.ParseRelist(chainId, historyLog)
				if err != nil {
					log.Fatalf("[%d]: ParseRelist failed, %v", chainId, err)
				} else {
					countRelist++
				}
			} else if historyLog.Topics[0] == topicRent {
				err = logic.ParseRent(chainId, historyLog)
				if err != nil {
					log.Fatalf("[%d]: ParseRent failed, %v", chainId, err)
				} else {
					countRent++
				}
			} else if historyLog.Topics[0] == topicPayRent {
				err = logic.ParsePayRent(chainId, historyLog)
				if err != nil {
					log.Fatalf("[%d]: ParsePayRent failed, %v", chainId, err)
				} else {
					countPayRent++
				}
			} else if historyLog.Topics[0] == topicEndLease {
				err = logic.ParseEndLease(chainId, historyLog)
				if err != nil {
					log.Fatalf("[%d]: ParseEndLease failed, %v", chainId, err)
				} else {
					countEndLease++
				}
			} else if historyLog.Topics[0] == topicWithdraw {
				err = logic.ParseWithdraw(chainId, historyLog)
				if err != nil {
					log.Fatalf("[%d]: ParseWithdraw failed, %v", chainId, err)
				} else {
					countWithdraw++
				}
			}
		}

		time.Sleep(200 * time.Millisecond)

		_currentBlockNumber, err = ethClient.BlockNumber(context.Background())
		if err != nil {
			log.Fatalf("[%d]: Get current BlockNumber failed, %v", chainId, err)
		} else {
			currentBlockNumber = big.NewInt(int64(_currentBlockNumber))
		}

		if _endAt.Cmp(currentBlockNumber) == 0 {
			break
		}

		_startAt.Add(_endAt, big.NewInt(1))
	}
	err = logic.UpdateBookmark(chainId, contractConfig.Address, _currentBlockNumber)
	if err != nil {
		log.Fatalf("[%d]: Update MarketplaceBookmark failed, %v", chainId, err)
	}

	log.Printf("[%d]: Query Marketplace <List> history events successfully, %d events handled.", chainId, countList)
	log.Printf("[%d]: Query Marketplace <Delist> history events successfully, %d events handled.", chainId, countDelist)
	log.Printf("[%d]: Query Marketplace <Relist> history events successfully, %d events handled.", chainId, countRelist)
	log.Printf("[%d]: Query Marketplace <Rent> history events successfully, %d events handled.", chainId, countRent)
	log.Printf("[%d]: Query Marketplace <PayRent> history events successfully, %d events handled.", chainId, countPayRent)
	log.Printf("[%d]: Query Marketplace <EndLease> history events successfully, %d events handled.", chainId, countEndLease)
	log.Printf("[%d]: Query Marketplace <Withdraw> history events successfully, %d events handled.", chainId, countWithdraw)
}
