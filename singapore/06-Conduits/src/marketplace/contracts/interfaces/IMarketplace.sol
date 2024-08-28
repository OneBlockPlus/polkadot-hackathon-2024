// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {IMarketplaceStructs} from "./IMarketplaceStructs.sol";
import {IMarketplaceEvents} from "./IMarketplaceEvents.sol";

interface IMarketplace is IMarketplaceStructs, IMarketplaceEvents {
    function getListingInfo(
        address device
    ) external view returns (ListingInfo memory);

    function getRentalInfo(
        address device
    ) external view returns (RentalInfo memory);

    function setFeePoints(uint256 feePoints) external;

    function setTreasury(address payable treasury) external;

    function addRentCurrencies(address[] memory rentCurrencies) external;

    function removeRentCurrencies(address[] memory rentCurrencies) external;

    function list(
        address device,
        uint256 minRentalDays,
        uint256 maxRentalDays,
        address rentCurrency,
        uint256 dailyRent,
        address rentRecipient
    ) external;

    function delist(address device) external;

    function relist(
        address device,
        uint256 minRentalDays,
        uint256 maxRentalDays,
        address rentCurrency,
        uint256 dailyRent,
        address rentRecipient
    ) external;

    function rent(
        address device,
        address tenant,
        uint256 rentalDays,
        uint256 prepaidRent
    ) external payable;

    function payRent(
        address device,
        uint256 rent_
    ) external payable;

    function endLease(address device) external;

    function withdraw(address device) external;
}
