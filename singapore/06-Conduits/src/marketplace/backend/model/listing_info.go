package model

import "time"

type ListingInfo struct {
	ChainId       uint64        `json:"chain_id" gorm:"not null"`
	TxHash        string        `json:"tx_hash" gorm:"primaryKey;type:varchar(66)"`
	BlockNumber   uint64        `json:"block_number"`
	Device        string        `json:"device" gorm:"type:varchar(42)"`
	Owner         string        `json:"owner" gorm:"type:varchar(42)"`
	MinRentalDays string        `json:"min_rental_days" gorm:"type:varchar(255)"`
	MaxRentalDays string        `json:"max_rental_days" gorm:"type:varchar(255)"`
	RentCurrency  string        `json:"rent_currency" gorm:"type:varchar(42)"`
	DailyRent     string        `json:"daily_rent" gorm:"type:varchar(255)"`
	RentRecipient string        `json:"rent_recipient" gorm:"type:varchar(42)"`
	ListingStatus ListingStatus `json:"listing_status"`
	Relisted      bool			`json:"-" gorm:"default:false"`
	CreateAt      time.Time     `json:"-"`
}

type ListingStatus int

const (
	LSWithdrawnOrNotExist ListingStatus = iota
	LSListing
	LSDelisted
)
