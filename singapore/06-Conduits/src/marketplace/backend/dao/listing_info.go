package dao

import (
	"dephy-conduits/model"

	"gorm.io/gorm/clause"
)

func CreateListingInfo(listingInfo *model.ListingInfo) error {
	err := db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "tx_hash"}},
		DoNothing: true,
	}).Create(listingInfo).Error

	return err
}

func UpdateListingInfo(listingInfo *model.ListingInfo) error {
	return db.Save(listingInfo).Error
}

func GetCurrentListingInfo(chainId uint64, device string) (*model.ListingInfo, error) {
	var listingInfo model.ListingInfo
	err := db.Where("chain_id = ? AND device = ?", chainId, device).
		Order("block_number DESC").
		First(&listingInfo).Error
	if err != nil {
		return nil, err
	}
	return &listingInfo, nil
}
