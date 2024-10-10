// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {ERC2771Context} from "@gelatonetwork/relay-context/contracts/vendor/ERC2771Context.sol";

// Importing ERC2771Context gives access to:
// 1. An immutable trusted forwarder address
// 2. function isTrustedForwarder
//    to verify an input address matches the trustedForwarder address
// 3. function _msgSender()
//    which decodes the user's address from the calldata
//    _msgSender() can now be used to refer to user safely
//    instead of msg.sender (which is Gelato Relay in this case).
// 4. function _msgData()
//    which decodes the function signature from the calldata
contract CounterERC2771 is ERC2771Context {
    // Here we have a mapping that maps a counter to an address
    mapping(address => uint256) public contextCounter;

    event IncrementCounter(address _msgSender);

    // ERC2771Context: setting the immutable trustedForwarder variable
    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {}

    // `incrementContext` is the target function to call
    // This function increments a counter variable which is
    // mapped to every _msgSender(), the address of the user.
    // This way each user off-chain has their own counter
    // variable on-chain.
    function increment() external {
        // Remember that with the context shift of relaying,
        // where we would use `msg.sender` before,
        // this now refers to Gelato Relay's address,
        // and to find the address of the user,
        // which has been verified using a signature,
        // please use _msgSender()!

        // If this contract was not not called by the
        // trusted forwarder, _msgSender() will simply return
        // the value of msg.sender instead.

        // Incrementing the counter mapped to the _msgSender!
        contextCounter[_msgSender()]++;

        // Emitting an event for testing purposes
        emit IncrementCounter(_msgSender());
    }
}
