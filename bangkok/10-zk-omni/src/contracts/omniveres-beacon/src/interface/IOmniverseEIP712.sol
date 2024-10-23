// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import 'hardhat/console.sol';
import '../lib/Types.sol';

interface IOmniverseEIP712 {
    function verifySignature(
        Types.TxType txType,
        bytes calldata txData,
        address signer
    ) external view returns (bool);

    function eip712Domain()
        external
        view
        returns (
            bytes1 fields,
            string memory name,
            string memory version,
            uint256 chainId,
            address verifyingContract,
            bytes32 salt,
            uint256[] memory extensions
        );
}
