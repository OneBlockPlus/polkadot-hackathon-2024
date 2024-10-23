// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// import '@openzeppelin/contracts/access/Ownable.sol';
import './OmniverseToken.sol';

contract OmniverseTokenFactory {
    function createOmniverseToken(
        bytes32 assetId,
        IOmniverseBeacon beacon
    ) external returns (address) {
        OmniverseToken omniToken = new OmniverseToken({
            assetId: assetId,
            beacon: beacon
        });
        address omniTokenAddress = address(omniToken);
        return omniTokenAddress;
    }
}
