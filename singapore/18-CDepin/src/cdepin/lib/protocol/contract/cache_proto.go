// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package contract

import (
	"errors"
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = errors.New
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
	_ = abi.ConvertType
)

// CacheProtoMetaData contains all meta data concerning the CacheProto contract.
var CacheProtoMetaData = &bind.MetaData{
	ABI: "[{\"inputs\":[{\"internalType\":\"address\",\"name\":\"peerid\",\"type\":\"address\"}],\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"inputs\":[],\"name\":\"ECDSAInvalidSignature\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"length\",\"type\":\"uint256\"}],\"name\":\"ECDSAInvalidSignatureLength\",\"type\":\"error\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"s\",\"type\":\"bytes32\"}],\"name\":\"ECDSAInvalidSignatureS\",\"type\":\"error\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"nodeAcc\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint256\",\"name\":\"reward\",\"type\":\"uint256\"}],\"name\":\"Claim\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"nodeAcc\",\"type\":\"address\"}],\"name\":\"Exit\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"orderId\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"nodeAcc\",\"type\":\"address\"}],\"name\":\"OrderPayment\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"nodeAcc\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"Staking\",\"type\":\"event\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"CacheReward\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"Node\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"created\",\"type\":\"bool\"},{\"internalType\":\"uint256\",\"name\":\"collerate\",\"type\":\"uint256\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"internalType\":\"bytes\",\"name\":\"peerId\",\"type\":\"bytes\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"Order\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"value\",\"type\":\"uint256\"},{\"internalType\":\"address\",\"name\":\"creater\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"node\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"term\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"OrderNum\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"name\":\"RewardRecord\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"TermTotalOrder\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"name\":\"TokenBonded\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"nodeAcc\",\"type\":\"address\"}],\"name\":\"cacheOrderPayment\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"claim\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"exit\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[],\"name\":\"getCurrencyTerm\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"_account\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"_tokenId\",\"type\":\"uint256\"}],\"name\":\"getMessageHash\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"acc\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"}],\"name\":\"isTokenOwner\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"_msgHash\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"_signature\",\"type\":\"bytes\"}],\"name\":\"openRecover\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"view\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"orderId\",\"type\":\"bytes32\"}],\"name\":\"orderClaim\",\"outputs\":[],\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"_msgHash\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"_signature\",\"type\":\"bytes\"}],\"name\":\"recoverSigner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"address\",\"name\":\"nodeAcc\",\"type\":\"address\"},{\"internalType\":\"address\",\"name\":\"tokenAcc\",\"type\":\"address\"},{\"internalType\":\"uint256\",\"name\":\"tokenId\",\"type\":\"uint256\"},{\"internalType\":\"bytes\",\"name\":\"_peerId\",\"type\":\"bytes\"},{\"internalType\":\"bytes\",\"name\":\"_signature\",\"type\":\"bytes\"}],\"name\":\"staking\",\"outputs\":[],\"stateMutability\":\"payable\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"hash\",\"type\":\"bytes32\"}],\"name\":\"toEthSignedMessageHash\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"stateMutability\":\"pure\",\"type\":\"function\"},{\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"_msgHash\",\"type\":\"bytes32\"},{\"internalType\":\"bytes\",\"name\":\"_signature\",\"type\":\"bytes\"},{\"internalType\":\"address\",\"name\":\"_signer\",\"type\":\"address\"}],\"name\":\"verify\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"stateMutability\":\"pure\",\"type\":\"function\"}]",
}

// CacheProtoABI is the input ABI used to generate the binding from.
// Deprecated: Use CacheProtoMetaData.ABI instead.
var CacheProtoABI = CacheProtoMetaData.ABI

// CacheProto is an auto generated Go binding around an Ethereum contract.
type CacheProto struct {
	CacheProtoCaller     // Read-only binding to the contract
	CacheProtoTransactor // Write-only binding to the contract
	CacheProtoFilterer   // Log filterer for contract events
}

// CacheProtoCaller is an auto generated read-only Go binding around an Ethereum contract.
type CacheProtoCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// CacheProtoTransactor is an auto generated write-only Go binding around an Ethereum contract.
type CacheProtoTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// CacheProtoFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type CacheProtoFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// CacheProtoSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type CacheProtoSession struct {
	Contract     *CacheProto       // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// CacheProtoCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type CacheProtoCallerSession struct {
	Contract *CacheProtoCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts     // Call options to use throughout this session
}

// CacheProtoTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type CacheProtoTransactorSession struct {
	Contract     *CacheProtoTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts     // Transaction auth options to use throughout this session
}

// CacheProtoRaw is an auto generated low-level Go binding around an Ethereum contract.
type CacheProtoRaw struct {
	Contract *CacheProto // Generic contract binding to access the raw methods on
}

// CacheProtoCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type CacheProtoCallerRaw struct {
	Contract *CacheProtoCaller // Generic read-only contract binding to access the raw methods on
}

// CacheProtoTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type CacheProtoTransactorRaw struct {
	Contract *CacheProtoTransactor // Generic write-only contract binding to access the raw methods on
}

