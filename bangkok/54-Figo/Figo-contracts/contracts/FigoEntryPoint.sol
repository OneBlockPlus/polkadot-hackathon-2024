// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Import EntryPoint from the @account-abstraction package
import "@account-abstraction/contracts/core/EntryPoint.sol";

contract FigoEntryPoint is EntryPoint {
    constructor() EntryPoint() {}
}
