package logic

import (
	"dephy-conduits/dao"
	"dephy-conduits/model"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
)

func ParseEndLease(chainId uint64, vLog types.Log) (err error) {
	device := common.BytesToAddress(vLog.Topics[1].Bytes()).Hex()

	rentalInfo, err := dao.GetCurrentRentalInfoByDevice(chainId, device)
	if err != nil {
		return
	}

	rentalInfo.RentalStatus = model.RSEndedOrNotExist

	err = dao.UpdateRentalInfo(rentalInfo)
	if err != nil {
		return
	}

	return
}
