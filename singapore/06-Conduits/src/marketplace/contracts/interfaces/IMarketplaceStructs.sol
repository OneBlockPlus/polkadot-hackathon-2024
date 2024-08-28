// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

interface IMarketplaceStructs {
    // Statuses of a listing. WithdrawnOrNotExist, which is 0, is effectively the same as never listed before.
    enum ListingStatus {
        WithdrawnOrNotExist,
        Listing,
        Delisted
    }

    // Statuses of a rental. EndedOrNotExist, which is 0, is effectively the same as never exist before.
    enum RentalStatus {
        EndedOrNotExist,
        Renting
    }

    struct ListingInfo {
        address owner;
        uint256 minRentalDays;
        uint256 maxRentalDays;
        address rentCurrency;
        uint256 dailyRent;
        address payable rentRecipient;
        ListingStatus status;
    }

    struct RentalInfo {
        uint256 accessId;
        uint256 startTime;
        uint256 endTime;
        uint256 rentalDays;
        address rentCurrency;
        uint256 dailyRent;
        uint256 totalPaidRent;
        RentalStatus status;
    }
}