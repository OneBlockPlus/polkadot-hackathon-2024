package logic

import (
	"dephy-conduits/contracts"
	"dephy-conduits/dao"
	"dephy-conduits/model"
	"math/big"
	"time"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
)

func ParseRelist(chainId uint64, vLog types.Log) (err error) {
	eventData := struct {
		MinRentalDays *big.Int
		MaxRentalDays *big.Int
		RentCurrency  common.Address
		DailyRent     *big.Int
		RentRecipient common.Address
	}{}
	err = contracts.AbiMarketplace.UnpackIntoInterface(&eventData, "Relist", vLog.Data)
	if err != nil {
		return
	}

	owner := common.BytesToAddress(vLog.Topics[1].Bytes()).Hex()
	device := common.BytesToAddress(vLog.Topics[2].Bytes()).Hex()

	prevListingInfo, err := dao.GetCurrentListingInfo(chainId, device)
	if err != nil {
		return
	}
	prevListingInfo.Relisted = true
	err = dao.UpdateListingInfo(prevListingInfo)
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
