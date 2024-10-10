package factory

import (
	"testing"

	"keyring-desktop/crosschain"
	xc "keyring-desktop/crosschain"
	"keyring-desktop/crosschain/chain/bitcoin"
	"keyring-desktop/crosschain/chain/evm"

	"github.com/shopspring/decimal"
	"github.com/stretchr/testify/suite"
)

type CrosschainTestSuite struct {
	suite.Suite
	Factory          *Factory
	TestNativeAssets []xc.NativeAsset
	TestAssetConfigs []xc.ITask
}

func (s *CrosschainTestSuite) SetupTest() {
	s.TestNativeAssets = []xc.NativeAsset{
		xc.ETH,
		// xc.MATIC,
		// xc.BNB,
		// xc.SOL,
		// xc.ATOM,
	}

	assetConfig := crosschain.NativeAssetConfig{
		NativeAsset: crosschain.NativeAsset("ETH"),
		Asset:       "ETH",
		Driver:      "evm",
		Decimals:    18,
		Type:        crosschain.AssetTypeNative,
	}
	s.TestAssetConfigs = append(s.TestAssetConfigs, &assetConfig)
}

func TestExampleTestSuite(t *testing.T) {
	suite.Run(t, new(CrosschainTestSuite))
}

// NewObject functions

// GetObject functions (excluding config)

func (s *CrosschainTestSuite) TestGetAddressFromPublicKey() {
	require := s.Require()
	for _, asset := range s.TestAssetConfigs {
		address, _, _ := GetAddressFromPublicKey(asset, []byte{})
		require.NotNil(address)
	}
}

func (s *CrosschainTestSuite) TestGetAllPossibleAddressesFromPublicKey() {
	require := s.Require()
	for _, asset := range s.TestAssetConfigs {
		addresses, _ := GetAllPossibleAddressesFromPublicKey(asset, []byte{})
		require.NotNil(addresses)
	}
}

// MustObject functions

func (s *CrosschainTestSuite) TestMustAmountBlockchain() {
	require := s.Require()
	for _, asset := range s.TestAssetConfigs {
		asset := asset.GetAssetConfig()
		amount := MustAmountBlockchain(asset, "10.3")

		var expected xc.AmountBlockchain
		if asset.Decimals == 6 {
			expected = xc.NewAmountBlockchainFromUint64(10300000)
		}
		if asset.Decimals == 9 {
			expected = xc.NewAmountBlockchainFromUint64(10300000000)
		}
		if asset.Decimals == 12 {
			expected = xc.NewAmountBlockchainFromUint64(10300000000 * 1000)
		}
		if asset.Decimals == 18 {
			expected = xc.NewAmountBlockchainFromUint64(10300000000 * 1000000000)
		}

		require.Equal(expected, amount, "Error on: "+asset.NativeAsset)
	}
}

func (s *CrosschainTestSuite) TestMustAddress() {
	require := s.Require()
	for _, asset := range s.TestAssetConfigs {
		asset := asset.GetAssetConfig()
		address := MustAddress(asset, "myaddress") // trivial impl
		require.Equal(xc.Address("myaddress"), address, "Error on: "+asset.NativeAsset)
	}
}

func (s *CrosschainTestSuite) TestMustPrivateKey() {
	require := s.Require()
	for _, asset := range s.TestAssetConfigs {
		asset := asset.GetAssetConfig()
		if asset.NativeAsset != xc.SOL {
			continue
		}
		privateKey := MustPrivateKey(asset, "myprivatekey")
		require.NotNil(privateKey, "Error on: "+asset.NativeAsset)
	}
}

// Convert functions

func (s *CrosschainTestSuite) TestConvertAmountToHuman() {
	require := s.Require()
	var amountBlockchain xc.AmountBlockchain
	for _, asset := range s.TestAssetConfigs {
		asset := asset.GetAssetConfig()
		if asset.Decimals == 6 {
			amountBlockchain = xc.NewAmountBlockchainFromUint64(10300000)
		}
		if asset.Decimals == 9 {
			amountBlockchain = xc.NewAmountBlockchainFromUint64(10300000000)
		}
		if asset.Decimals == 12 {
			amountBlockchain = xc.NewAmountBlockchainFromUint64(10300000000 * 1000)
		}
		if asset.Decimals == 18 {
			amountBlockchain = xc.NewAmountBlockchainFromUint64(10300000000 * 1000000000)
		}

		amount, err := ConvertAmountToHuman(asset, amountBlockchain)
		require.Nil(err)
		require.Equal("10.3", amount.String(), "Error on: "+asset.NativeAsset)
	}
}

