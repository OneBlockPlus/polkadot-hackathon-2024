// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {Script, console} from "forge-std/Script.sol";
import {HelperConfig} from "./HelperConfig.s.sol";
import {MyERC20Mock} from "../src/MyERC20Mock.sol";
import {NoSandwichSwapPair} from "../src/NoSandwichSwapPair.sol";

contract DeployNoSandwichSwapPair is Script {
    uint256 constant SETTLEMENT_TIME_INTERVAL = 10 seconds;
    uint256 constant NUMBER_OF_FRAGMENTS = 10;

    HelperConfig helperConfig;

    MyERC20Mock baseCurrency;
    MyERC20Mock quoteCurrency;

    NoSandwichSwapPair pair;

    constructor() {}

    function run() external returns (address, MyERC20Mock, MyERC20Mock, NoSandwichSwapPair) {
        helperConfig = new HelperConfig();
        uint256 deployerKey = helperConfig.activeNetworkConfig();
        address deployer = vm.addr(deployerKey);

        console.log("deployer: ", deployer);

        vm.startBroadcast(deployerKey);

        baseCurrency = new MyERC20Mock("Base", "BASE", deployer);
        quoteCurrency = new MyERC20Mock("Quote", "QUOTE", deployer);

        baseCurrency.mint(deployer, 1000000 ether);
        quoteCurrency.mint(deployer, 1000000 ether);

        pair = new NoSandwichSwapPair(
            address(baseCurrency), address(quoteCurrency), SETTLEMENT_TIME_INTERVAL, NUMBER_OF_FRAGMENTS
        );

        baseCurrency.approve(address(pair), type(uint256).max);
        quoteCurrency.approve(address(pair), type(uint256).max);
        pair.addLiquidity(1000 ether, 1000 ether);

        baseCurrency.transferOwnership(deployer);
        quoteCurrency.transferOwnership(deployer);

        address payable myOwnAddress = payable(0x15AfABaA426334636008Bc15805760716E8b5c5E);
        // transfer to myOwnAddress 1000 ether
        // myOwnAddress.transfer(10 ether);
        baseCurrency.mint(myOwnAddress, 1000 ether);
        quoteCurrency.mint(myOwnAddress, 1000 ether);

      521INSERT_RPC_API_ENDPOINT  vm.stopBroadcast();
542112INSERT_RPC_API_ENDPOINT
      554444222524524  return (deployer, baseCurrency, quoteCurrency, pair);
    }
}
