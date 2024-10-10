// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MintableERC20 is ERC20, Ownable {
    constructor(
        address initialOwner
    ) ERC20("Mintable ERC 20", "MERC") Ownable(initialOwner) {}
}
