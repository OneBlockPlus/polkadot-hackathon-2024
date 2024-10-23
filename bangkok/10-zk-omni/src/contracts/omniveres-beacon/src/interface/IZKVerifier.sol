// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import '../lib/Types.sol';

interface IZKVerifier {
    function latestBatchProof() external view returns (Types.BatchState memory);
}
