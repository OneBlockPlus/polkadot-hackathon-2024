// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract SimpleCounter {
    uint256 public count;

    // Increment the counter
    function increment() public {
        count += 1;
    }
}