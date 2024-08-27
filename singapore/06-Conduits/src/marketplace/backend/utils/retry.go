package utils

import (
	"dephy-conduits/constants"
	"time"
)

func RetryOperation(operation func() error) (err error) {
	for i := 0; i < constants.MAX_RETRIES; i++ {
		err = operation()
		if err == nil {
			return nil
		}
		time.Sleep(constants.RETRY_DELAY)
	}
	return err
}
