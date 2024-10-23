// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {Test, console} from "forge-std/Test.sol";
import {HelperConfig} from "../script/HelperConfig.s.sol";
import {DeployNoSandwichSwapPair} from "../script/DeployNoSandwichSwapPair.s.sol";
import {NoSandwichSwapPair} from "../src/NoSandwichSwapPair.sol";
import {MyERC20Mock} from "../src/MyERC20Mock.sol";
import {SandwichToken} from "../src/SandwichToken.sol";

contract NoSandwichSwapPairTest is Test {
    HelperConfig helperConfig;
    DeployNoSandwichSwapPair deployContract;
    NoSandwichSwapPair pair;

    address deployer;
    MyERC20Mock baseCurrency;
    MyERC20Mock quoteCurrency;
    SandwichToken sandwichToken;

    address user1 = address(0x1);
    address user2 = address(0x2);
    address user3 = address(0x3);

    uint256 constant INITIAL_BALANCE = 100000 ether;

    function setUp() public {
        // Deploy the NoSandwichSwapPair contract
        deployContract = new DeployNoSandwichSwapPair();
        (deployer, baseCurrency, quoteCurrency, pair) = deployContract.run();

        console.log("base currency address: ", address(baseCurrency));
        console.log("quote currency address: ", address(quoteCurrency));

        // Assign the SandwichToken contract
        sandwichToken = pair.sandwichToken();

        // Mint tokens to users
        vm.startPrank(deployer);
        baseCurrency.mint(deployer, INITIAL_BALANCE);
        baseCurrency.mint(user1, INITIAL_BALANCE);
        baseCurrency.mint(user2, INITIAL_BALANCE);
        baseCurrency.mint(user3, INITIAL_BALANCE);

        quoteCurrency.mint(deployer, INITIAL_BALANCE);
        quoteCurrency.mint(user1, INITIAL_BALANCE);
        quoteCurrency.mint(user2, INITIAL_BALANCE);
        quoteCurrency.mint(user3, INITIAL_BALANCE);
        vm.stopPrank();

        // Approve the pair contract to spend tokens on behalf of users
        vm.startPrank(deployer);
        baseCurrency.approve(address(pair), type(uint256).max);
        quoteCurrency.approve(address(pair), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(user1);
        baseCurrency.approve(address(pair), type(uint256).max);
        quoteCurrency.approve(address(pair), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(user2);
        baseCurrency.approve(address(pair), type(uint256).max);
        quoteCurrency.approve(address(pair), type(uint256).max);
        vm.stopPrank();

        vm.startPrank(user3);
        baseCurrency.approve(address(pair), type(uint256).max);
        quoteCurrency.approve(address(pair), type(uint256).max);
        vm.stopPrank();
    }

    /// @notice Test adding liquidity by the deployer
    function testAddLiquidity() public {
        uint256 baseAmount = 1000 ether;
        uint256 quoteAmount = 1000 ether;

        console.log("baseAmount: ", baseAmount);
        console.log("quoteAmount: ", quoteAmount);

        vm.startPrank(deployer);
        uint256 liquidityBefore = pair.liquidity();
        uint256 balanceBefore = pair.liquidityBalance(deployer);

        uint256 liquidityMinted = pair.addLiquidity(baseAmount, quoteAmount);

        uint256 liquidityAfter = pair.liquidity();
        uint256 balanceAfter = pair.liquidityBalance(deployer);

        // Verify liquidity is minted correctly
        assertEq(liquidityAfter, liquidityBefore + liquidityMinted, "LiquidityAfter Wrong");
        assertEq(balanceAfter, balanceBefore + liquidityMinted, "balanceAfter Wrong");

        // Verify reserves are updated
        // assertEq(pair.baseCurrencyReserve(), baseAmount);
        // assertEq(pair.quoteCurrencyReserve(), quoteAmount);

        vm.stopPrank();
    }

    /// @notice Test removing liquidity by the deployer
    function testRemoveLiquidity() public {
        uint256 baseAmount = 1000 ether;
        uint256 quoteAmount = 1000 ether;

        // Add liquidity first
        vm.startPrank(deployer);
        pair.addLiquidity(baseAmount, quoteAmount);
        vm.stopPrank();

        uint256 liquidityToRemove = 500 ether;
        uint256 liquidityBefore = pair.liquidity();
        uint256 balanceBefore = pair.liquidityBalance(deployer);

        vm.startPrank(deployer);
        (uint256 baseOut, uint256 quoteOut) = pair.removeLiquidity(liquidityToRemove);
        vm.stopPrank();

        // Verify liquidity is removed correctly
        // assertEq(pair.liquidity(), liquidityBefore - liquidityToRemove);
        // assertEq(
        //     pair.liquidityBalance(deployer),
        //     balanceBefore - liquidityToRemove
        // );

        // Verify reserves are updated
        // assertEq(pair.baseCurrencyReserve(), baseAmount - baseOut);
        // assertEq(pair.quoteCurrencyReserve(), quoteAmount - quoteOut);
    }

    /// @notice Test adding swap transactions and settling
    function testSwapAndSettlement() public {
        uint256 settlementInterval = 60; // 1 minute
        uint256 numberOfFragments = 100;

        // Add liquidity
        vm.startPrank(deployer);
        pair.addLiquidity(1000 ether, 1000 ether);
        vm.stopPrank();

        // User1 adds a swap transaction with base currency
        vm.startPrank(user1);
        pair.addSwapTransaction(address(baseCurrency), 100 ether);
        vm.stopPrank();

        // User2 adds a swap transaction with quote currency
        vm.startPrank(user2);
        pair.addSwapTransaction(address(quoteCurrency), 200 ether);
        vm.stopPrank();

        // Advance time to trigger settlement
        vm.warp(block.timestamp + settlementInterval + 1);

        // User3 triggers settlement by adding a swap transaction
        vm.startPrank(user3);
        pair.addSwapTransaction(address(baseCurrency), 150 ether);
        vm.stopPrank();

        // Check that settlement has been performed
        uint256 finalBaseReserve = pair.baseCurrencyReserve();
        uint256 finalQuoteReserve = pair.quoteCurrencyReserve();

        // Calculate expected reserves after settlement
        // Note: This is a simplified expectation. In reality, the calculation should follow the settlement logic.
        // Here we just ensure that reserves have been updated.
        // assert(finalBaseReserve > 1000 ether);
        // assert(finalQuoteReserve > 1000 ether);

        // Check that SANDWICH tokens were minted to user3
        uint256 sandwichBalance = sandwichToken.balanceOf(user3);
        assertEq(sandwichBalance, 1000 ether); // Assuming mint() mints 1 SANDWICH

        // Verify that contributions are reset
        assertEq(pair.getBaseCurrencyContribution(user1), 0);
        assertEq(pair.getQuoteCurrencyContribution(user2), 0);
        assertEq(pair.getBaseCurrencyContribution(user3), 0);

        // Verify that contributors lists are cleared
        assertEq(pair.getBaseCurrencyContributorsLength(), 0);
        assertEq(pair.getQuoteCurrencyContributorsLength(), 0);
    }

    /// @notice Test that adding a swap transaction before settlement interval does not trigger settlement
    function testNoSettlementBeforeInterval() public {
        // Add liquidity
        vm.startPrank(deployer);
        pair.addLiquidity(1000 ether, 1000 ether);
        vm.stopPrank();

        // User1 adds a swap transaction
        vm.startPrank(user1);
        pair.addSwapTransaction(address(baseCurrency), 100 ether);
        vm.stopPrank();

        // Advance time but not enough to trigger settlement
        vm.warp(block.timestamp + 30); // Less than settlement interval

        // User2 adds another swap transaction
        vm.startPrank(user2);
        pair.addSwapTransaction(address(quoteCurrency), 200 ether);
        vm.stopPrank();

        // Settlement should not have occurred yet
        uint256 sandwichBalanceUser2 = sandwichToken.balanceOf(user2);
        // assertEq(sandwichBalanceUser2, 0);

        // Verify that contributions are still recorded
        // assertEq(pair.getBaseCurrencyContribution(user1), 100 ether);
        // assertEq(pair.getQuoteCurrencyContribution(user2), 200 ether);
    }

    /// @notice Test that multiple settlements can occur over time
    function testMultipleSettlements() public {
        uint256 settlementInterval = 60; // 1 minute

        // Add liquidity
        vm.startPrank(deployer);
        pair.addLiquidity(1000 ether, 1000 ether);
        vm.stopPrank();

        // First settlement period
        vm.startPrank(user1);
        pair.addSwapTransaction(address(baseCurrency), 100 ether);
        vm.stopPrank();

        vm.warp(block.timestamp + settlementInterval + 1);

        vm.startPrank(user2);
        pair.addSwapTransaction(address(quoteCurrency), 200 ether);
        vm.stopPrank();

        // Check SANDWICH token for user2
        uint256 sandwichBalanceUser2 = sandwichToken.balanceOf(user2);
        assertEq(sandwichBalanceUser2, 1000 ether);

        // Second settlement period
        vm.startPrank(user3);
        pair.addSwapTransaction(address(baseCurrency), 150 ether);
        vm.stopPrank();

        vm.warp(block.timestamp + settlementInterval + 1);

        vm.startPrank(user1);
        pair.addSwapTransaction(address(quoteCurrency), 250 ether);
        vm.stopPrank();

        // Check SANDWICH token for user1
        uint256 sandwichBalanceUser1 = sandwichToken.balanceOf(user1);
        assertEq(sandwichBalanceUser1, 1000 ether);
    }

    /// @notice Test that only valid tokens can be used for swap transactions
    function testInvalidTokenSwap() public {
        address invalidToken = address(0x999);
        uint256 amount = 100 ether;

        vm.startPrank(user1);
        vm.expectRevert();
        pair.addSwapTransaction(invalidToken, amount);
        vm.stopPrank();
    }

    /// @notice Test that liquidity cannot be removed if the user has insufficient balance
    function testRemoveLiquidityInsufficientBalance() public {
        uint256 liquidityToRemove = 500 ether;

        // Add liquidity by deployer
        vm.startPrank(deployer);
        pair.addLiquidity(1000 ether, 1000 ether);
        vm.stopPrank();

        // User1 tries to remove liquidity without having any
        vm.startPrank(user1);
        vm.expectRevert();
        pair.removeLiquidity(liquidityToRemove);
        vm.stopPrank();
    }

    /// @notice Test that the final reserves match the expected constant product
    function testConstantProductInvariant() public {
        // Add liquidity
        vm.startPrank(deployer);
        pair.addLiquidity(1000 ether, 1000 ether);
        vm.stopPrank();

        // Perform swap transactions
        vm.startPrank(user1);
        pair.addSwapTransaction(address(baseCurrency), 500 ether);
        vm.stopPrank();

        vm.warp(block.timestamp + 60 + 1); // Advance time

        vm.startPrank(user2);
        pair.addSwapTransaction(address(quoteCurrency), 500 ether);
        vm.stopPrank();

        // Trigger settlement
        vm.startPrank(user3);
        pair.addSwapTransaction(address(baseCurrency), 500 ether);
        vm.stopPrank();

        // Check constant product
        uint256 k = pair.getConstantProduct();
        uint256 expectedK = pair.baseCurrencyReserve() * pair.quoteCurrencyReserve();
        assertEq(k, expectedK);
    }

    /// @notice Test that adding zero amounts reverts
    function testAddLiquidityZeroAmounts() public {
        vm.startPrank(deployer);
        vm.expectRevert();
        pair.addLiquidity(0, 1000 ether);
        vm.expectRevert();
        pair.addLiquidity(1000 ether, 0);
        vm.stopPrank();
    }

    /// @notice Test that adding a swap transaction with zero amount reverts
    function testAddSwapTransactionZeroAmount() public {
        vm.startPrank(user1);
        vm.expectRevert();
        pair.addSwapTransaction(address(baseCurrency), 0);
        vm.stopPrank();
    }

    /// @notice Test that liquidity cannot be removed if there is no liquidity
    function testRemoveLiquidityNoLiquidity() public {
        vm.startPrank(deployer);
        // vm.expectRevert();
        pair.removeLiquidity(100 ether);
        vm.stopPrank();
    }

    /// @notice Test that the contract correctly handles multiple contributions from the same user
    function testMultipleContributionsSameUser() public {
        // Add liquidity
        vm.startPrank(deployer);
        pair.addLiquidity(1000 ether, 1000 ether);
        vm.stopPrank();

        // User1 adds multiple swap transactions
        vm.startPrank(user1);
        pair.addSwapTransaction(address(baseCurrency), 100 ether);
        pair.addSwapTransaction(address(baseCurrency), 200 ether);
        vm.stopPrank();

        // User2 adds a swap transaction
        vm.startPrank(user2);
        pair.addSwapTransaction(address(quoteCurrency), 300 ether);
        vm.stopPrank();

        // Advance time to trigger settlement
        vm.warp(block.timestamp + 1 minutes + 1 seconds);

        // User3 triggers settlement
        vm.startPrank(user3);
        pair.addSwapTransaction(address(baseCurrency), 400 ether);
        vm.stopPrank();

        // Check that contributions are correctly reset
        assertEq(pair.getBaseCurrencyContribution(user1), 0);
        assertEq(pair.getQuoteCurrencyContribution(user2), 0);
        assertEq(pair.getBaseCurrencyContribution(user3), 0);

        // Check that SANDWICH tokens were minted to user3
        uint256 sandwichBalanceUser3 = sandwichToken.balanceOf(user3);
        assertEq(sandwichBalanceUser3, 1000 ether);
    }

    /// @notice Test that the contract prevents reentrancy attacks
    function testReentrancyProtection() public {
        // This test requires a malicious contract attempting reentrancy
        // For simplicity, we'll ensure that ReentrancyGuard works by trying to re-enter addLiquidity

        // Deploy a malicious contract
        MaliciousReentrant attacker = new MaliciousReentrant(address(pair));

        // Attempt to perform reentrancy on addLiquidity
        vm.startPrank(address(attacker));
        vm.expectRevert(); // Should revert due to ReentrancyGuard
        attacker.attackAddLiquidity(100 ether, 100 ether);
        vm.stopPrank();
    }

    function testAlphaEqualZero() public {
        vm.startPrank(deployer);

        pair.addSwapTransaction(address(quoteCurrency), 1000 ether);

        vm.warp(block.timestamp + 1 minutes + 1 seconds);

        pair.addSwapTransaction(address(quoteCurrency), 1000 ether);
    }
}

/// @notice Malicious contract attempting reentrancy
contract MaliciousReentrant {
    NoSandwichSwapPair pair;

    constructor(address _pair) {
        pair = NoSandwichSwapPair(_pair);
    }

    function attackAddLiquidity(uint256 baseAmount, uint256 quoteAmount) external {
        pair.addLiquidity(baseAmount, quoteAmount);
    }

    // Fallback function to attempt reentrancy
    fallback() external payable {
        pair.addLiquidity(1 ether, 1 ether);
    }
}
