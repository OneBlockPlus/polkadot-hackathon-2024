// SPDX-License-Identifier: LibMarket
pragma solidity ^0.8.20;

import "./Ownable2Step.sol";

// contract Ownable {
//     address public owner;

//     event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

//     constructor() {
//         owner = msg.sender;
//         emit OwnershipTransferred(address(0), msg.sender);
//     }

//     modifier onlyOwner() {
//         require(owner == msg.sender, "Ownable: caller is not the owner");
//         _;
//     }

//     function transferOwnership(address newOwner) public onlyOwner {
//         require(newOwner != address(0), "Ownable: new owner is the zero address");
//         emit OwnershipTransferred(owner, newOwner);
//         owner = newOwner;
//     }
// }


/**
 * 定义owner 用来暂停或者开放合约用于整个系统的开放和关闭
 */

contract Pausable is Ownable2Step {
    bool public paused;

    event Paused(address account);
    event Unpaused(address account);

    constructor() {
        paused = false;
    }

    modifier whenNotPaused() {
        require(!paused, "Pausable: paused");
        _;
    }

    modifier whenPaused() {
        require(paused, "Pausable: not paused");
         _;
    }

    function pause() public onlyOwner whenNotPaused {
        paused = true;
        emit Paused(msg.sender);
    }

    function unpause() public onlyOwner whenPaused {
        paused = false;
        emit Unpaused(msg.sender);
    }
}