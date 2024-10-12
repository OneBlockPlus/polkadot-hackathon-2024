// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract RewardPool is Ownable {
    IERC20 public rewardToken;
    CredibilityStaking public stakingContract;

    mapping(address => uint256) public rewards;

    event RewardDistributed(address indexed user, uint256 amount);

    constructor(
        address _rewardToken,
        address _stakingContract
    ) Ownable(msg.sender) {
        rewardToken = IERC20(_rewardToken);
        stakingContract = CredibilityStaking(_stakingContract);
    }

    function distributeRewards() external onlyOwner {
        uint256 totalStaked = stakingContract.totalStaked();
        require(totalStaked > 0, "No stakes to distribute rewards");

        uint256 rewardAmount = rewardToken.balanceOf(address(this));
        require(rewardAmount > 0, "No rewards to distribute");

        address[] memory stakers = stakingContract.getStakers();
        uint256 totalPoints;

        // Calculate total points of all stakers
        for (uint256 i = 0; i < stakers.length; i++) {
            (, , uint256 credibilityPoints) = stakingContract.getStakeInfo(stakers[i]);
            totalPoints += credibilityPoints;
        }

        // Distribute rewards
        for (uint256 i = 0; i < stakers.length; i++) {
            (uint256 stakerAmount, , uint256 credibilityPoints) = stakingContract.getStakeInfo(stakers[i]);

            uint256 stakerReward = (rewardAmount * stakerAmount * credibilityPoints) / (totalStaked * totalPoints);
            rewards[stakers[i]] += stakerReward;

            emit RewardDistributed(stakers[i], stakerReward);
        }
    }

    function claimRewards() external {
        uint256 rewardAmount = rewards[msg.sender];
        require(rewardAmount > 0, "No rewards to claim");

        rewards[msg.sender] = 0;
        require(
            rewardToken.transfer(msg.sender, rewardAmount),
            "Reward transfer failed"
        );
    }

    function addRewards(uint256 _amount) external onlyOwner {
        require(
            rewardToken.transferFrom(msg.sender, address(this), _amount),
            "Reward token transfer failed"
        );
    }
}
