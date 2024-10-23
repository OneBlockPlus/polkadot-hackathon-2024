// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Test.sol";
import "../src/SimpleDEX.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MEVAttackTest is Test {
    SimpleDEX dex;
    MockERC20 token1;
    MockERC20 token2;

    address trader = address(0x123);
    address mevAttacker = address(0x456);

    function setUp() public {
        token1 = new MockERC20("Token1", "TK1", 1000 ether);
        token2 = new MockERC20("Token2", "TK2", 1000 ether);

        dex = new SimpleDEX(address(token1), address(token2));

        // 初始化池并分配代币
        token1.mint(address(this), 500 ether);
        token2.mint(address(this), 500 ether);
        token1.approve(address(dex), 500 ether);
        token2.approve(address(dex), 500 ether);

        dex.addLiquidity(500 ether, 500 ether);
    }

    function testMEVAttack() public {
        // Trader 和 MEV Attacker 持有一些初始代币
        token1.mint(trader, 100 ether);
        token1.mint(mevAttacker, 100 ether);

        vm.startPrank(trader);
        token1.approve(address(dex), 100 ether);
        vm.stopPrank();

        vm.startPrank(mevAttacker);
        token1.approve(address(dex), 100 ether);
        token2.approve(address(dex), 100 ether); // 授权 token2 代币，以便卖出操作
        vm.stopPrank();

        // 记录交易前 MEV Attacker 和 Trader 的初始 token1 余额
        uint256 mevInitialBalanceToken1 = token1.balanceOf(mevAttacker);

        // MEV Attacker 在 Trader 交易前进行先买入操作
        vm.startPrank(mevAttacker);
        uint256 mevBoughtAmount = dex.swap(address(token1), 50 ether);
        emit log_named_uint("MEV Bought Amount", mevBoughtAmount);
        vm.stopPrank();

        // Trader 买入一定量货币
        vm.startPrank(trader);
        uint256 traderBoughtAmount = dex.swap(address(token1), 50 ether);
        emit log_named_uint("Trader Bought Amount", traderBoughtAmount);
        vm.stopPrank();

        // MEV Attacker 在 Trader 买入后立即卖出
        vm.startPrank(mevAttacker);
        uint256 mevSoldAmount = dex.swap(address(token2), mevBoughtAmount);
        emit log_named_uint("MEV Sold Amount", mevSoldAmount);
        vm.stopPrank();

        // 计算 MEV 攻击者的利润，使用 token1 的余额差值
        uint256 mevFinalBalanceToken1 = token1.balanceOf(mevAttacker);
        uint256 mevProfit = mevFinalBalanceToken1 - mevInitialBalanceToken1;

        // 计算 Trader 承受的价格滑点
        uint256 priceSlippage = (mevBoughtAmount * 1 ether) / traderBoughtAmount - 1 ether;

        // 验证 MEV 利润和价格滑点
        emit log_named_uint("MEV Attack Profit in token1", mevProfit);
        emit log_named_uint("Trader Price Slippage", priceSlippage);

        // 断言测试结果
        assertGt(mevProfit, 0, "MEV attacker should profit in token1");
        assertGt(priceSlippage, 0, "Trader should experience price slippage");
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
