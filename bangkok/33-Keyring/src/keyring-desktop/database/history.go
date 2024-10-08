package database

import (
	"github.com/jmoiron/sqlx"
)

func SaveTransactionHistory(db *sqlx.DB, items []DatabaseTransactionInfo) error {
	if len(items) == 0 {
		return nil
	}
	_, err := db.NamedExec(
		`insert or replace into transaction_history (chain_name, address, hash, timestamp, status, from_addr, to_addr, value, fee) 
			values (:chain_name, :address, :hash, :timestamp, :status, :from_addr, :to_addr, :value, :fee)`,
		items,
	)
	if err != nil {
		return err
	}

	return nil
}

func SaveTokenTransferHistory(db *sqlx.DB, items []DatabaseTokenTransferInfo) error {
	if len(items) == 0 {
		return nil
	}
	_, err := db.NamedExec(
		`insert or replace into token_transfer_history (chain_name, address, hash, timestamp, from_addr, to_addr, value, contract, symbol, type) 
			values (:chain_name, :address, :hash, :timestamp, :from_addr, :to_addr, :value, :contract, :symbol, :type)`,
		items,
	)
	if err != nil {
		return err
	}

	return nil
}

func QueryTransactionHistory(db *sqlx.DB, chainName string, address string, page int, limit int) ([]DatabaseTransactionInfo, error) {
	txHistory := []DatabaseTransactionInfo{}
	err := db.Select(&txHistory, `select * from transaction_history where chain_name = ? and address = ? order by timestamp desc limit ? offset ?`, chainName, address, limit, page*limit)
	if err != nil {
		return nil, err
	}

	return txHistory, nil
}

func QueryTokenTransferHistory(db *sqlx.DB, chainName string, address string, page int, limit int) ([]DatabaseTokenTransferInfo, error) {
	tokenTransferHistory := []DatabaseTokenTransferInfo{}
	err := db.Select(&tokenTransferHistory, `select * from token_transfer_history where chain_name = ? and address = ? order by timestamp desc limit ? offset ?`, chainName, address, limit, page*limit)
	if err != nil {
		return nil, err
	}

	return tokenTransferHistory, nil
}
