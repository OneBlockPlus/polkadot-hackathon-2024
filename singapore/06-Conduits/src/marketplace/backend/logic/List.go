package logic

import (
	"context"
	"dephy-conduits/config"
	"dephy-conduits/constants"
	"dephy-conduits/contracts"
	"dephy-conduits/dao"
	"dephy-conduits/model"
	"dephy-conduits/utils"
	"errors"
	"log"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
)

func ParseList(chainId uint64, vLog types.Log) (err error) {
	eventData := struct {
		MinRentalDays *big.Int
		MaxRentalDays *big.Int
		RentCurrency  common.Address
		DailyRent     *big.Int
		RentRecipient common.Address
	}{}
	err = contracts.AbiMarketplace.UnpackIntoInterface(&eventData, "List", vLog.Data)
	if err != nil {
		return
	}

	owner := common.BytesToAddress(vLog.Topics[1].Bytes()).Hex()
	device := common.BytesToAddress(vLog.Topics[2].Bytes()).Hex()

	product, tokenId, err := GetDeviceBinding(chainId, device)
	if err != nil {
		return
	}

	err = dao.CreateOrIgnoreDeviceInfo(&model.DeviceInfo{
		ChainId: chainId,
		Device:  device,
		Product: product,
		TokenId: tokenId,
	})
	if err != nil {
		return
	}

	listingInfo := &model.ListingInfo{
		ChainId:       chainId,
		TxHash:        vLog.TxHash.Hex(),
		BlockNumber:   vLog.BlockNumber,
		Device:        device,
		Owner:         owner,
		MinRentalDays: eventData.MinRentalDays.String(),
		MaxRentalDays: eventData.MaxRentalDays.String(),
		RentCurrency:  eventData.RentCurrency.Hex(),
		DailyRent:     eventData.DailyRent.String(),
		RentRecipient: eventData.RentRecipient.Hex(),
		ListingStatus: model.LSListing,
		CreateAt:      time.Now(),
	}

	err = dao.CreateListingInfo(listingInfo)
	if err != nil {
		return
	}

	return
}

func GetDeviceBinding(chainId uint64, device string) (string, string, error) {
	var contract common.Address
	if chainId == constants.BASE_SEPOLIA {
		contract = common.HexToAddress(config.Config.Contracts.BASE_SEPOLIA.Application.Address)
	} else {
		return "", "", errors.New("unsupported chain id")
	}

	ethClient, err := utils.GetEthClient(chainId)
	if err != nil {
		log.Fatalf("[%d]: GetEthClient failed, %v", chainId, err)
		return "", "", err
	}

	deviceAddress := common.HexToAddress(device)

	callData, err := contracts.AbiApplication.Pack("getDeviceBinding", deviceAddress)
	if err != nil {
		return "", "", err
	}

	var result []byte
	operation := func() error {
		res, err := ethClient.CallContract(context.Background(), ethereum.CallMsg{
			To:   &contract,
			Data: callData,
		}, nil)
		if err != nil {
			return err
		}
		result = res
		return nil
	}
	err = utils.RetryOperation(operation)
	if err != nil {
		return "", "", err
	}

	// decode result
	var (
		product common.Address
		tokenId *big.Int
	)
	output := []interface{}{&product, &tokenId}
	err = contracts.AbiApplication.UnpackIntoInterface(&output, "getDeviceBinding", result)
	if err != nil {
		return "", "", err
	}

	return product.Hex(), tokenId.String(), nil
}
