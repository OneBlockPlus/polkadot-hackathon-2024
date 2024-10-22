// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {Upgrades} from "openzeppelin-foundry-upgrades/Upgrades.sol";
import {Options} from "openzeppelin-foundry-upgrades/Options.sol";
import {console} from "forge-std/console.sol";

contract BetScript is Script {
    function setUp() public {}

    function run() public {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address ownerAddress = vm.addr(deployerPrivateKey);

        string memory proxy_address_str = vm.envString("PROXY_ADDRESS");
        address proxy_address = address(
            uint160(bytes20(vm.parseAddress(proxy_address_str)))
        );

        console.log(
            "Deploy owner address: %s, proxy address: %s",
            ownerAddress,
            proxy_address
        );

        vm.startBroadcast(deployerPrivateKey);

        Options memory opts;
        opts.referenceContract = "Bet.sol:Bet";

        // replace name of new contract.
        Upgrades.upgradeProxy(proxy_address, "BetV2.sol:Bet", "", opts);

        vm.stopBroadcast();
    }
}
