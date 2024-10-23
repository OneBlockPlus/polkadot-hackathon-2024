// SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

import '../lib/Types.sol';

contract MockZKVerifier {
    function latestBatchProof() public pure returns (Types.BatchState memory) {
        return
            Types.BatchState(
                Types.BatchProofData(
                    5,
                    Types.TxLocation(20, 60),
                    Types.TxLocation(21, 80)
                ),
                20,
                bytes32(0),
                bytes32(0),
                bytes32(0)
            );
    }
}
