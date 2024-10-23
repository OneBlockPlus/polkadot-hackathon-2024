// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.4 <0.9.0;

struct CancellationPolicy {
    uint256 expiryTime;
    uint256 refundAmount;
}

struct BookingParameters {
    address token;
    string bookingId;
    uint256 checkInTimestamp;
    uint256 checkOutTimestamp;
    uint256 bookingExpirationTimestamp;
    uint256 bookingAmount;
    CancellationPolicy[] cancellationPolicies;
}

enum BookingStatus {
    InProgress,
    PartialPayOut,
    FullyPaidOut,
    CancelledByGuest,
    CancelledByHost,
    EmergencyCancelled
}

struct Booking {
    string id;
    uint256 checkInTimestamp;
    uint256 checkOutTimestamp;
    uint256 balance;
    uint256 ticketId;
    address guest;
    address token;
    BookingStatus status;
    CancellationPolicy[] cancellationPolicies;
}
