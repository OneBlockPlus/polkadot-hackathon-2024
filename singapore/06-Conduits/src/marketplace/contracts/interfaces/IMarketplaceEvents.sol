// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

interface IMarketplaceEvents {
    event List(
        address indexed owner,
        address indexed device,
        uint256 minRentalDays,
        uint256 maxRentalDays,
        address rentCurrency,
        uint256 dailyRent,
        address rentRecipient
    );

    event Delist(address indexed owner, address indexed device);

    event Relist(
        address indexed owner,
        address indexed device,
        uint256 minRentalDays,
        uint256 maxRentalDays,
        address rentCurrency,
        uint256 dailyRent,
        address rentRecipient
    );

    event Rent(
        address indexed device,
        uint256 indexed accessId,
        address indexed tenant,
        uint256 startTime,
        uint256 endTime,
        uint256 rentalDays,
        uint256 prepaidRent
    );

    event PayRent(
        address indexed device,
        uint256 rent
    );

    event EndLease(
        address indexed device,
        address operator
    );

    event Withdraw(address indexed owner, address indexed device);
}
