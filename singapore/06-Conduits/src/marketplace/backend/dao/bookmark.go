package dao

import (
	"dephy-conduits/model"
)

func InsertBookmark(chainId uint64, contract string, blockNumber uint64) (err error) {
	if err = db.Create(&model.Bookmark{
		ChainId:     chainId,
		Contract:    contract,
		BlockNumber: blockNumber,
	}).Error; err != nil {
		return
	}

	return nil
}

func UpdateBookmark(chainId uint64, contract string, blockNumber uint64) (err error) {
	if err = db.Model(&model.Bookmark{}).Where(&model.Bookmark{
		ChainId:  chainId,
		Contract: contract,
	}).Update("block_number", blockNumber).Error; err != nil {
		return
	}
	return nil
}

func GetBookmark(chainId uint64, contract string) (uint64, error) {
	var bookmark model.Bookmark
	err := db.Where(&model.Bookmark{ChainId: chainId, Contract: contract}).First(&bookmark).Error
	if err != nil {
		return 0, err
	} else {
		return bookmark.BlockNumber, nil
	}
}
