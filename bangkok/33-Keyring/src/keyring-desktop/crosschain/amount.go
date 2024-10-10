package crosschain

import (
	"fmt"
	"math"
	"math/big"

	"github.com/shopspring/decimal"
)

const FLOAT_PRECISION = 6

// AmountBlockchain is a big integer amount as blockchain expects it for tx.
type AmountBlockchain big.Int

type ContractMetadata struct {
	Decimals uint8
	Symbol   string
}

// AmountHumanReadable is a decimal amount as a human expects it for readability.
type AmountHumanReadable decimal.Decimal

func (amount AmountBlockchain) String() string {
	bigInt := big.Int(amount)
	return bigInt.String()
}

// Int converts an AmountBlockchain into *bit.Int
func (amount AmountBlockchain) Int() *big.Int {
	bigInt := big.Int(amount)
	return &bigInt
}

// Uint64 converts an AmountBlockchain into uint64
func (amount AmountBlockchain) Uint64() uint64 {
	bigInt := big.Int(amount)
	return bigInt.Uint64()
}

// UnmaskFloat64 converts an AmountBlockchain into float64 given the number of decimals
func (amount AmountBlockchain) UnmaskFloat64() float64 {
	bigInt := big.Int(amount)
	bigFloat := new(big.Float).SetInt(&bigInt)
	exponent := new(big.Float).SetFloat64(math.Pow10(FLOAT_PRECISION))
	bigFloat = bigFloat.Quo(bigFloat, exponent)
	f64, _ := bigFloat.Float64()
	return f64
}

// Use the underlying big.Int.Cmp()
func (amount *AmountBlockchain) Cmp(other *AmountBlockchain) int {
	return amount.Int().Cmp(other.Int())
}

// Use the underlying big.Int.Add()
func (amount *AmountBlockchain) Add(x *AmountBlockchain) AmountBlockchain {
	result := new(big.Int)
	result.Add(amount.Int(), x.Int())
	return AmountBlockchain(*result)
}

// Use the underlying big.Int.Sub()
func (amount *AmountBlockchain) Sub(x *AmountBlockchain) AmountBlockchain {
	result := new(big.Int)
	result.Sub(amount.Int(), x.Int())
	return AmountBlockchain(*result)
}

// Use the underlying big.Int.Mul()
func (amount *AmountBlockchain) Mul(x *AmountBlockchain) AmountBlockchain {
	result := new(big.Int)
	result.Mul(amount.Int(), x.Int())
	return AmountBlockchain(*result)
}

// Use the underlying big.Int.Div()
func (amount *AmountBlockchain) Div(x *AmountBlockchain) AmountBlockchain {
	result := new(big.Int)
	result.Div(amount.Int(), x.Int())
	return AmountBlockchain(*result)
}

func (amount *AmountBlockchain) ToHuman(decimals int32) AmountHumanReadable {
	dec := decimal.NewFromBigInt(amount.Int(), -decimals)
	return AmountHumanReadable(dec)
}

// NewAmountBlockchainFromUint64 creates a new AmountBlockchain from a uint64
func NewAmountBlockchainFromUint64(u64 uint64) AmountBlockchain {
	bigInt := new(big.Int).SetUint64(u64)
	return AmountBlockchain(*bigInt)
}

// NewAmountBlockchainToMaskFloat64 creates a new AmountBlockchain as a float64 times 10^FLOAT_PRECISION
func NewAmountBlockchainToMaskFloat64(f64 float64) AmountBlockchain {
	bigFloat := new(big.Float).SetFloat64(f64)
	exponent := new(big.Float).SetFloat64(math.Pow10(FLOAT_PRECISION))
	bigFloat = bigFloat.Mul(bigFloat, exponent)
	var bigInt big.Int
	bigFloat.Int(&bigInt)
	return AmountBlockchain(bigInt)
}

// NewAmountBlockchainFromStr creates a new AmountBlockchain from a string
func NewAmountBlockchainFromStr(str string) AmountBlockchain {
	bigInt, _ := new(big.Int).SetString(str, 10)
	return AmountBlockchain(*bigInt)
}

func (amount AmountHumanReadable) ToBlockchain(decimals int32) AmountBlockchain {
	amountStr := (decimal.Decimal)(amount).Shift(decimals).String()
	return NewAmountBlockchainFromStr(amountStr)
}

func (amount AmountHumanReadable) String() string {
	return decimal.Decimal(amount).String()
}

func (b *AmountBlockchain) MarshalJSON() ([]byte, error) {
	return []byte(b.String()), nil
}

func (b *AmountBlockchain) UnmarshalJSON(p []byte) error {
	if string(p) == "null" {
		return nil
	}
	var z big.Int
	_, ok := z.SetString(string(p), 10)
	if !ok {
		return fmt.Errorf("not a valid big integer: %s", p)
	}
	*b = AmountBlockchain(z)
	return nil
}
