package logic

import "dephy-conduits/dao"

func InsertBookmark(chainId uint64, contract string, blockNumber uint64) error {
	return dao.InsertBookmark(chainId, contract, blockNumber)
}

func UpdateBookmark(chainId uint64, contract string, blockNumber uint64) error {
	return dao.UpdateBookmark(chainId, contract, blockNumber)
}

func GetBookmark(chainId uint64, contract string) (uint64, error) {
	return dao.GetBookmark(chainId, contract)
}
