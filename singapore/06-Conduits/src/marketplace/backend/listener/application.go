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
	topicTransfer = crypto.Keccak256Hash([]byte("Transfer(address,address,uint256)"))
)

func ApplicationListener(chainId uint64) {
	var contract string
	if chainId == constants.BASE_SEPOLIA {
		contract = config.Config.Contracts.BASE_SEPOLIA.Application.Address
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
			log.Printf("[%d]: SubscribeFilterLogs Application failed, %v", chainId, err)
			time.Sleep(2000 * time.Millisecond)
			continue
		}
		log.Printf("[%d]: Listener Application started.", chainId)
		
		outerLoop:
		for {
			select {
			case err := <-sub.Err():
				log.Printf("[%d]: Listener Application received error: %v", chainId, err)
				break outerLoop

			case vLog := <-logs:
				if vLog.BlockNumber > bookmark {
					err = logic.UpdateBookmark(chainId, contract, bookmark)
					if err != nil {
						log.Printf("[%d]: Update ApplicationBookmark failed, %v", chainId, err)
					}
					bookmark = vLog.BlockNumber
				}
				if vLog.Topics[0] == topicTransfer {
					from := common.BytesToAddress(vLog.Topics[1].Bytes())
					to := common.BytesToAddress(vLog.Topics[2].Bytes())
					if (from != common.Address{} && to != common.Address{}) {
						// exclude mint and burn, only handle pure ownership transfer
						log.Printf("[%d]: <Transfer> received.", chainId)
						err = logic.ParseTransfer(chainId, vLog)
						if err != nil {
							log.Fatalf("[%d]: <Transfer> failed to handle, %v", chainId, err)
						} else {
							log.Printf("[%d]: <Transfer> handled.", chainId)
						}
					}
				}
			}
		}
	}
}

func QueryApplicationEvents(chainId uint64) {
	var contractConfig *config.ContractConfig
	if chainId == constants.BASE_SEPOLIA {
		contractConfig = config.Config.Contracts.BASE_SEPOLIA.Application
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
	log.Printf("[%d]: Continue query Application events at [%d]...", chainId, _startAt.Uint64())

	var _currentBlockNumber uint64
	var currentBlockNumber *big.Int

	_currentBlockNumber, err = ethClient.BlockNumber(context.Background())
	if err != nil {
		log.Fatalf("[%d]: Get current BlockNumber failed, %v", chainId, err)
		return
	}
	currentBlockNumber = big.NewInt(int64(_currentBlockNumber))

	bookmark := _currentBlockNumber
	countTransfer := 0

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
			log.Fatalf("[%d]: FilterLogs Application failed, %v", chainId, err)
			return
		}

		for _, historyLog := range historyLogs {
			if historyLog.BlockNumber > bookmark {
				err = logic.UpdateBookmark(chainId, contractConfig.Address, bookmark)
				if err != nil {
					log.Printf("[%d]: Update ApplicationBookmark failed, %v", chainId, err)
				}
				bookmark = historyLog.BlockNumber
			}
			if historyLog.Topics[0] == topicTransfer {
				from := common.BytesToAddress(historyLog.Topics[1].Bytes())
				to := common.BytesToAddress(historyLog.Topics[2].Bytes())
				if (from != common.Address{} && to != common.Address{}) {
					err = logic.ParseTransfer(chainId, historyLog)
					if err != nil {
						log.Fatalf("[%d]: ParseTransfer failed, %v", chainId, err)
					} else {
						countTransfer++
					}
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
		log.Fatalf("[%d]: Update ApplicationBookmark failed, %v", chainId, err)
	}

	log.Printf("[%d]: Query Application <Transfer> history events successfully, %d events handled.", chainId, countTransfer)
}
