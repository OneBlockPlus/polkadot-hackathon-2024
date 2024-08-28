package dao

import (
	"dephy-conduits/model"

	"gorm.io/gorm/clause"
)

func CreateRentalInfo(rentalInfo *model.RentalInfo) error {
	err := db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "tx_hash"}},
		DoNothing: true,                               
	}).Create(rentalInfo).Error

	return err
}

func UpdateRentalInfo(rentalInfo *model.RentalInfo) error {
	return db.Save(rentalInfo).Error
}

func UpdateRentalStatus(chainId uint64, device string, newStatus model.ListingStatus) error {
	return db.Model(&model.RentalInfo{}).
		Where("chain_id = ? AND device = ?", chainId, device).
		Order("block_number DESC").
		Limit(1).
		Update("rental_status", newStatus).Error
}

func GetCurrentRentalInfoByDevice(chainId uint64, device string) (*model.RentalInfo, error) {
	var rentalInfo model.RentalInfo
	err := db.Where("chain_id = ? AND device = ?", chainId, device).
		Order("block_number DESC").
		First(&rentalInfo).Error
	if err != nil {
		return nil, err
	}
	return &rentalInfo, nil
}

func GetCurrentRentalInfoByAccessId(chainId uint64, accessId string) (*model.RentalInfo, error) {
	var rentalInfo model.RentalInfo
	err := db.Where("chain_id = ? AND access_id = ?", chainId, accessId).
		Order("block_number DESC").
		First(&rentalInfo).Error
	if err != nil {
		return nil, err
	}
	return &rentalInfo, nil
}
