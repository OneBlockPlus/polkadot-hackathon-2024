// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

// 引入 OpenZeppelin 的 ERC20 接口
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract SimpleDEX {
    IERC20 public token1;
    IERC20 public token2;
    uint256 public reserve1;
    uint256 public reserve2;
    address public owner;
    uint256 public liquidity;

    mapping(address => uint256) public liquidityBalance;

    event AddLiquidity(address indexed provider, uint256 amount1, uint256 amount2, uint256 liquidityMinted);
    event RemoveLiquidity(address indexed provider, uint256 amount1, uint256 amount2, uint256 liquidityBurned);
    event Swap(
        address indexed swapper, address indexed tokenIn, uint256 amountIn, address indexed tokenOut, uint256 amountOut
    );

    constructor(address _token1, address _token2) {
        require(_token1 != _token2, "Tokens must be different");
        token1 = IERC20(_token1);
        token2 = IERC20(_token2);
        owner = msg.sender;
    }

    // 存入流动性
    function addLiquidity(uint256 amount1, uint256 amount2) external returns (uint256 liquidityMinted) {
        require(amount1 > 0 && amount2 > 0, "Amounts must be greater than zero");

        // 将代币转入合约
        require(token1.transferFrom(msg.sender, address(this), amount1), "Transfer token1 failed");
        require(token2.transferFrom(msg.sender, address(this), amount2), "Transfer token2 failed");

        if (liquidity == 0) {
            liquidity = sqrt(amount1 * amount2);
            liquidityMinted = liquidity; /////
            liquidityBalance[msg.sender] = liquidity;
        } else {
            uint256 liquidity1 = (amount1 * liquidity) / reserve1;
            uint256 liquidity2 = (amount2 * liquidity) / reserve2;
            liquidityMinted = liquidity1 < liquidity2 ? liquidity1 : liquidity2;
            liquidity += liquidityMinted;
            liquidityBalance[msg.sender] += liquidityMinted;
        }

        reserve1 += amount1;
        reserve2 += amount2;

        emit AddLiquidity(msg.sender, amount1, amount2, liquidityMinted);
    }

    // 撤出流动性
    function removeLiquidity(uint256 liquidityAmount) external returns (uint256 amount1, uint256 amount2) {
        require(liquidityAmount > 0, "Liquidity amount must be greater than zero");
        require(liquidityBalance[msg.sender] >= liquidityAmount, "Insufficient liquidity balance");

        amount1 = (liquidityAmount * reserve1) / liquidity;
        amount2 = (liquidityAmount * reserve2) / liquidity;

        liquidity -= liquidityAmount;
        reserve1 -= amount1;
        reserve2 -= amount2;
        liquidityBalance[msg.sender] -= liquidityAmount;

        require(token1.transfer(msg.sender, amount1), "Transfer token1 failed");
        require(token2.transfer(msg.sender, amount2), "Transfer token2 failed");

        emit RemoveLiquidity(msg.sender, amount1, amount2, liquidityAmount);
    }

    // 交换代币
    function swap(address tokenIn, uint256 amountIn) external returns (uint256 amountOut) {
        require(tokenIn == address(token1) || tokenIn == address(token2), "Invalid token");
        require(amountIn > 0, "Amount must be greater than zero");

        bool isToken1 = tokenIn == address(token1);
        IERC20 inputToken = isToken1 ? token1 : token2;
        IERC20 outputToken = isToken1 ? token2 : token1;
        uint256 reserveIn = isToken1 ? reserve1 : reserve2;
        uint256 reserveOut = isToken1 ? reserve2 : reserve1;

        // 转入代币
        require(inputToken.transferFrom(msg.sender, address(this), amountIn), "Transfer failed");

        // 计算输出量，使用恒定乘积公式，添加0.3%手续费
        uint256 amountInWithFee = amountIn * 997;
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * 1000) + amountInWithFee;
        amountOut = numerator / denominator;

        require(amountOut > 0, "Insufficient output amount");

        // 更新储备
        if (isToken1) {
            reserve1 += amountIn;
            reserve2 -= amountOut;
        } else {
            reserve2 += amountIn;
            reserve1 -= amountOut;
        }

        // 转出代币
        require(outputToken.transfer(msg.sender, amountOut), "Transfer failed");

        emit Swap(msg.sender, tokenIn, amountIn, address(outputToken), amountOut);
    }

    function getPriceInWei() public view returns (uint256) {
        return (reserve2 * 1 ether) / reserve1;
    }

    function getConstantProduct() public view returns (uint256) {
        return reserve1 * reserve2;
    }

    // 辅助函数：计算平方根
    function sqrt(uint256 y) internal pure returns (uint256 z) {
        if (y > 3) {
            z = y;
            uint256 x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }
}
