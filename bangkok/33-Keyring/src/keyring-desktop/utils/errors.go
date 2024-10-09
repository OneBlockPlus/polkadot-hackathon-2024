package utils

import "errors"

var ErrCardNotConnected = errors.New("failed to connect to card, check the status and try again")
