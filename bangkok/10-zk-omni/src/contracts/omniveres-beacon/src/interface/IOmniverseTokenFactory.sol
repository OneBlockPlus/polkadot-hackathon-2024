// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import './IOmniverseBeacon.sol';

interface IOmniverseTokenFactory {
    function createOmniverseToken(
        bytes32 assetId,
        IOmniverseBeacon beacon
    ) external returns (address);
}
