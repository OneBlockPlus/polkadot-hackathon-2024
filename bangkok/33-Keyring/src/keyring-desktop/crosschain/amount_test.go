package crosschain

import (
	"github.com/shopspring/decimal"
)

func (s *CrosschainTestSuite) TestNewAmountBlockchainFromUint64() {
	require := s.Require()
	amount := NewAmountBlockchainFromUint64(123)
	require.NotNil(amount)
	require.Equal(amount.Uint64(), uint64(123))
	require.Equal(amount.String(), "123")
}

func (s *CrosschainTestSuite) TestNewAmountBlockchainFromFloat64() {
	require := s.Require()
	amount := NewAmountBlockchainToMaskFloat64(1.23)
	require.NotNil(amount)
	require.Equal(amount.Uint64(), uint64(1230000))
	require.Equal(amount.String(), "1230000")

	amountFloat := amount.UnmaskFloat64()
	require.Equal(amountFloat, 1.23)
}

func (s *CrosschainTestSuite) TestAmountHumanReadable() {
	require := s.Require()
	amountDec, _ := decimal.NewFromString("10.3")
	amount := AmountHumanReadable(amountDec)
	require.NotNil(amount)
	require.Equal(amount.String(), "10.3")
}

func (s *CrosschainTestSuite) TestAdd() {
	require := s.Require()
	amount := NewAmountBlockchainFromUint64(123)
	x := NewAmountBlockchainFromUint64(100)

	result := amount.Add(&x)

	require.Equal(amount.Uint64(), uint64(123))
	require.Equal(x.Uint64(), uint64(100))
	require.Equal(result.Uint64(), uint64(223))
}

func (s *CrosschainTestSuite) TestSub() {
	require := s.Require()
	amount := NewAmountBlockchainFromUint64(123)
	x := NewAmountBlockchainFromUint64(100)

	result := amount.Sub(&x)

	require.Equal(amount.Uint64(), uint64(123))
	require.Equal(x.Uint64(), uint64(100))
	require.Equal(result.Uint64(), uint64(23))
}

func (s *CrosschainTestSuite) TestMul() {
	require := s.Require()
	amount := NewAmountBlockchainFromUint64(123)
	x := NewAmountBlockchainFromUint64(100)

	result := amount.Mul(&x)

	require.Equal(amount.Uint64(), uint64(123))
	require.Equal(x.Uint64(), uint64(100))
	require.Equal(result.Uint64(), uint64(12300))
}

func (s *CrosschainTestSuite) TestDiv() {
	require := s.Require()
	amount := NewAmountBlockchainFromUint64(123)
	x := NewAmountBlockchainFromUint64(100)

	result := amount.Div(&x)

	require.Equal(amount.Uint64(), uint64(123))
	require.Equal(x.Uint64(), uint64(100))
	require.Equal(result.Uint64(), uint64(1))
}
