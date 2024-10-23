// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/SandwichToken.sol"; // 确保路径正确

contract SandwichTokenTest is Test {
    SandwichToken token;
    address owner;
    address user;

    uint256 constant INITIAL_MINT_AMOUNT = 1000;
    uint256 constant HALFLIFE = 1 days; // 示例值，可以根据需要调整

    function setUp() public {
        // 部署合约并设置初始状态
        owner = address(this);
        user = address(0x1); // 测试用户地址
        token = new SandwichToken(owner, HALFLIFE, INITIAL_MINT_AMOUNT);
    }

    function testInitialMintAmount() public {
        // 验证初始的 mintAmount
        assertEq(token.mintAmount(), INITIAL_MINT_AMOUNT, "Initial mintAmount should be set correctly");
    }

    function testMintFunction() public {
        // Mint 一次
        token.mint(user);
        assertEq(token.balanceOf(user), INITIAL_MINT_AMOUNT, "User should receive the initial mint amount");

        // 等待超过一个半衰期
        vm.warp(block.timestamp + HALFLIFE + 1); // 移动时间，确保超过半衰期

        // 再次 mint
        token.mint(user);
        uint256 expectedMintAmount = INITIAL_MINT_AMOUNT / 2; // 预期的 mintAmount 应为初始值的一半
        assertEq(
            token.balanceOf(user),
            INITIAL_MINT_AMOUNT + expectedMintAmount,
            "User should receive half of the initial mint amount after decay"
        );
    }

    function testMintAmountDecay() public {
        // 检查 mintAmount 衰减是否正确
        assertEq(token.mintAmount(), INITIAL_MINT_AMOUNT, "Initial mintAmount should be correct");

        // 等待一个半衰期
        vm.warp(block.timestamp + HALFLIFE + 1); // 移动时间
        token.mint(owner); // mint 给合约拥有者

        assertEq(token.mintAmount(), INITIAL_MINT_AMOUNT / 2, "mintAmount should decay to half after one halflife");

        // 再次等待一个半衰期
        vm.warp(block.timestamp + HALFLIFE + 1); // 再次移动时间
        token.mint(owner); // 再次 mint

        assertEq(
            token.mintAmount(), INITIAL_MINT_AMOUNT / 4, "mintAmount should decay to a quarter after two halflives"
        );
    }
}
