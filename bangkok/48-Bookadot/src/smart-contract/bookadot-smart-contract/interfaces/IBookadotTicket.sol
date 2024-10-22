// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.4 <0.9.0;

interface IBookadotTicket {
    function mint(address _receiver) external returns (uint256 id);

    function burn(uint256 _id) external;

    function totalSupply() external view returns (uint256);
}
