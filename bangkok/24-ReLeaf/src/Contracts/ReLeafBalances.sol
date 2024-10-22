// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.23;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract TokenBalances {
    function batchDecimals(address[] memory _tokenAddresses)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] memory decimals = new uint256[](_tokenAddresses.length);
        for (uint256 i = 0; i < _tokenAddresses.length; i++) {
            decimals[i] = ERC20(_tokenAddresses[i]).decimals();
        }
        return decimals;
    }

    function batchBalanceOf(address _owner, address[] memory _tokenAddresses)
        public
        view
        returns (uint256[] memory)
    {
        uint256[] memory balances = new uint256[](_tokenAddresses.length);
        for (uint256 i = 0; i < _tokenAddresses.length; i++) {
            balances[i] = ERC20(_tokenAddresses[i]).balanceOf(_owner);
        }
        return balances;
    }
}
