// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/access/Ownable.sol';

interface IOmniverseBeacon {
    function balanceOf(
        bytes32 assetId,
        address account
    ) external view returns (uint256);

    function totalSupply(bytes32 assetId) external view returns (uint256);

    /**
     * @dev Returns the name of the token.
     */
    function name(bytes32 assetId) external view returns (string memory);

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     * 
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf}.
     */
    function decimals() external view returns (uint8);
}