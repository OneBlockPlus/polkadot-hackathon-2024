package logic

import (
	"dephy-conduits/dao"
	"errors"
	"math/big"

	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"gorm.io/gorm"
)

func ParseTransfer(chainId uint64, vLog types.Log) (err error) {
	to := common.BytesToAddress(vLog.Topics[2].Bytes()).Hex()
	accessId := new(big.Int).SetBytes(vLog.Topics[3].Bytes())

	rentalInfo, err := dao.GetCurrentRentalInfoByAccessId(chainId, accessId.String())
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// AccessId not mint by marketplace
			return nil
		}
		return
	}

	if rentalInfo.Tenant != to {
		rentalInfo.Tenant = to
	}

	err = dao.UpdateRentalInfo(rentalInfo)
	if err != nil {
		return
	}

	return
}
