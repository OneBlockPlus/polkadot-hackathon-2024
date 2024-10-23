// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./interfaces/ILayoutEligibilityVerifier.sol";
import "./interfaces/IGame.sol";

contract Game is IGame {
    mapping(address => UserInfo) public userStorage;

    ILayoutEligibilityVerifier layoutEligibilityVerifier;

    constructor(address _layoutEligibilityVerifier) {
        layoutEligibilityVerifier = ILayoutEligibilityVerifier(_layoutEligibilityVerifier);
    }

    function publishLayout(
        uint256 _rate,
        uint256 _storageAmount,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c
    ) public{
        require(layoutEligibilityVerifier.verifyProof(a, b, c, [_rate, _storageAmount]), "Invalid layout configuration!");
        userStorage[msg.sender].rate = _rate;
        userStorage[msg.sender].storageAmount = _storageAmount;
    }

    function getUserInfo(address _user) public view returns (uint256, uint256) {
        UserInfo memory info = userStorage[_user];
        return (info.rate, info.storageAmount);
    }
}
