// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {AccessIdentities} from "../../contracts/AccessIdentities.sol";
import "forge-std/src/Script.sol";

contract DeployAccessIdentities is Script {
    uint256 deployerPrivateKey;

    function setUp() public {
        deployerPrivateKey = vm.envUint("PRIVATE_KEY");
    }

    function run() public {
        vm.startBroadcast(deployerPrivateKey);
        new AccessIdentities();
        vm.stopBroadcast();
    }
}
