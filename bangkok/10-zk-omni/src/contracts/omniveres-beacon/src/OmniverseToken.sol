// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import '@openzeppelin/contracts/access/Ownable.sol';
import './interface/IOmniverseBeacon.sol';

contract OmniverseToken {
    bytes32 _assetId;
    IOmniverseBeacon _beacon;

    /**
     * @dev Sets the values for {assetId} and {beacon}.
     * 
     * All two of these values are immutable: they can only be set once during
     * construction.
     */
    constructor(
        bytes32 assetId,
        IOmniverseBeacon beacon
    ) {
        _assetId = assetId;
        _beacon = beacon;
    }

    /**
     * @dev Returns the name of the token.
     */
    function name() public view returns (string memory) {
        return _beacon.name(_assetId);
    }

    /**
     * @dev Returns the symbol of the token, usually a shorter version of the
     * name.
     */
    function symbol() public view returns (string memory) {
        return name();
    }

    /**
     * @dev Returns the number of decimals used to get its user representation.
     * For example, if `decimals` equals `2`, a balance of `505` tokens should
     * be displayed to a user as `5.05` (`505 / 10 ** 2`).
     * 
     * NOTE: This information is only used for _display_ purposes: it in
     * no way affects any of the arithmetic of the contract, including
     * {IERC20-balanceOf}.
     */
    function decimals() public view returns (uint8) {
        return _beacon.decimals();
    }

    /**
     * @dev See {IERC20-totalSupply}.
     */
    function totalSupply() public view returns (uint256) {
        return _beacon.totalSupply(_assetId);
    }

    /**
     * @dev See {IERC20-balanceOf}.
     */
    function balanceOf(address account) public view returns (uint256) {
        return _beacon.balanceOf(_assetId, account);
    }
}
