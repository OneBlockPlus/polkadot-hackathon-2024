package model

type DeviceInfo struct {
	ChainId     uint64      `json:"chain_id" gorm:"primaryKey;not null"`
	Device      string      `json:"device" gorm:"primaryKey;type:varchar(42)"`
	Product     string      `json:"product" gorm:"type:varchar(42)"`
	TokenId     string      `json:"token_id" gorm:"type:varchar(255)"`
	ListingInfo ListingInfo `json:"listing_info" gorm:"foreignKey:ChainId,Device;references:ChainId,Device"`
	RentalInfo  RentalInfo  `json:"rental_info" gorm:"foreignKey:ChainId,Device;references:ChainId,Device"`
}
