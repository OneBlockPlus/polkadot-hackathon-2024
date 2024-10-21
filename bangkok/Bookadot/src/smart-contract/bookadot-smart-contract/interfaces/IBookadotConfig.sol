// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.4 <0.9.0;

interface IBookadotConfig {
    function fee() external view returns (uint256);

    function payoutDelayTime() external view returns (uint256);

    function bookadotTreasury() external view returns (address);

    function bookadotSigner() external view returns (address);

    function supportedTokens(address) external view returns (bool);
}
