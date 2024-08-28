package model

import "time"

type RentalInfo struct {
	ChainId       uint64       `json:"chain_id" gorm:"not null"`
	TxHash        string       `json:"tx_hash" gorm:"primaryKey;type:varchar(66)"`
	BlockNumber   uint64       `json:"block_number"`
	Device        string       `json:"device" gorm:"type:varchar(42)"`
	AccessId      string       `json:"access_id" gorm:"type:varchar(255)"`
	Tenant        string       `json:"tenant" gorm:"type:varchar(42)"`
	StartTime     string       `json:"start_time" gorm:"type:varchar(255)"`
	EndTime       string       `json:"end_time" gorm:"type:varchar(255)"`
	RentalDays    string       `json:"rental_days" gorm:"type:varchar(255)"`
	TotalPaidRent string       `json:"total_paid_rent" gorm:"type:varchar(255)"`
	RentalStatus  RentalStatus `json:"rental_status"`
	CreateAt      time.Time    `json:"-"`
}

type RentalStatus int

const (
	RSEndedOrNotExist RentalStatus = iota
	RSRenting
)
