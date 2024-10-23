// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {SimpleDEX} from "../src/SimpleDEX.sol";
import {NoSandwichSwapPair} from "../src/NoSandwichSwapPair.sol";
import {MyERC20Mock} from "../src/MyERC20Mock.sol";

contract Compare is Test {
    uint256 constant SETTLEMENT_TIME_INTERVAL = 15 seconds;
    uint256 constant NUMBER_OF_FRAGMENTS = 10;

    uint256 constant INITIAL_BALANCE = 10000 ether;
    uint256 constant OPERATION_AMOUNT = 200 ether;
    uint256 constant INITIAL_MINT_BY_CONTRACT = 20000 ether;

    MyERC20Mock baseCurrency;
    MyERC20Mock quoteCurrency;
    SimpleDEX dex1;
    NoSandwichSwapPair dex2;

    address user1 = address(0x1);
    address user2 = address(0x2);
    address user3 = address(0x3);
    address attacker = address(0x4);

    address user1ContributeAddress;
    uint256 user1ContributeAmount;

    address user2ContributeAddress;
    uint256 user2ContributeAmount;

    address user3ContributeAddress;
    uint256 user3ContributeAmount;

    address attackerContributeAddress;
    uint256 attackerContributeAmount;

    function setUp() public {
        baseCurrency = new MyERC20Mock("base currency", "BASE", address(this));
        quoteCurrency = new MyERC20Mock("quote currency", "QUOTE", address(this));

        dex1 = new SimpleDEX(address(baseCurrency), address(quoteCurrency));
        dex2 = new NoSandwichSwapPair(
            address(baseCurrency), address(quoteCurrency), SETTLEMENT_TIME_INTERVAL, NUMBER_OF_FRAGMENTS
        );

        baseCurrency.mint(address(this), INITIAL_MINT_BY_CONTRACT);
        baseCurrency.approve(address(dex1), INITIAL_MINT_BY_CONTRACT / 2);
        baseCurrency.approve(address(dex2), INITIAL_MINT_BY_CONTRACT / 2);

        quoteCurrency.mint(address(this), INITIAL_MINT_BY_CONTRACT);
        quoteCurrency.approve(address(dex1), INITIAL_MINT_BY_CONTRACT / 2);
        quoteCurrency.approve(address(dex2), INITIAL_MINT_BY_CONTRACT / 2);

        dex1.addLiquidity(INITIAL_MINT_BY_CONTRACT / 2, INITIAL_MINT_BY_CONTRACT / 2);
        dex2.addLiquidity(INITIAL_MINT_BY_CONTRACT / 2, INITIAL_MINT_BY_CONTRACT / 2);

        baseCurrency.mint(user1, INITIAL_BALANCE);
        baseCurrency.mint(user2, INITIAL_BALANCE);
        baseCurrency.mint(user3, INITIAL_BALANCE);
        baseCurrency.mint(attacker, INITIAL_BALANCE);

        quoteCurrency.mint(user1, INITIAL_BALANCE);
        quoteCurrency.mint(user2, INITIAL_BALANCE);
        quoteCurrency.mint(user3, INITIAL_BALANCE);
        quoteCurrency.mint(attacker, INITIAL_BALANCE);

        vm.startPrank(user1);
        baseCurrency.approve(address(dex1), type(uint256).max);
        quoteCurrency.approve(address(dex1), type(uint256).max);
        baseCurrency.approve(address(dex2), type(uint256).max);
        quoteCurrency.approve(address(dex2), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(user2);
        baseCurrency.approve(address(dex1), type(uint256).max);
        quoteCurrency.approve(address(dex1), type(uint256).max);
        baseCurrency.approve(address(dex2), type(uint256).max);
        quoteCurrency.approve(address(dex2), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(user3);
        baseCurrency.approve(address(dex1), type(uint256).max);
        quoteCurrency.approve(address(dex1), type(uint256).max);
        baseCurrency.approve(address(dex2), type(uint256).max);
        quoteCurrency.approve(address(dex2), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(attacker);
        baseCurrency.approve(address(dex1), type(uint256).max);
        quoteCurrency.approve(address(dex1), type(uint256).max);
        baseCurrency.approve(address(dex2), type(uint256).max);
        quoteCurrency.approve(address(dex2), type(uint256).max);
        vm.stopPrank();

        user1ContributeAddress = address(quoteCurrency);
        user2ContributeAddress = address(quoteCurrency);
        user3ContributeAddress = address(baseCurrency);
        attackerContributeAddress = address(quoteCurrency);

        user1ContributeAmount = OPERATION_AMOUNT;
        user2ContributeAmount = OPERATION_AMOUNT;
        user3ContributeAmount = OPERATION_AMOUNT;
        attackerContributeAmount = OPERATION_AMOUNT;
    }

    function testTradeDex1() public {
        uint256 attackOldQuoteBalance = quoteCurrency.balanceOf(attacker);
        uint256 beginPrice = dex1.getPriceInWei();

        vm.startPrank(attacker);
        uint256 attackerBuyAmount = dex1.swap(address(quoteCurrency), attackerContributeAmount);
        vm.stopPrank();
        // console.log("current price: ", dex1.getPriceInWei());
        // console.log("current base reserve: ", dex1.reserve1());
        // console.log("current quote reserve: ", dex1.reserve2());
        // console.log("constant product k: ", dex1.getConstantProduct());
        // console.log("\n");

        vm.startPrank(user1);
        dex1.swap(user1ContributeAddress, user1ContributeAmount);
        vm.stopPrank();
        // console.log("current price: ", dex1.getPriceInWei());
        // console.log("current base reserve: ", dex1.reserve1());
        // console.log("current quote reserve: ", dex1.reserve2());
        // console.log("constant product k: ", dex1.getConstantProduct());
        // console.log("\n");

        vm.startPrank(user2);
        dex1.swap(user2ContributeAddress, user2ContributeAmount);
        vm.stopPrank();
        // console.log("current price: ", dex1.getPriceInWei());
        // console.log("current base reserve: ", dex1.reserve1());
        // console.log("current quote reserve: ", dex1.reserve2());
        // console.log("constant product k: ", dex1.getConstantProduct());
        // console.log("\n");

        vm.startPrank(attacker);
        dex1.swap(address(baseCurrency), attackerBuyAmount);
        vm.stopPrank();
        // console.log("current price: ", dex1.getPriceInWei());
        // console.log("current base reserve: ", dex1.reserve1());
        // console.log("current quote reserve: ", dex1.reserve2());
        // console.log("constant product k: ", dex1.getConstantProduct());
        // console.log("\n");

        vm.startPrank(user3);
        dex1.swap(user3ContributeAddress, user3ContributeAmount);
        vm.stopPrank();
        // console.log("current price: ", dex1.getPriceInWei());
        // console.log("current base reserve: ", dex1.reserve1());
        // console.log("current quote reserve: ", dex1.reserve2());
        // console.log("constant product k: ", dex1.getConstantProduct());
        // console.log("\n");

        uint256 attackNewQuoteBalance = quoteCurrency.balanceOf(attacker);
        uint256 endPrice = dex1.getPriceInWei();
        console.log(
            "DEX1 MEV Profit = ",
            calculatePercentage(attackNewQuoteBalance - attackOldQuoteBalance, OPERATION_AMOUNT, 3)
        );
        // console.log("DEX1 Price Impact = ", calculatePercentage(abs(beginPrice, endPrice), beginPrice, 3));
        // console.log(
        //     "attackOldQuoteBalance = ",
        //     attackOldQuoteBalance / 1 ether,
        //     " ether"
        // );
        // console.log(
        //     "attackNewQuoteBalance = ",
        //     attackNewQuoteBalance / 1 ether,
        //     " ether"
        // );
    }

    function testTradeDex2() public {
        uint256 attakcOldBaseBalance = baseCurrency.balanceOf(attacker);
        uint256 attackOldQuoteBalance = quoteCurrency.balanceOf(attacker);

        uint256 beginPrice = dex2.getPrice();

        //////////////////////////////////////

        vm.startPrank(attacker);
        dex2.addSwapTransaction(address(quoteCurrency), OPERATION_AMOUNT);
        vm.stopPrank();

        vm.prank(user1);
        dex2.addSwapTransaction(address(quoteCurrency), OPERATION_AMOUNT);
        vm.stopPrank();

        vm.warp(block.timestamp + SETTLEMENT_TIME_INTERVAL + 1);

        vm.prank(user2);
        dex2.addSwapTransaction(address(quoteCurrency), OPERATION_AMOUNT);
        vm.stopPrank();

        uint256 attakcNewBaseBalance = baseCurrency.balanceOf(attacker);
        uint256 baseReadyToSell = attakcNewBaseBalance - attakcOldBaseBalance;

        /////////////////////////////////////

        vm.prank(attacker);
        dex2.addSwapTransaction(address(baseCurrency), baseReadyToSell);
        vm.stopPrank();

        vm.warp(block.timestamp + SETTLEMENT_TIME_INTERVAL + 1);

        vm.prank(user3);
        dex2.addSwapTransaction(address(baseCurrency), OPERATION_AMOUNT);
        vm.stopPrank();

        //////////////////////////////////////

        uint256 endPrice = dex2.getPrice();

        uint256 attackNewQuoteBalance = quoteCurrency.balanceOf(attacker);
        console.log(
            "DEX2 MEV Profit = ",
            calculatePercentage(attackNewQuoteBalance - attackOldQuoteBalance, OPERATION_AMOUNT, 3)
        );
        // console.log("DEX2 Price Impact = ", calculatePercentage(abs(beginPrice, endPrice), beginPrice, 3));
        // console.log(
        //     "attackOldQuoteBalance = ",
        //     attackOldQuoteBalance / 1 ether,
        //     " ether"
        // );
        // console.log(
        //     "attackNewQuoteBalance = ",
        //     attackNewQuoteBalance / 1 ether,
        //     " ether"
        // );
    }

    function calculatePercentage(uint256 numerator, uint256 denominator, uint8 decimalPlaces)
        public
        pure
        returns (string memory)
    {
        require(denominator > 0, "Denominator cannot be zero");

        // 扩大分子，以便计算小数位
        uint256 factor = 10 ** decimalPlaces;
        uint256 percentage = (numerator * 100 * factor) / denominator;

        // 计算整数部分和小数部分
        uint256 integerPart = percentage / factor;
        uint256 decimalPart = percentage % factor;

        // 将结果转换为字符串
        string memory integerString = uintToString(integerPart);
        string memory decimalString = uintToString(decimalPart);

        // 拼接整数、小数部分，并加上百分号
        return string(abi.encodePacked(integerString, ".", padLeftZeros(decimalString, decimalPlaces), "%"));
    }

    // 帮助函数：将 uint 转换为字符串
    function uintToString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }

    // 帮助函数：给小数部分补齐位数（不足的部分补0）
    function padLeftZeros(string memory str, uint8 length) internal pure returns (string memory) {
        bytes memory strBytes = bytes(str);
        if (strBytes.length >= length) {
            return str;
        }
        bytes memory padded = new bytes(length);
        uint256 paddingSize = length - strBytes.length;
        for (uint256 i = 0; i < paddingSize; i++) {
            padded[i] = "0";
        }
        for (uint256 i = 0; i < strBytes.length; i++) {
            padded[paddingSize + i] = strBytes[i];
        }
        return string(padded);
    }

    function abs(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a - b : b - a;
    }
}
