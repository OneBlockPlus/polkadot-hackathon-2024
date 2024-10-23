// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGame {
    struct UserInfo {
        uint256 rate;
        uint256 storageAmount;
    }

    function publishLayout(
        uint256 _rate,
        uint256 _storageAmount,
        uint256[2] memory a,
        uint256[2][2] memory b,
        uint256[2] memory c
    ) external;

    function getUserInfo(address _user) external view returns (uint256, uint256);
}
