package model

type Bookmark struct {
	ChainId     uint64 `json:"chain_id" gorm:"not null"`
	Contract    string `json:"contract" gorm:"primaryKey; type:VARCHAR(255); not null"`
	BlockNumber uint64 `json:"block_number" gorm:"default:0"`
}
