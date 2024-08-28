// SPDX-License-Identifier: GPL-3.0-only
pragma solidity >=0.8.0;

/// @author The Diora Team
/// @title Pallet Dapps Staking Interface
/// @dev The interface through which solidity contracts will interact with Dapps Staking
/// We follow this same interface including four-byte function selectors, in the precompile that
/// wraps the pallet
/// @custom:address 0x0000000000000000000000000000000000000801
interface DappsStaking {

    // Storage getters

    /// @notice Read current era.
    /// @return era: The current era
    function readCurrentEra() external view returns (uint32);

    /// @notice Read unbonding period constant.
    /// @return period: The unbonding period in eras
    function readUnbondingPeriod() external view returns (uint32);

    /// @notice Read Total network reward for the given era
    /// @return reward: Total network reward for the given era
    function readEraReward(uint32 era) external view returns (uint128);

    /// @notice Read Total staked amount for the given era
    /// @return staked: Total staked amount for the given era
    function readEraStaked(uint32 era) external view returns (uint128);

    /// @notice Read Staked amount for the staker
    /// @param staker: The staker address in form of 20 or 32 hex bytes
    /// @return amount: Staked amount by the staker
    function readStakedAmount(bytes calldata staker) external view returns (uint128);

    /// @notice Read Staked amount on a given contract for the staker
    /// @param contract_id: The smart contract address used for staking
    /// @param staker: The staker address in form of 20 or 32 hex bytes
    /// @return amount: Staked amount by the staker
    function readStakedAmountOnContract(address contract_id, bytes calldata staker) external view returns (uint128);

    /// @notice Read the staked amount from the era when the amount was last staked/unstaked
    /// @return total: The most recent total staked amount on contract
    function readContractStake(address contract_id) external view returns (uint128);


    // Extrinsic calls

    /// @notice Stake provided amount on the contract.
    function bondAndStake(address, uint256) external;

    /// @notice Start unbonding process and unstake balance from the contract.
    function unbondAndUnstake(address, uint256) external;

    /// @notice Withdraw all funds that have completed the unbonding process.
    function withdrawUnbonded() external;

    /// @notice Claim earned staker rewards for the oldest unclaimed era.
    ///         In order to claim multiple eras, this call has to be called multiple times.
    ///         Staker account is derived from the caller address.
    /// @param smart_contract: The smart contract address used for staking
    function claimStaker(address smart_contract) external;

    /// @notice Claim one era of unclaimed dapp rewards for the specified contract and era.
    /// @param smart_contract: The smart contract address used for staking
    /// @param era: The era to be claimed
    function claimDapp(address smart_contract, uint32 era) external;

    /// Instruction how to handle reward payout for staker.
    /// `FreeBalance` - Reward will be paid out to the staker (free balance).
    /// `StakeBalance` - Reward will be paid out to the staker and is immediately restaked (locked balance)
    enum RewardDestination {FreeBalance, StakeBalance}

    /// @notice Set reward destination for staker rewards
    /// @param reward_destination: The instruction on how the reward payout should be handled
    function setRewardDestination(RewardDestination reward_destination) external;

    /// @notice Withdraw staked funds from an unregistered contract.
    /// @param smart_contract: The smart contract address used for staking
    function withdrawFromUnregistered(address smart_contract) external;

    /// @notice Transfer part or entire nomination from origin smart contract to target smart contract
    /// @param origin_smart_contract: The origin smart contract address
    /// @param amount: The amount to transfer from origin to target
    /// @param target_smart_contract: The target smart contract address
    function nominationTransfer(address origin_smart_contract, uint256 amount, address target_smart_contract) external;
}