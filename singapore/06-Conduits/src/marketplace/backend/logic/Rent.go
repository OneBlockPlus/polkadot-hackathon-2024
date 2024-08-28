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

func ParseRent(chainId uint64, vLog types.Log) (err error) {
	eventData := struct {
		StartTime   *big.Int
		EndTime     *big.Int
		RentalDays  *big.Int
		PrepaidRent *big.Int
	}{}
	err = contracts.AbiMarketplace.UnpackIntoInterface(&eventData, "Rent", vLog.Data)
	if err != nil {
		return
	}

	device := common.BytesToAddress(vLog.Topics[1].Bytes()).Hex()
	accessId := new(big.Int).SetBytes(vLog.Topics[2].Bytes())
	tenant := common.BytesToAddress(vLog.Topics[3].Bytes()).Hex()

	rentalInfo := &model.RentalInfo{
		ChainId:         chainId,
		TxHash:          vLog.TxHash.Hex(),
		BlockNumber:     vLog.BlockNumber,
		Device:          device,
		AccessId: accessId.String(),
		Tenant:          tenant,
		StartTime:       eventData.StartTime.String(),
		EndTime:         eventData.EndTime.String(),
		RentalDays:      eventData.RentalDays.String(),
		TotalPaidRent:   eventData.PrepaidRent.String(),
		RentalStatus:    model.RSRenting,
		CreateAt:        time.Now(),
	}

	err = dao.CreateRentalInfo(rentalInfo)
	if err != nil {
		return
	}

	return
}
