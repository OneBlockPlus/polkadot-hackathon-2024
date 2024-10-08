package database

import (
	"errors"

	"github.com/jmoiron/sqlx"
	_ "modernc.org/sqlite"
)

func SaveCard(db *sqlx.DB, puk, code, pairingKey, pairingIndex, name string) error {
	cards := []Card{}

	err := db.Select(&cards, "select * from cards where name = ?", name)
	if err != nil {
		return err
	}
	if len(cards) > 0 {
		return errors.New("card name is already used")
	}

	_, err = db.Exec(
		"insert into cards (name, selected, puk, pairing_code, pairing_key, pairing_index) values (?, true, ?, ?, ?, ?)",
		name, puk, code, pairingKey, pairingIndex,
	)

	if err != nil {
		return err
	}

	return nil
}

func QueryCurrentCard(db *sqlx.DB) ([]Card, error) {
	cards := []Card{}

	err := db.Select(&cards, "select * from cards where selected = true limit 1")
	if err != nil {
		return nil, err
	}

	return cards, nil
}

func QueryAllCards(db *sqlx.DB) ([]Card, error) {
	cards := []Card{}

	err := db.Select(&cards, "select * from cards")
	if err != nil {
		return nil, err
	}

	return cards, nil
}

func UpdateCurrentCard(db *sqlx.DB, cardId int) error {
	var ids []int
	err := db.Select(&ids, "select card_id from cards where selected = true limit 1")
	if err != nil {
		return err
	}

	tx, err := db.Begin()
	if err != nil {
		return err
	}

	if len(ids) > 0 {
		tx.Exec(`UPDATE cards SET selected = false WHERE card_id = ?`, ids[0])
	}

	tx.Exec(`UPDATE cards SET selected = true WHERE card_id = ?`, cardId)

	err = tx.Commit()
	if err != nil {
		return err
	}

	return nil
}

func UpdateCardName(db *sqlx.DB, cardId int, name string) error {
	_, err := db.Exec(`UPDATE cards SET name=? WHERE card_id = ?`, name, cardId)
	return err
}

func QueryCard(db *sqlx.DB, cardId int) (*Card, error) {
	card := Card{}

	err := db.Get(&card, "select * from cards where card_id = ?", cardId)
	if err != nil {
		return nil, err
	}

	return &card, nil
}
