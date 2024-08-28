package logic

import (
	"dephy-conduits/contracts"
	"dephy-conduits/dao"
	"errors"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
)

func ParsePayRent(chainId uint64, vLog types.Log) (err error) {
	eventData := struct {
		Rent *big.Int
	}{}
	err = contracts.AbiMarketplace.UnpackIntoInterface(&eventData, "PayRent", vLog.Data)
	if err != nil {
		return
	}

	device := common.BytesToAddress(vLog.Topics[1].Bytes()).Hex()

	rentalInfo, err := dao.GetCurrentRentalInfoByDevice(chainId, device)
	if err != nil {
		return
	}

	totalPaidRent := new(big.Int)
	_, ok := totalPaidRent.SetString(rentalInfo.TotalPaidRent, 10)
	if !ok {
		return errors.New("failed to convert total_paid_rent to big.Int")
	}
	rentalInfo.TotalPaidRent = new(big.Int).Add(totalPaidRent, eventData.Rent).String()

	err = dao.UpdateRentalInfo(rentalInfo)
	if err != nil {
		return
	}

	return
}
