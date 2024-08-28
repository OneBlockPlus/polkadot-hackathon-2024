package dao

import (
	"dephy-conduits/config"
	"dephy-conduits/model"
	"fmt"
	"log"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

var db *gorm.DB

func Init(cfg *config.PostgresConfig) (err error) {
	var dsn string

	if cfg.User == "" && cfg.Password == "" {
		dsn = fmt.Sprintf(
			"host=%s port=%d dbname=%s sslmode=disable search_path=%s",
			cfg.Host,
			cfg.Port,
			cfg.DB,
			cfg.Schema,
		)
	} else {
		dsn = fmt.Sprintf(
			"host=%s port=%d dbname=%s user=%s password=%s sslmode=disable search_path=%s",
			cfg.Host,
			cfg.Port,
			cfg.DB,
			cfg.User,
			cfg.Password,
			cfg.Schema,
		)
	}
	if db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{}); err != nil {
		log.Fatalln(err)
	}

	if err = db.AutoMigrate(
		&model.Bookmark{},
		&model.DeviceInfo{},
		&model.ListingInfo{},
		&model.RentalInfo{},
	); err != nil {
		log.Fatalln(err)
	}
	return
}
