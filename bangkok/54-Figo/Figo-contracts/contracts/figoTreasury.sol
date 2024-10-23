// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@account-abstraction/contracts/core/BasePaymaster.sol";

// Treasury contract to hold GLMR (Moonbeam's native token)
contract FigoTreasury is BasePaymaster {
    constructor(address entryPoint) BasePaymaster(IEntryPoint(entryPoint)) {}

    // Function to allow the contract to receive GLMR
    receive() external payable {}

    // Withdraw function for the owner to withdraw funds
    function withdraw(uint256 amount) external onlyOwner {
        require(address(this).balance >= amount, "Insufficient balance");
        payable(owner()).transfer(amount);
    }

    // Get the treasury balance in GLMR
    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function _validatePaymasterUserOp(
        PackedUserOperation calldata userOp,
        bytes32 userOpHash,
        uint256 maxCost
    )
        internal
        virtual
        override
        returns (bytes memory context, uint256 validationData)
    {}
}
