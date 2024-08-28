package protocol

import (
	"github.com/CESSProject/cess-dcdn-components/cd2n-lib/protocol/ink"
)

type CacheProtoInk struct {
	ink.IChain
}

// func (pc *CacheProtoInk) CreateCreditOrder(ctx context.Context, key, nodeId, value string) (string, string, error) {
// 	pc.CacheOrderPayment()
// 	return tx, hex.EncodeToString(orderId[:]), nil
// }

// func (pc *CacheProtoInk) CheckCreditOrder(ctx context.Context, pubkey, data, sign []byte) (string, error) {

// 	return order.Value.String(), nil
// }
