package logic

import (
	"dephy-conduits/dao"
	"dephy-conduits/model"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
)

func ParseWithdraw(chainId uint64, vLog types.Log) (err error) {
	device := common.BytesToAddress(vLog.Topics[2].Bytes()).Hex()

	listingInfo, err := dao.GetCurrentListingInfo(chainId, device)
	if err != nil {
		return
	}

	listingInfo.ListingStatus = model.LSWithdrawnOrNotExist

	err = dao.UpdateListingInfo(listingInfo)
	if err != nil {
		return
	}

	return
}