// NewCacheProto creates a new instance of CacheProto, bound to a specific deployed contract.
func NewCacheProto(address common.Address, backend bind.ContractBackend) (*CacheProto, error) {
	contract, err := bindCacheProto(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &CacheProto{CacheProtoCaller: CacheProtoCaller{contract: contract}, CacheProtoTransactor: CacheProtoTransactor{contract: contract}, CacheProtoFilterer: CacheProtoFilterer{contract: contract}}, nil
}

// NewCacheProtoCaller creates a new read-only instance of CacheProto, bound to a specific deployed contract.
func NewCacheProtoCaller(address common.Address, caller bind.ContractCaller) (*CacheProtoCaller, error) {
	contract, err := bindCacheProto(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &CacheProtoCaller{contract: contract}, nil
}

// NewCacheProtoTransactor creates a new write-only instance of CacheProto, bound to a specific deployed contract.
func NewCacheProtoTransactor(address common.Address, transactor bind.ContractTransactor) (*CacheProtoTransactor, error) {
	contract, err := bindCacheProto(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &CacheProtoTransactor{contract: contract}, nil
}

// NewCacheProtoFilterer creates a new log filterer instance of CacheProto, bound to a specific deployed contract.
func NewCacheProtoFilterer(address common.Address, filterer bind.ContractFilterer) (*CacheProtoFilterer, error) {
	contract, err := bindCacheProto(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &CacheProtoFilterer{contract: contract}, nil
}

// bindCacheProto binds a generic wrapper to an already deployed contract.
func bindCacheProto(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := CacheProtoMetaData.GetAbi()
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, *parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_CacheProto *CacheProtoRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _CacheProto.Contract.CacheProtoCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_CacheProto *CacheProtoRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _CacheProto.Contract.CacheProtoTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_CacheProto *CacheProtoRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _CacheProto.Contract.CacheProtoTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_CacheProto *CacheProtoCallerRaw) Call(opts *bind.CallOpts, result *[]interface{}, method string, params ...interface{}) error {
	return _CacheProto.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_CacheProto *CacheProtoTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _CacheProto.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_CacheProto *CacheProtoTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _CacheProto.Contract.contract.Transact(opts, method, params...)
}

// CacheReward is a free data retrieval call binding the contract method 0x8b166d64.
//
// Solidity: function CacheReward(address ) view returns(uint256)
func (_CacheProto *CacheProtoCaller) CacheReward(opts *bind.CallOpts, arg0 common.Address) (*big.Int, error) {
	var out []interface{}
	err := _CacheProto.contract.Call(opts, &out, "CacheReward", arg0)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// CacheReward is a free data retrieval call binding the contract method 0x8b166d64.
//
// Solidity: function CacheReward(address ) view returns(uint256)
func (_CacheProto *CacheProtoSession) CacheReward(arg0 common.Address) (*big.Int, error) {
	return _CacheProto.Contract.CacheReward(&_CacheProto.CallOpts, arg0)
}

// CacheReward is a free data retrieval call binding the contract method 0x8b166d64.
//
// Solidity: function CacheReward(address ) view returns(uint256)
func (_CacheProto *CacheProtoCallerSession) CacheReward(arg0 common.Address) (*big.Int, error) {
	return _CacheProto.Contract.CacheReward(&_CacheProto.CallOpts, arg0)
}

// Node is a free data retrieval call binding the contract method 0x6d19c92a.
//
// Solidity: function Node(address ) view returns(bool created, uint256 collerate, uint256 tokenId, bytes peerId)
func (_CacheProto *CacheProtoCaller) Node(opts *bind.CallOpts, arg0 common.Address) (struct {
	Created   bool
	Collerate *big.Int
	TokenId   *big.Int
	PeerId    []byte
}, error) {
	var out []interface{}
	err := _CacheProto.contract.Call(opts, &out, "Node", arg0)

	outstruct := new(struct {
		Created   bool
		Collerate *big.Int
		TokenId   *big.Int
		PeerId    []byte
	})
	if err != nil {
		return *outstruct, err
	}

	outstruct.Created = *abi.ConvertType(out[0], new(bool)).(*bool)
	outstruct.Collerate = *abi.ConvertType(out[1], new(*big.Int)).(**big.Int)
	outstruct.TokenId = *abi.ConvertType(out[2], new(*big.Int)).(**big.Int)
	outstruct.PeerId = *abi.ConvertType(out[3], new([]byte)).(*[]byte)

	return *outstruct, err

}

// Node is a free data retrieval call binding the contract method 0x6d19c92a.
//
// Solidity: function Node(address ) view returns(bool created, uint256 collerate, uint256 tokenId, bytes peerId)
func (_CacheProto *CacheProtoSession) Node(arg0 common.Address) (struct {
	Created   bool
	Collerate *big.Int
	TokenId   *big.Int
	PeerId    []byte
}, error) {
	return _CacheProto.Contract.Node(&_CacheProto.CallOpts, arg0)
}

// Node is a free data retrieval call binding the contract method 0x6d19c92a.
//
// Solidity: function Node(address ) view returns(bool created, uint256 collerate, uint256 tokenId, bytes peerId)
func (_CacheProto *CacheProtoCallerSession) Node(arg0 common.Address) (struct {
	Created   bool
	Collerate *big.Int
	TokenId   *big.Int
	PeerId    []byte
}, error) {
	return _CacheProto.Contract.Node(&_CacheProto.CallOpts, arg0)
}

// Order is a free data retrieval call binding the contract method 0x564f4c8b.
//
// Solidity: function Order(bytes32 ) view returns(uint256 value, address creater, address node, uint256 term)
func (_CacheProto *CacheProtoCaller) Order(opts *bind.CallOpts, arg0 [32]byte) (struct {
	Value   *big.Int
	Creater common.Address
	Node    common.Address
	Term    *big.Int
}, error) {
	var out []interface{}
	err := _CacheProto.contract.Call(opts, &out, "Order", arg0)

	outstruct := new(struct {
		Value   *big.Int
		Creater common.Address
		Node    common.Address
		Term    *big.Int
	})
	if err != nil {
		return *outstruct, err
	}

	outstruct.Value = *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)
	outstruct.Creater = *abi.ConvertType(out[1], new(common.Address)).(*common.Address)
	outstruct.Node = *abi.ConvertType(out[2], new(common.Address)).(*common.Address)
	outstruct.Term = *abi.ConvertType(out[3], new(*big.Int)).(**big.Int)

	return *outstruct, err

}

// Order is a free data retrieval call binding the contract method 0x564f4c8b.
//
// Solidity: function Order(bytes32 ) view returns(uint256 value, address creater, address node, uint256 term)
func (_CacheProto *CacheProtoSession) Order(arg0 [32]byte) (struct {
	Value   *big.Int
	Creater common.Address
	Node    common.Address
	Term    *big.Int
}, error) {
	return _CacheProto.Contract.Order(&_CacheProto.CallOpts, arg0)
}

// Order is a free data retrieval call binding the contract method 0x564f4c8b.
//
// Solidity: function Order(bytes32 ) view returns(uint256 value, address creater, address node, uint256 term)
func (_CacheProto *CacheProtoCallerSession) Order(arg0 [32]byte) (struct {
	Value   *big.Int
	Creater common.Address
	Node    common.Address
	Term    *big.Int
}, error) {
	return _CacheProto.Contract.Order(&_CacheProto.CallOpts, arg0)
}

// OrderNum is a free data retrieval call binding the contract method 0x2f704382.
//
// Solidity: function OrderNum(address ) view returns(uint256)
func (_CacheProto *CacheProtoCaller) OrderNum(opts *bind.CallOpts, arg0 common.Address) (*big.Int, error) {
	var out []interface{}
	err := _CacheProto.contract.Call(opts, &out, "OrderNum", arg0)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// OrderNum is a free data retrieval call binding the contract method 0x2f704382.
//
// Solidity: function OrderNum(address ) view returns(uint256)
func (_CacheProto *CacheProtoSession) OrderNum(arg0 common.Address) (*big.Int, error) {
	return _CacheProto.Contract.OrderNum(&_CacheProto.CallOpts, arg0)
}

// OrderNum is a free data retrieval call binding the contract method 0x2f704382.
//
// Solidity: function OrderNum(address ) view returns(uint256)
func (_CacheProto *CacheProtoCallerSession) OrderNum(arg0 common.Address) (*big.Int, error) {
	return _CacheProto.Contract.OrderNum(&_CacheProto.CallOpts, arg0)
}

// RewardRecord is a free data retrieval call binding the contract method 0xeeca2ab6.
//
// Solidity: function RewardRecord(address ) view returns(uint256)
func (_CacheProto *CacheProtoCaller) RewardRecord(opts *bind.CallOpts, arg0 common.Address) (*big.Int, error) {
	var out []interface{}
	err := _CacheProto.contract.Call(opts, &out, "RewardRecord", arg0)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// RewardRecord is a free data retrieval call binding the contract method 0xeeca2ab6.
//
// Solidity: function RewardRecord(address ) view returns(uint256)
func (_CacheProto *CacheProtoSession) RewardRecord(arg0 common.Address) (*big.Int, error) {
	return _CacheProto.Contract.RewardRecord(&_CacheProto.CallOpts, arg0)
}

// RewardRecord is a free data retrieval call binding the contract method 0xeeca2ab6.
//
// Solidity: function RewardRecord(address ) view returns(uint256)
func (_CacheProto *CacheProtoCallerSession) RewardRecord(arg0 common.Address) (*big.Int, error) {
	return _CacheProto.Contract.RewardRecord(&_CacheProto.CallOpts, arg0)
}

// TermTotalOrder is a free data retrieval call binding the contract method 0xe97e23e6.
//
// Solidity: function TermTotalOrder(uint256 ) view returns(uint256)
func (_CacheProto *CacheProtoCaller) TermTotalOrder(opts *bind.CallOpts, arg0 *big.Int) (*big.Int, error) {
	var out []interface{}
	err := _CacheProto.contract.Call(opts, &out, "TermTotalOrder", arg0)

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// TermTotalOrder is a free data retrieval call binding the contract method 0xe97e23e6.
//
// Solidity: function TermTotalOrder(uint256 ) view returns(uint256)
func (_CacheProto *CacheProtoSession) TermTotalOrder(arg0 *big.Int) (*big.Int, error) {
	return _CacheProto.Contract.TermTotalOrder(&_CacheProto.CallOpts, arg0)
}

// TermTotalOrder is a free data retrieval call binding the contract method 0xe97e23e6.
//
// Solidity: function TermTotalOrder(uint256 ) view returns(uint256)
func (_CacheProto *CacheProtoCallerSession) TermTotalOrder(arg0 *big.Int) (*big.Int, error) {
	return _CacheProto.Contract.TermTotalOrder(&_CacheProto.CallOpts, arg0)
}

// TokenBonded is a free data retrieval call binding the contract method 0x7094d904.
//
// Solidity: function TokenBonded(uint256 ) view returns(bool)
func (_CacheProto *CacheProtoCaller) TokenBonded(opts *bind.CallOpts, arg0 *big.Int) (bool, error) {
	var out []interface{}
	err := _CacheProto.contract.Call(opts, &out, "TokenBonded", arg0)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// TokenBonded is a free data retrieval call binding the contract method 0x7094d904.
//
// Solidity: function TokenBonded(uint256 ) view returns(bool)
func (_CacheProto *CacheProtoSession) TokenBonded(arg0 *big.Int) (bool, error) {
	return _CacheProto.Contract.TokenBonded(&_CacheProto.CallOpts, arg0)
}

// TokenBonded is a free data retrieval call binding the contract method 0x7094d904.
//
// Solidity: function TokenBonded(uint256 ) view returns(bool)
func (_CacheProto *CacheProtoCallerSession) TokenBonded(arg0 *big.Int) (bool, error) {
	return _CacheProto.Contract.TokenBonded(&_CacheProto.CallOpts, arg0)
}

// GetCurrencyTerm is a free data retrieval call binding the contract method 0x6f0173b7.
//
// Solidity: function getCurrencyTerm() view returns(uint256)
func (_CacheProto *CacheProtoCaller) GetCurrencyTerm(opts *bind.CallOpts) (*big.Int, error) {
	var out []interface{}
	err := _CacheProto.contract.Call(opts, &out, "getCurrencyTerm")

	if err != nil {
		return *new(*big.Int), err
	}

	out0 := *abi.ConvertType(out[0], new(*big.Int)).(**big.Int)

	return out0, err

}

// GetCurrencyTerm is a free data retrieval call binding the contract method 0x6f0173b7.
//
// Solidity: function getCurrencyTerm() view returns(uint256)
func (_CacheProto *CacheProtoSession) GetCurrencyTerm() (*big.Int, error) {
	return _CacheProto.Contract.GetCurrencyTerm(&_CacheProto.CallOpts)
}

// GetCurrencyTerm is a free data retrieval call binding the contract method 0x6f0173b7.
//
// Solidity: function getCurrencyTerm() view returns(uint256)
func (_CacheProto *CacheProtoCallerSession) GetCurrencyTerm() (*big.Int, error) {
	return _CacheProto.Contract.GetCurrencyTerm(&_CacheProto.CallOpts)
}

// GetMessageHash is a free data retrieval call binding the contract method 0x512c91df.
//
// Solidity: function getMessageHash(address _account, uint256 _tokenId) pure returns(bytes32)
func (_CacheProto *CacheProtoCaller) GetMessageHash(opts *bind.CallOpts, _account common.Address, _tokenId *big.Int) ([32]byte, error) {
	var out []interface{}
	err := _CacheProto.contract.Call(opts, &out, "getMessageHash", _account, _tokenId)

	if err != nil {
		return *new([32]byte), err
	}

	out0 := *abi.ConvertType(out[0], new([32]byte)).(*[32]byte)

	return out0, err

}

// GetMessageHash is a free data retrieval call binding the contract method 0x512c91df.
//
// Solidity: function getMessageHash(address _account, uint256 _tokenId) pure returns(bytes32)
func (_CacheProto *CacheProtoSession) GetMessageHash(_account common.Address, _tokenId *big.Int) ([32]byte, error) {
	return _CacheProto.Contract.GetMessageHash(&_CacheProto.CallOpts, _account, _tokenId)
}

// GetMessageHash is a free data retrieval call binding the contract method 0x512c91df.
//
// Solidity: function getMessageHash(address _account, uint256 _tokenId) pure returns(bytes32)
func (_CacheProto *CacheProtoCallerSession) GetMessageHash(_account common.Address, _tokenId *big.Int) ([32]byte, error) {
	return _CacheProto.Contract.GetMessageHash(&_CacheProto.CallOpts, _account, _tokenId)
}

// IsTokenOwner is a free data retrieval call binding the contract method 0x98f7ceab.
//
// Solidity: function isTokenOwner(address acc, uint256 tokenId) view returns(bool)
func (_CacheProto *CacheProtoCaller) IsTokenOwner(opts *bind.CallOpts, acc common.Address, tokenId *big.Int) (bool, error) {
	var out []interface{}
	err := _CacheProto.contract.Call(opts, &out, "isTokenOwner", acc, tokenId)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// IsTokenOwner is a free data retrieval call binding the contract method 0x98f7ceab.
//
// Solidity: function isTokenOwner(address acc, uint256 tokenId) view returns(bool)
func (_CacheProto *CacheProtoSession) IsTokenOwner(acc common.Address, tokenId *big.Int) (bool, error) {
	return _CacheProto.Contract.IsTokenOwner(&_CacheProto.CallOpts, acc, tokenId)
}

// IsTokenOwner is a free data retrieval call binding the contract method 0x98f7ceab.
//
// Solidity: function isTokenOwner(address acc, uint256 tokenId) view returns(bool)
func (_CacheProto *CacheProtoCallerSession) IsTokenOwner(acc common.Address, tokenId *big.Int) (bool, error) {
	return _CacheProto.Contract.IsTokenOwner(&_CacheProto.CallOpts, acc, tokenId)
}

// OpenRecover is a free data retrieval call binding the contract method 0xb6a525cb.
//
// Solidity: function openRecover(bytes32 _msgHash, bytes _signature) view returns(address)
func (_CacheProto *CacheProtoCaller) OpenRecover(opts *bind.CallOpts, _msgHash [32]byte, _signature []byte) (common.Address, error) {
	var out []interface{}
	err := _CacheProto.contract.Call(opts, &out, "openRecover", _msgHash, _signature)

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// OpenRecover is a free data retrieval call binding the contract method 0xb6a525cb.
//
// Solidity: function openRecover(bytes32 _msgHash, bytes _signature) view returns(address)
func (_CacheProto *CacheProtoSession) OpenRecover(_msgHash [32]byte, _signature []byte) (common.Address, error) {
	return _CacheProto.Contract.OpenRecover(&_CacheProto.CallOpts, _msgHash, _signature)
}

// OpenRecover is a free data retrieval call binding the contract method 0xb6a525cb.
//
// Solidity: function openRecover(bytes32 _msgHash, bytes _signature) view returns(address)
func (_CacheProto *CacheProtoCallerSession) OpenRecover(_msgHash [32]byte, _signature []byte) (common.Address, error) {
	return _CacheProto.Contract.OpenRecover(&_CacheProto.CallOpts, _msgHash, _signature)
}

// RecoverSigner is a free data retrieval call binding the contract method 0x97aba7f9.
//
// Solidity: function recoverSigner(bytes32 _msgHash, bytes _signature) pure returns(address)
func (_CacheProto *CacheProtoCaller) RecoverSigner(opts *bind.CallOpts, _msgHash [32]byte, _signature []byte) (common.Address, error) {
	var out []interface{}
	err := _CacheProto.contract.Call(opts, &out, "recoverSigner", _msgHash, _signature)

	if err != nil {
		return *new(common.Address), err
	}

	out0 := *abi.ConvertType(out[0], new(common.Address)).(*common.Address)

	return out0, err

}

// RecoverSigner is a free data retrieval call binding the contract method 0x97aba7f9.
//
// Solidity: function recoverSigner(bytes32 _msgHash, bytes _signature) pure returns(address)
func (_CacheProto *CacheProtoSession) RecoverSigner(_msgHash [32]byte, _signature []byte) (common.Address, error) {
	return _CacheProto.Contract.RecoverSigner(&_CacheProto.CallOpts, _msgHash, _signature)
}

// RecoverSigner is a free data retrieval call binding the contract method 0x97aba7f9.
//
// Solidity: function recoverSigner(bytes32 _msgHash, bytes _signature) pure returns(address)
func (_CacheProto *CacheProtoCallerSession) RecoverSigner(_msgHash [32]byte, _signature []byte) (common.Address, error) {
	return _CacheProto.Contract.RecoverSigner(&_CacheProto.CallOpts, _msgHash, _signature)
}

// ToEthSignedMessageHash is a free data retrieval call binding the contract method 0x918a15cf.
//
// Solidity: function toEthSignedMessageHash(bytes32 hash) pure returns(bytes32)
func (_CacheProto *CacheProtoCaller) ToEthSignedMessageHash(opts *bind.CallOpts, hash [32]byte) ([32]byte, error) {
	var out []interface{}
	err := _CacheProto.contract.Call(opts, &out, "toEthSignedMessageHash", hash)

	if err != nil {
		return *new([32]byte), err
	}

	out0 := *abi.ConvertType(out[0], new([32]byte)).(*[32]byte)

	return out0, err

}

// ToEthSignedMessageHash is a free data retrieval call binding the contract method 0x918a15cf.
//
// Solidity: function toEthSignedMessageHash(bytes32 hash) pure returns(bytes32)
func (_CacheProto *CacheProtoSession) ToEthSignedMessageHash(hash [32]byte) ([32]byte, error) {
	return _CacheProto.Contract.ToEthSignedMessageHash(&_CacheProto.CallOpts, hash)
}

// ToEthSignedMessageHash is a free data retrieval call binding the contract method 0x918a15cf.
//
// Solidity: function toEthSignedMessageHash(bytes32 hash) pure returns(bytes32)
func (_CacheProto *CacheProtoCallerSession) ToEthSignedMessageHash(hash [32]byte) ([32]byte, error) {
	return _CacheProto.Contract.ToEthSignedMessageHash(&_CacheProto.CallOpts, hash)
}

// Verify is a free data retrieval call binding the contract method 0x823ac373.
//
// Solidity: function verify(bytes32 _msgHash, bytes _signature, address _signer) pure returns(bool)
func (_CacheProto *CacheProtoCaller) Verify(opts *bind.CallOpts, _msgHash [32]byte, _signature []byte, _signer common.Address) (bool, error) {
	var out []interface{}
	err := _CacheProto.contract.Call(opts, &out, "verify", _msgHash, _signature, _signer)

	if err != nil {
		return *new(bool), err
	}

	out0 := *abi.ConvertType(out[0], new(bool)).(*bool)

	return out0, err

}

// Verify is a free data retrieval call binding the contract method 0x823ac373.
//
// Solidity: function verify(bytes32 _msgHash, bytes _signature, address _signer) pure returns(bool)
func (_CacheProto *CacheProtoSession) Verify(_msgHash [32]byte, _signature []byte, _signer common.Address) (bool, error) {
	return _CacheProto.Contract.Verify(&_CacheProto.CallOpts, _msgHash, _signature, _signer)
}

// Verify is a free data retrieval call binding the contract method 0x823ac373.
//
// Solidity: function verify(bytes32 _msgHash, bytes _signature, address _signer) pure returns(bool)
func (_CacheProto *CacheProtoCallerSession) Verify(_msgHash [32]byte, _signature []byte, _signer common.Address) (bool, error) {
	return _CacheProto.Contract.Verify(&_CacheProto.CallOpts, _msgHash, _signature, _signer)
}

// CacheOrderPayment is a paid mutator transaction binding the contract method 0x5f6296f9.
//
// Solidity: function cacheOrderPayment(address nodeAcc) payable returns()
func (_CacheProto *CacheProtoTransactor) CacheOrderPayment(opts *bind.TransactOpts, nodeAcc common.Address) (*types.Transaction, error) {
	return _CacheProto.contract.Transact(opts, "cacheOrderPayment", nodeAcc)
}

// CacheOrderPayment is a paid mutator transaction binding the contract method 0x5f6296f9.
//
// Solidity: function cacheOrderPayment(address nodeAcc) payable returns()
func (_CacheProto *CacheProtoSession) CacheOrderPayment(nodeAcc common.Address) (*types.Transaction, error) {
	return _CacheProto.Contract.CacheOrderPayment(&_CacheProto.TransactOpts, nodeAcc)
}

// CacheOrderPayment is a paid mutator transaction binding the contract method 0x5f6296f9.
//
// Solidity: function cacheOrderPayment(address nodeAcc) payable returns()
func (_CacheProto *CacheProtoTransactorSession) CacheOrderPayment(nodeAcc common.Address) (*types.Transaction, error) {
	return _CacheProto.Contract.CacheOrderPayment(&_CacheProto.TransactOpts, nodeAcc)
}

// Claim is a paid mutator transaction binding the contract method 0x4e71d92d.
//
// Solidity: function claim() returns()
func (_CacheProto *CacheProtoTransactor) Claim(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _CacheProto.contract.Transact(opts, "claim")
}

// Claim is a paid mutator transaction binding the contract method 0x4e71d92d.
//
// Solidity: function claim() returns()
func (_CacheProto *CacheProtoSession) Claim() (*types.Transaction, error) {
	return _CacheProto.Contract.Claim(&_CacheProto.TransactOpts)
}

// Claim is a paid mutator transaction binding the contract method 0x4e71d92d.
//
// Solidity: function claim() returns()
func (_CacheProto *CacheProtoTransactorSession) Claim() (*types.Transaction, error) {
	return _CacheProto.Contract.Claim(&_CacheProto.TransactOpts)
}

// Exit is a paid mutator transaction binding the contract method 0xe9fad8ee.
//
// Solidity: function exit() returns()
func (_CacheProto *CacheProtoTransactor) Exit(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _CacheProto.contract.Transact(opts, "exit")
}

// Exit is a paid mutator transaction binding the contract method 0xe9fad8ee.
//
// Solidity: function exit() returns()
func (_CacheProto *CacheProtoSession) Exit() (*types.Transaction, error) {
	return _CacheProto.Contract.Exit(&_CacheProto.TransactOpts)
}

// Exit is a paid mutator transaction binding the contract method 0xe9fad8ee.
//
// Solidity: function exit() returns()
func (_CacheProto *CacheProtoTransactorSession) Exit() (*types.Transaction, error) {
	return _CacheProto.Contract.Exit(&_CacheProto.TransactOpts)
}

// OrderClaim is a paid mutator transaction binding the contract method 0x57b1d18f.
//
// Solidity: function orderClaim(bytes32 orderId) returns()
func (_CacheProto *CacheProtoTransactor) OrderClaim(opts *bind.TransactOpts, orderId [32]byte) (*types.Transaction, error) {
	return _CacheProto.contract.Transact(opts, "orderClaim", orderId)
}

// OrderClaim is a paid mutator transaction binding the contract method 0x57b1d18f.
//
// Solidity: function orderClaim(bytes32 orderId) returns()
func (_CacheProto *CacheProtoSession) OrderClaim(orderId [32]byte) (*types.Transaction, error) {
	return _CacheProto.Contract.OrderClaim(&_CacheProto.TransactOpts, orderId)
}

// OrderClaim is a paid mutator transaction binding the contract method 0x57b1d18f.
//
// Solidity: function orderClaim(bytes32 orderId) returns()
func (_CacheProto *CacheProtoTransactorSession) OrderClaim(orderId [32]byte) (*types.Transaction, error) {
	return _CacheProto.Contract.OrderClaim(&_CacheProto.TransactOpts, orderId)
}

// Staking is a paid mutator transaction binding the contract method 0x03533982.
//
// Solidity: function staking(address nodeAcc, address tokenAcc, uint256 tokenId, bytes _peerId, bytes _signature) payable returns()
func (_CacheProto *CacheProtoTransactor) Staking(opts *bind.TransactOpts, nodeAcc common.Address, tokenAcc common.Address, tokenId *big.Int, _peerId []byte, _signature []byte) (*types.Transaction, error) {
	return _CacheProto.contract.Transact(opts, "staking", nodeAcc, tokenAcc, tokenId, _peerId, _signature)
}

// Staking is a paid mutator transaction binding the contract method 0x03533982.
//
// Solidity: function staking(address nodeAcc, address tokenAcc, uint256 tokenId, bytes _peerId, bytes _signature) payable returns()
func (_CacheProto *CacheProtoSession) Staking(nodeAcc common.Address, tokenAcc common.Address, tokenId *big.Int, _peerId []byte, _signature []byte) (*types.Transaction, error) {
	return _CacheProto.Contract.Staking(&_CacheProto.TransactOpts, nodeAcc, tokenAcc, tokenId, _peerId, _signature)
}

// Staking is a paid mutator transaction binding the contract method 0x03533982.
//
// Solidity: function staking(address nodeAcc, address tokenAcc, uint256 tokenId, bytes _peerId, bytes _signature) payable returns()
func (_CacheProto *CacheProtoTransactorSession) Staking(nodeAcc common.Address, tokenAcc common.Address, tokenId *big.Int, _peerId []byte, _signature []byte) (*types.Transaction, error) {
	return _CacheProto.Contract.Staking(&_CacheProto.TransactOpts, nodeAcc, tokenAcc, tokenId, _peerId, _signature)
}

// CacheProtoClaimIterator is returned from FilterClaim and is used to iterate over the raw logs and unpacked data for Claim events raised by the CacheProto contract.
type CacheProtoClaimIterator struct {
	Event *CacheProtoClaim // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *CacheProtoClaimIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(CacheProtoClaim)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(CacheProtoClaim)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *CacheProtoClaimIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *CacheProtoClaimIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// CacheProtoClaim represents a Claim event raised by the CacheProto contract.
type CacheProtoClaim struct {
	NodeAcc common.Address
	Reward  *big.Int
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterClaim is a free log retrieval operation binding the contract event 0x47cee97cb7acd717b3c0aa1435d004cd5b3c8c57d70dbceb4e4458bbd60e39d4.
//
// Solidity: event Claim(address indexed nodeAcc, uint256 reward)
func (_CacheProto *CacheProtoFilterer) FilterClaim(opts *bind.FilterOpts, nodeAcc []common.Address) (*CacheProtoClaimIterator, error) {

	var nodeAccRule []interface{}
	for _, nodeAccItem := range nodeAcc {
		nodeAccRule = append(nodeAccRule, nodeAccItem)
	}

	logs, sub, err := _CacheProto.contract.FilterLogs(opts, "Claim", nodeAccRule)
	if err != nil {
		return nil, err
	}
	return &CacheProtoClaimIterator{contract: _CacheProto.contract, event: "Claim", logs: logs, sub: sub}, nil
}

// WatchClaim is a free log subscription operation binding the contract event 0x47cee97cb7acd717b3c0aa1435d004cd5b3c8c57d70dbceb4e4458bbd60e39d4.
//
// Solidity: event Claim(address indexed nodeAcc, uint256 reward)
func (_CacheProto *CacheProtoFilterer) WatchClaim(opts *bind.WatchOpts, sink chan<- *CacheProtoClaim, nodeAcc []common.Address) (event.Subscription, error) {

	var nodeAccRule []interface{}
	for _, nodeAccItem := range nodeAcc {
		nodeAccRule = append(nodeAccRule, nodeAccItem)
	}

	logs, sub, err := _CacheProto.contract.WatchLogs(opts, "Claim", nodeAccRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(CacheProtoClaim)
				if err := _CacheProto.contract.UnpackLog(event, "Claim", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseClaim is a log parse operation binding the contract event 0x47cee97cb7acd717b3c0aa1435d004cd5b3c8c57d70dbceb4e4458bbd60e39d4.
//
// Solidity: event Claim(address indexed nodeAcc, uint256 reward)
func (_CacheProto *CacheProtoFilterer) ParseClaim(log types.Log) (*CacheProtoClaim, error) {
	event := new(CacheProtoClaim)
	if err := _CacheProto.contract.UnpackLog(event, "Claim", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// CacheProtoExitIterator is returned from FilterExit and is used to iterate over the raw logs and unpacked data for Exit events raised by the CacheProto contract.
type CacheProtoExitIterator struct {
	Event *CacheProtoExit // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *CacheProtoExitIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(CacheProtoExit)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(CacheProtoExit)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *CacheProtoExitIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *CacheProtoExitIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// CacheProtoExit represents a Exit event raised by the CacheProto contract.
type CacheProtoExit struct {
	NodeAcc common.Address
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterExit is a free log retrieval operation binding the contract event 0x7c79e6e24ed041d1072d54523b53956f01b91b835f0490856370594d9d14470e.
//
// Solidity: event Exit(address indexed nodeAcc)
func (_CacheProto *CacheProtoFilterer) FilterExit(opts *bind.FilterOpts, nodeAcc []common.Address) (*CacheProtoExitIterator, error) {

	var nodeAccRule []interface{}
	for _, nodeAccItem := range nodeAcc {
		nodeAccRule = append(nodeAccRule, nodeAccItem)
	}

	logs, sub, err := _CacheProto.contract.FilterLogs(opts, "Exit", nodeAccRule)
	if err != nil {
		return nil, err
	}
	return &CacheProtoExitIterator{contract: _CacheProto.contract, event: "Exit", logs: logs, sub: sub}, nil
}

// WatchExit is a free log subscription operation binding the contract event 0x7c79e6e24ed041d1072d54523b53956f01b91b835f0490856370594d9d14470e.
//
// Solidity: event Exit(address indexed nodeAcc)
func (_CacheProto *CacheProtoFilterer) WatchExit(opts *bind.WatchOpts, sink chan<- *CacheProtoExit, nodeAcc []common.Address) (event.Subscription, error) {

	var nodeAccRule []interface{}
	for _, nodeAccItem := range nodeAcc {
		nodeAccRule = append(nodeAccRule, nodeAccItem)
	}

	logs, sub, err := _CacheProto.contract.WatchLogs(opts, "Exit", nodeAccRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(CacheProtoExit)
				if err := _CacheProto.contract.UnpackLog(event, "Exit", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseExit is a log parse operation binding the contract event 0x7c79e6e24ed041d1072d54523b53956f01b91b835f0490856370594d9d14470e.
//
// Solidity: event Exit(address indexed nodeAcc)
func (_CacheProto *CacheProtoFilterer) ParseExit(log types.Log) (*CacheProtoExit, error) {
	event := new(CacheProtoExit)
	if err := _CacheProto.contract.UnpackLog(event, "Exit", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// CacheProtoOrderPaymentIterator is returned from FilterOrderPayment and is used to iterate over the raw logs and unpacked data for OrderPayment events raised by the CacheProto contract.
type CacheProtoOrderPaymentIterator struct {
	Event *CacheProtoOrderPayment // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *CacheProtoOrderPaymentIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(CacheProtoOrderPayment)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(CacheProtoOrderPayment)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *CacheProtoOrderPaymentIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *CacheProtoOrderPaymentIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// CacheProtoOrderPayment represents a OrderPayment event raised by the CacheProto contract.
type CacheProtoOrderPayment struct {
	OrderId [32]byte
	NodeAcc common.Address
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterOrderPayment is a free log retrieval operation binding the contract event 0xd56b6efb3032698dabc9d765e5f94cfafbd4903326a2ae5c831b7da1bde226f0.
//
// Solidity: event OrderPayment(bytes32 indexed orderId, address indexed nodeAcc)
func (_CacheProto *CacheProtoFilterer) FilterOrderPayment(opts *bind.FilterOpts, orderId [][32]byte, nodeAcc []common.Address) (*CacheProtoOrderPaymentIterator, error) {

	var orderIdRule []interface{}
	for _, orderIdItem := range orderId {
		orderIdRule = append(orderIdRule, orderIdItem)
	}
	var nodeAccRule []interface{}
	for _, nodeAccItem := range nodeAcc {
		nodeAccRule = append(nodeAccRule, nodeAccItem)
	}

	logs, sub, err := _CacheProto.contract.FilterLogs(opts, "OrderPayment", orderIdRule, nodeAccRule)
	if err != nil {
		return nil, err
	}
	return &CacheProtoOrderPaymentIterator{contract: _CacheProto.contract, event: "OrderPayment", logs: logs, sub: sub}, nil
}

// WatchOrderPayment is a free log subscription operation binding the contract event 0xd56b6efb3032698dabc9d765e5f94cfafbd4903326a2ae5c831b7da1bde226f0.
//
// Solidity: event OrderPayment(bytes32 indexed orderId, address indexed nodeAcc)
func (_CacheProto *CacheProtoFilterer) WatchOrderPayment(opts *bind.WatchOpts, sink chan<- *CacheProtoOrderPayment, orderId [][32]byte, nodeAcc []common.Address) (event.Subscription, error) {

	var orderIdRule []interface{}
	for _, orderIdItem := range orderId {
		orderIdRule = append(orderIdRule, orderIdItem)
	}
	var nodeAccRule []interface{}
	for _, nodeAccItem := range nodeAcc {
		nodeAccRule = append(nodeAccRule, nodeAccItem)
	}

	logs, sub, err := _CacheProto.contract.WatchLogs(opts, "OrderPayment", orderIdRule, nodeAccRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(CacheProtoOrderPayment)
				if err := _CacheProto.contract.UnpackLog(event, "OrderPayment", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseOrderPayment is a log parse operation binding the contract event 0xd56b6efb3032698dabc9d765e5f94cfafbd4903326a2ae5c831b7da1bde226f0.
//
// Solidity: event OrderPayment(bytes32 indexed orderId, address indexed nodeAcc)
func (_CacheProto *CacheProtoFilterer) ParseOrderPayment(log types.Log) (*CacheProtoOrderPayment, error) {
	event := new(CacheProtoOrderPayment)
	if err := _CacheProto.contract.UnpackLog(event, "OrderPayment", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}

// CacheProtoStakingIterator is returned from FilterStaking and is used to iterate over the raw logs and unpacked data for Staking events raised by the CacheProto contract.
type CacheProtoStakingIterator struct {
	Event *CacheProtoStaking // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *CacheProtoStakingIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(CacheProtoStaking)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(CacheProtoStaking)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *CacheProtoStakingIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *CacheProtoStakingIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// CacheProtoStaking represents a Staking event raised by the CacheProto contract.
type CacheProtoStaking struct {
	NodeAcc common.Address
	TokenId *big.Int
	Raw     types.Log // Blockchain specific contextual infos
}

// FilterStaking is a free log retrieval operation binding the contract event 0xb831f69f1cebc12b23cd864ce5bfea2669d01956050a0147d71d418074559c21.
//
// Solidity: event Staking(address indexed nodeAcc, uint256 indexed tokenId)
func (_CacheProto *CacheProtoFilterer) FilterStaking(opts *bind.FilterOpts, nodeAcc []common.Address, tokenId []*big.Int) (*CacheProtoStakingIterator, error) {

	var nodeAccRule []interface{}
	for _, nodeAccItem := range nodeAcc {
		nodeAccRule = append(nodeAccRule, nodeAccItem)
	}
	var tokenIdRule []interface{}
	for _, tokenIdItem := range tokenId {
		tokenIdRule = append(tokenIdRule, tokenIdItem)
	}

	logs, sub, err := _CacheProto.contract.FilterLogs(opts, "Staking", nodeAccRule, tokenIdRule)
	if err != nil {
		return nil, err
	}
	return &CacheProtoStakingIterator{contract: _CacheProto.contract, event: "Staking", logs: logs, sub: sub}, nil
}

// WatchStaking is a free log subscription operation binding the contract event 0xb831f69f1cebc12b23cd864ce5bfea2669d01956050a0147d71d418074559c21.
//
// Solidity: event Staking(address indexed nodeAcc, uint256 indexed tokenId)
func (_CacheProto *CacheProtoFilterer) WatchStaking(opts *bind.WatchOpts, sink chan<- *CacheProtoStaking, nodeAcc []common.Address, tokenId []*big.Int) (event.Subscription, error) {

	var nodeAccRule []interface{}
	for _, nodeAccItem := range nodeAcc {
		nodeAccRule = append(nodeAccRule, nodeAccItem)
	}
	var tokenIdRule []interface{}
	for _, tokenIdItem := range tokenId {
		tokenIdRule = append(tokenIdRule, tokenIdItem)
	}

	logs, sub, err := _CacheProto.contract.WatchLogs(opts, "Staking", nodeAccRule, tokenIdRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(CacheProtoStaking)
				if err := _CacheProto.contract.UnpackLog(event, "Staking", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseStaking is a log parse operation binding the contract event 0xb831f69f1cebc12b23cd864ce5bfea2669d01956050a0147d71d418074559c21.
//
// Solidity: event Staking(address indexed nodeAcc, uint256 indexed tokenId)
func (_CacheProto *CacheProtoFilterer) ParseStaking(log types.Log) (*CacheProtoStaking, error) {
	event := new(CacheProtoStaking)
	if err := _CacheProto.contract.UnpackLog(event, "Staking", log); err != nil {
		return nil, err
	}
	event.Raw = log
	return event, nil
}
