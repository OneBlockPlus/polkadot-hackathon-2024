// SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract SandwichToken is ERC20, Ownable {
    uint256 immutable i_startTimestamp;
    uint256 immutable i_halflife;

    uint256 public lastDecayTimestamp;
    uint256 public mintAmount;

    constructor(address _owner, uint256 _halflife, uint256 _initialMintAmount)
        Ownable(_owner)
        ERC20("Sandwich Token", "SANDWICH")
    {
        i_startTimestamp = block.timestamp;
        i_halflife = _halflife;

        lastDecayTimestamp = block.timestamp;
        mintAmount = _initialMintAmount;
    }

    function mint(address to) public onlyOwner {
        if (block.timestamp - lastDecayTimestamp >= i_halflife) {
            lastDecayTimestamp = block.timestamp;
            mintAmount = mintAmount / 2;
        }
        _mint(to, mintAmount);
    }
}
