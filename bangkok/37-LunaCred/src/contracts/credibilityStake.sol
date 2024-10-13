// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract CredibilityStaking is Ownable, ReentrancyGuard {
    IERC20 public stakingToken;

    struct Stake {
        uint256 amount;
        uint256 timestamp;
        uint256 credibilityPoints;
    }

    mapping(address => Stake) public stakes;
    mapping(address => mapping(address => uint256)) public delegatedStakes;
    address[] public stakers;
    mapping(address => bool) public isStaker;

    uint256 public totalStaked;
    uint256 public constant CREDIBILITY_POINTS_PER_DAY = 1;

    event Staked(address indexed user, uint256 amount);
    event Unstaked(address indexed user, uint256 amount);
    event CredibilityPointsUpdated(address indexed user, uint256 points);
    event StakedForFriend(
        address indexed staker,
        address indexed friend,
        uint256 amount
    );

    constructor(address _stakingToken) Ownable(msg.sender) {
        stakingToken = IERC20(_stakingToken);
    }

    function stake(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Stake amount must be greater than 0");
        require(
            stakingToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        if (!isStaker[msg.sender]) {
            stakers.push(msg.sender);
            isStaker[msg.sender] = true;
        }

        stakes[msg.sender].amount += _amount;
        stakes[msg.sender].timestamp = block.timestamp;
        totalStaked += _amount;

        emit Staked(msg.sender, _amount);
    }

    function unstake(uint256 _amount) external nonReentrant {
        require(stakes[msg.sender].amount >= _amount, "Insufficient stake");

        stakes[msg.sender].amount -= _amount;
        totalStaked -= _amount;

        require(stakingToken.transfer(msg.sender, _amount), "Transfer failed");

        emit Unstaked(msg.sender, _amount);
    }

    function updateCredibilityPoints() external {
        uint256 daysStaked = (block.timestamp - stakes[msg.sender].timestamp) /
            1 days;
        uint256 newPoints = daysStaked * CREDIBILITY_POINTS_PER_DAY;

        stakes[msg.sender].credibilityPoints += newPoints;
        stakes[msg.sender].timestamp = block.timestamp;

        emit CredibilityPointsUpdated(
            msg.sender,
            stakes[msg.sender].credibilityPoints
        );
    }

    function stakeForFriend(
        address _friend,
        uint256 _amount
    ) external nonReentrant {
        require(_amount > 0, "Stake amount must be greater than 0");
        require(
            stakingToken.transferFrom(msg.sender, address(this), _amount),
            "Transfer failed"
        );

        delegatedStakes[msg.sender][_friend] += _amount;
        totalStaked += _amount;

        emit StakedForFriend(msg.sender, _friend, _amount);
    }

    function getStakeInfo(
        address _user
    )
        external
        view
        returns (uint256 amount, uint256 timestamp, uint256 credibilityPoints)
    {
        Stake memory userStake = stakes[_user];
        return (
            userStake.amount,
            userStake.timestamp,
            userStake.credibilityPoints
        );
    }

    function getStakers() external view returns (address[] memory) {
        return stakers;
    }
}
