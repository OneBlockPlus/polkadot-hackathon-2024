// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// import "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import './lib/EnumerableUTXOMap.sol';
import './lib/Types.sol';
import './lib/Utils.sol';
import './interface/IOmniverseEIP712.sol';
import './interface/IOmniverseTokenFactory.sol';
import './interface/IZKVerifier.sol';
import './interface/IOmniverseSysConfig.sol';

contract Storage {
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.AddressSet;

    IOmniverseSysConfig systemConfig;
    IOmniverseEIP712 signatureVerifier;
    IOmniverseTokenFactory factory;
    IZKVerifier zkVerifier;

    mapping(bytes32 => bool) UTXOSet;
    mapping(bytes32 => Types.Token) tokens;
    // assetId => contract address
    mapping(bytes32 => address) omniTokenAddress;

    // assetId => omniAddress => amount
    mapping(bytes32 => mapping(bytes32 => uint128)) _balances;

    mapping(bytes32 => bool) _txid;

    mapping(address => bytes32) _addresses;

    mapping(bytes32 => Types.AATransformer) aaTransformer;

    EnumerableSet.AddressSet submitter;

    address governor;
    bytes32 _synchronizer;
    uint256 totalTxid;
}
