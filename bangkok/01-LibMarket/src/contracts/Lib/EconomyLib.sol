// SPDX-License-Identifier: LibMarket
pragma solidity ^0.8.20;


library EconomyLib {
    struct Trade {
        address payable seller;
        address payable buyer;
        uint amount;
        TradeStatus status;
        bytes32 hashLock;
        uint256 timelock;
    }

    event RewardDistributed(address indexed seller, address indexed buyer, uint amount);

    struct Economy {
        uint totalFees;  // 总手续费
        uint rewardPool;  // 激励池
    }

    enum TradeStatus { Pending, Locked, OrderInProgress, Complete, Cancelled }

    function calculateFee(uint amount) internal pure returns (uint) {
        return (amount * 5) / 1000;  // 0.5% 手续费
    }

    function addToRewardPool(Economy storage economy, uint fee) internal {
        economy.rewardPool += fee;
    }

    function distributeRewards(Economy storage economy, uint tradeCounter, mapping(uint => Trade) storage trades) internal {
        require(tradeCounter > 0, "No trades to distribute rewards");
        uint rewardPerTrade = economy.rewardPool / tradeCounter;

        for (uint i = 0; i < tradeCounter; i++) {
            if (trades[i].status == TradeStatus.Complete) {
                uint rewardShare = rewardPerTrade / 2;
                trades[i].seller.transfer(rewardShare);
                trades[i].buyer.transfer(rewardShare);


                emit RewardDistributed(trades[i].seller, trades[i].buyer, rewardShare);

            }
        }

        economy.rewardPool = 0;  // 清空激励池

    }
}