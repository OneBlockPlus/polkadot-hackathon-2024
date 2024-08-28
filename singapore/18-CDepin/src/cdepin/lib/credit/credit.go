package credit

import (
	"context"
	"encoding/json"
	"math/big"
	"time"

	"cdepin/lib/protocol"

	"github.com/ethereum/go-ethereum/crypto"
	"github.com/pkg/errors"
	"github.com/syndtr/goleveldb/leveldb"
)

const (
	LEVEL_UNTRUST = 3
	LEVEL_COMMON  = 2
	LEVEL_TRUST   = 1
	LEVEL_OWNER   = 0

	DEFALUT_RESOURCE_LIMIT = 4 * 8 * 1024 * 1024
)

type Credit struct {
	Price         string
	Owner         string
	ResourceLimit uint64
	Record        *leveldb.DB
	protocol.Order2Credit
}

type RecordItem struct {
	Level            int
	SentResource     uint64
	ReceivedResource uint64
	CheckedTimes     uint64
	LastAccess       time.Time
}

func NewCreditManager(owner, dbPath, orderPrice string, limit uint64, handle protocol.Order2Credit) (*Credit, error) {
	db, err := leveldb.OpenFile(dbPath, nil)
	if err != nil {
		return nil, errors.Wrap(err, "new credit manager error")
	}
	if limit == 0 {
		limit = DEFALUT_RESOURCE_LIMIT
	}
	return &Credit{
		Price:         orderPrice,
		Owner:         owner,
		Record:        db,
		ResourceLimit: limit,
		Order2Credit:  handle,
	}, nil
}

func (c *Credit) AddCreditPoint(key string, resource int64) {
	record, _ := c.GetCreditRecord(key)
	if resource < 0 {
		record.SentResource += uint64(-resource)
	} else {
		record.ReceivedResource += uint64(resource)
	}
	record.Level = 1 + int(record.SentResource/(record.ReceivedResource+1))%LEVEL_UNTRUST
	c.PutCreditRecord(key, record)
}

func (c *Credit) GetCreditRecord(key string) (RecordItem, bool) {
	var (
		record RecordItem
		ok     bool
	)
	res, err := c.Record.Get([]byte(key), nil)
	if err == nil && len(res) != 0 {
		err = json.Unmarshal(res, &record)
		if err != nil {
			ok = true
		}
	}
	return record, ok
}

func (c *Credit) PutCreditRecord(key string, record RecordItem) error {
	record.LastAccess = time.Now()
	datas, _ := json.Marshal(record)
	return c.Record.Put([]byte(key), datas, nil)
}

func (c *Credit) IsLimited(key string) (uint64, bool) {

	record, ok := c.GetCreditRecord(key)
	if !ok {
		c.PutCreditRecord(key, record)
		return c.ResourceLimit, false
	}
	return c.calcLimit(record)
}

func (c *Credit) calcLimit(record RecordItem) (uint64, bool) {
	var (
		res   bool
		limit uint64
	)
	if record.SentResource-record.ReceivedResource > c.ResourceLimit {
		res = true
		limit = record.SentResource - record.ReceivedResource - c.ResourceLimit
	} else {
		if record.SentResource > record.ReceivedResource {
			limit = c.ResourceLimit - (record.SentResource - record.ReceivedResource)
		} else {
			limit = record.ReceivedResource - (record.SentResource - c.ResourceLimit)
		}
	}
	return limit, res
}

func (c *Credit) CheckCredit(ctx context.Context, pubkey, data, sign []byte) bool {
	pk, err := crypto.DecompressPubkey(pubkey)
	if err != nil {
		return false
	}
	key := crypto.PubkeyToAddress(*pk).Hex()
	record, ok := c.GetCreditRecord(key)
	if !ok {
		c.PutCreditRecord(key, record)
		return true
	}
	_, ok = c.calcLimit(record)
	if len(data) == 0 || len(sign) == 0 {
		return !ok
	}
	value, err := c.CheckCreditOrder(ctx, pubkey, data, sign)
	if err != nil {
		return !ok
	}
	v, okey := big.NewInt(0).SetString(value, 10)
	if !okey {
		return !ok
	}
	p, okey := big.NewInt(0).SetString(c.Price, 10)

	if !okey {
		return !ok
	}
	if p.Int64() == 0 {
		p.SetInt64(1)
	}
	rec := v.Div(v, p).Uint64()
	record.ReceivedResource += rec
	record.Level = 1 + int(record.SentResource/(record.ReceivedResource+1))%LEVEL_UNTRUST
	_, ok = c.calcLimit(record)
	c.PutCreditRecord(key, record)
	return !ok
}

func (c *Credit) PaymentCreditBill(ctx context.Context, key, nodeId, value string) (string, string, error) {

	record, _ := c.GetCreditRecord(key)
	hash, orderId, err := c.CreateCreditOrder(ctx, key, nodeId, value)
	if err != nil {
		return hash, orderId, errors.Wrap(err, "payment credit bill error")
	}
	v, okey := big.NewInt(0).SetString(value, 10)
	if !okey {
		return hash, orderId, errors.Wrap(errors.New("bad order value"), "payment credit bill error")
	}
	p, okey := big.NewInt(0).SetString(c.Price, 10)
	if !okey {
		return hash, orderId, errors.Wrap(errors.New("bad order price"), "payment credit bill error")
	}
	if p.Int64() == 0 {
		p.SetInt64(1)
	}
	rec := v.Div(v, p).Uint64()
	record.SentResource += rec
	record.Level = 1 + int(record.SentResource/(record.ReceivedResource+1))%LEVEL_UNTRUST
	c.PutCreditRecord(key, record)
	return hash, orderId, nil
}
