// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/SimpleDEX.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SimpleDEXTest is Test {
    SimpleDEX dex;
    MockERC20 token1;
    MockERC20 token2;

    address alice = address(0x123);
    address bob = address(0x456);

    function setUp() public {
        token1 = new MockERC20("Token1", "TK1", 1000 ether);
        token2 = new MockERC20("Token2", "TK2", 1000 ether);

        dex = new SimpleDEX(address(token1), address(token2));

        // Mint tokens and approve SimpleDEX
        token1.mint(alice, 500 ether);
        token2.mint(alice, 500 ether);

        vm.startPrank(alice);
        token1.approve(address(dex), 500 ether);
        token2.approve(address(dex), 500 ether);
        // dex.addLiquidity(50 ether, 50 ether);
        vm.stopPrank();
    }

    function testAddLiquidity() public {
        vm.startPrank(alice);
        uint256 liquidityMinted = dex.addLiquidity(100 ether, 100 ether);

        console.log("Liquidity Minted:", liquidityMinted);
        console.log("Liquidity Balance:", dex.liquidityBalance(alice));
        assertEq(dex.liquidityBalance(alice), liquidityMinted, "Liquidity mismatch");
        assertEq(dex.reserve1(), 100 ether, "Reserve1 mismatch");
        assertEq(dex.reserve2(), 100 ether, "Reserve2 mismatch");

        vm.stopPrank();
    }

    function testRemoveLiquidity() public {
        vm.startPrank(alice);
        dex.addLiquidity(100 ether, 100 ether);
        uint256 liquidityBalance = dex.liquidityBalance(alice);

        (uint256 amount1, uint256 amount2) = dex.removeLiquidity(liquidityBalance);

        assertEq(amount1, 100 ether);
        assertEq(amount2, 100 ether);
        assertEq(dex.liquidityBalance(alice), 0);
        vm.stopPrank();
    }

    function testSwap() public {
        vm.startPrank(alice);
        dex.addLiquidity(100 ether, 100 ether);
        vm.stopPrank();

        vm.startPrank(bob);
        token1.mint(bob, 10 ether);
        token1.approve(address(dex), 10 ether);

        uint256 amountOut = dex.swap(address(token1), 10 ether);

        assertEq(token2.balanceOf(bob), amountOut);
        assertGt(amountOut, 0);
        vm.stopPrank();
    }

    function testSwapFailsWithInvalidToken() public {
        vm.startPrank(alice);
        dex.addLiquidity(100 ether, 100 ether);
        vm.stopPrank();

        vm.startPrank(bob);
        vm.expectRevert("Invalid token");
        dex.swap(address(0x789), 10 ether); // 0x789 is an invalid token address
        vm.stopPrank();
    }
}

// Mock ERC20 token for testing
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol, uint256 initialSupply) ERC20(name, symbol) {
        _mint(msg.sender, initialSupply);
    }

    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