func (s *CrosschainTestSuite) TestConvertAmountToBlockchain() {
	require := s.Require()
	amountDecimal, _ := decimal.NewFromString("10.3")
	amountHuman := xc.AmountHumanReadable(amountDecimal)

	var expected xc.AmountBlockchain
	for _, asset := range s.TestAssetConfigs {
		asset := asset.GetAssetConfig()
		amount, err := convertAmountToBlockchain(asset, amountHuman)

		if asset.Decimals == 6 {
			expected = xc.NewAmountBlockchainFromUint64(10300000)
		}
		if asset.Decimals == 9 {
			expected = xc.NewAmountBlockchainFromUint64(10300000000)
		}
		if asset.Decimals == 12 {
			expected = xc.NewAmountBlockchainFromUint64(10300000000 * 1000)
		}
		if asset.Decimals == 18 {
			expected = xc.NewAmountBlockchainFromUint64(10300000000 * 1000000000)
		}

		require.Nil(err)
		require.Equal(expected, amount, "Error on: "+asset.NativeAsset)
	}
}

func (s *CrosschainTestSuite) TestConvertAmountStrToBlockchain() {
	require := s.Require()
	var expected xc.AmountBlockchain
	for _, asset := range s.TestAssetConfigs {
		asset := asset.GetAssetConfig()
		amount, err := ConvertAmountStrToBlockchain(asset, "10.3")

		if asset.Decimals == 6 {
			expected = xc.NewAmountBlockchainFromUint64(10_300_000)
		}
		if asset.Decimals == 9 {
			expected = xc.NewAmountBlockchainFromUint64(10_300_000_000)
		}
		if asset.Decimals == 12 {
			expected = xc.NewAmountBlockchainFromUint64(10_300_000_000_000)
		}
		if asset.Decimals == 18 {
			expected = xc.NewAmountBlockchainFromUint64(10_300_000_000_000_000_000)
		}

		require.Nil(err)
		require.Equal(expected, amount, "Error on: "+asset.NativeAsset)
	}
}

func (s *CrosschainTestSuite) TestConvertAmountStrToBlockchainErr() {
	require := s.Require()
	for _, asset := range s.TestAssetConfigs {
		amount, err := ConvertAmountStrToBlockchain(asset, "")
		require.EqualError(err, "can't convert  to decimal")
		require.Equal(xc.NewAmountBlockchainFromUint64(0), amount)

		_, err = ConvertAmountStrToBlockchain(asset, "err")
		require.EqualError(err, "can't convert err to decimal: exponent is not numeric")
		require.Equal(xc.NewAmountBlockchainFromUint64(0), amount)
	}
}

func (s *CrosschainTestSuite) TestNormalizeAddressString() {
	require := s.Require()
	address := ""

	address = NormalizeAddressString("myaddress", "BTC")
	require.Equal("myaddress", address) // no normalization

	address = NormalizeAddressString("bitcoincash:myaddress", "BCH")
	require.Equal("myaddress", address)

	address = NormalizeAddressString("0x0ECE", "")
	require.Equal("0x0ece", address) // lowercase

	address = NormalizeAddressString("0x0ECE", "ETH")
	require.Equal("0x0ece", address)
}

func (s *CrosschainTestSuite) TestAllTxInputSerDeser() {
	require := s.Require()
	for _, driver := range xc.SupportedDrivers {
		var input xc.TxInput
		switch driver {
		case xc.DriverEVM, xc.DriverEVMLegacy:
			input = evm.NewTxInput()
		// case xc.DriverCosmos, xc.DriverCosmosEvmos:
		// 	input = cosmos.NewTxInput()
		// case xc.DriverSolana:
		// 	input = solana.NewTxInput()
		// case xc.DriverAptos:
		// 	input = aptos.NewTxInput()
		case xc.DriverBitcoin:
			input = bitcoin.NewTxInput()
		default:
			require.Fail("must add driver to test: " + string(driver))
		}
		bz, err := MarshalTxInput(input)
		require.NoError(err)
		_, err = UnmarshalTxInput(bz)
		require.NoError(err)
	}
}
