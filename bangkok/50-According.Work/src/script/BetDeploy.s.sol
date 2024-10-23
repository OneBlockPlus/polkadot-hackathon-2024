// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Bet} from "../src/Bet.sol";
import {Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";
import {console} from "forge-std/console.sol";

contract BetScript is Script {
    function setUp() public {}

    function run() public {

        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address ownerAddress = vm.addr(deployerPrivateKey);

        console.log("Deploy owner address: %s", ownerAddress);

        vm.startBroadcast(deployerPrivateKey);

        Upgrades.deployUUPSProxy(
            "Bet.sol:Bet",
            abi.encodeCall(
                Bet.initialize,
                (ownerAddress)
            )
        );

        vm.stopBroadcast();
    }
}
