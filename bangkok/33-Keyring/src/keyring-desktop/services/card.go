package services

import (
	"errors"
	"keyring-desktop/utils"

	"github.com/ebfe/scard"
	keycardio "github.com/status-im/keycard-go/io"
	"github.com/status-im/keycard-go/types"
)

var (
	errCardNotInstalled       = errors.New("card applet is not installed")
	errCardNotInitialized     = errors.New("card is not initialized")
	errCardAlreadyInitialized = errors.New("card is already initialized")
	errNoPairingInfo          = errors.New("pairing info is not set")
)

// KeyringCard defines a struct with methods to operate with card.
type KeyringCard struct {
	c    types.Channel
	ctx  *scard.Context
	card *scard.Card
}

// NewKeyringCard returns a new KeyringCard that communicates to Transmitter t.
func NewKeyringCard() (*KeyringCard, error) {
	// read smart card
	cardContext, err := scard.EstablishContext()
	if err != nil {
		utils.Sugar.Error(err)
		return nil, errors.New("failed to establish card context")
	}

	card, err := readCard(cardContext)
	if err != nil {
		utils.Sugar.Error(err)
		return nil, errors.New("failed to read card")
	}

	keyringCard := &KeyringCard{
		c:    keycardio.NewNormalChannel(card),
		ctx:  cardContext,
		card: card,
	}
	return keyringCard, nil
}

func (k *KeyringCard) Release() error {
	err := k.ctx.Release()
	if err != nil {
		return err
	}

	err = k.card.Disconnect(scard.ResetCard)
	if err != nil {
		return err
	}

	return nil
}

func readCard(ctx *scard.Context) (*scard.Card, error) {
	utils.Sugar.Info("start read card")

	readers, err := ctx.ListReaders()
	if err != nil {
		return nil, err
	}

	utils.Sugar.Info("waiting for a card")
	if len(readers) == 0 {
		return nil, errors.New("no card read found")
	}

	index, err := waitForCard(ctx, readers)
	if err != nil {
		return nil, err
	}

	utils.Sugar.Infof("card found: %v", index)
	reader := readers[index]

	utils.Sugar.Infof("connecting to card reader: %v", reader)
	card, err := ctx.Connect(reader, scard.ShareShared, scard.ProtocolAny)
	if err != nil {
		return nil, err
	}

	status, err := card.Status()
	if err != nil {
		return nil, err
	}

	switch status.ActiveProtocol {
	case scard.ProtocolT0:
		utils.Sugar.Info("card protocol", "T", "0")
	case scard.ProtocolT1:
		utils.Sugar.Info("card protocol", "T", "1")
	default:
		utils.Sugar.Info("card protocol", "T", "unknown")
	}

	return card, nil
}

func waitForCard(ctx *scard.Context, readers []string) (int, error) {
	rs := make([]scard.ReaderState, len(readers))

	for i := range rs {
		rs[i].Reader = readers[i]
		rs[i].CurrentState = scard.StateUnaware
	}

	for {
		for i := range rs {
			if rs[i].EventState&scard.StatePresent != 0 {
				return i, nil
			}

			rs[i].CurrentState = rs[i].EventState
		}

		err := ctx.GetStatusChange(rs, 1)
		if err != nil {
			return -1, err
		}
	}
}
