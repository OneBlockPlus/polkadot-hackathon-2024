// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.4 <0.9.0;

import "../BookadotStructs.sol";

interface IBookadotFactory {
    function deployProperty(uint256[] calldata _ids, address _host) external;

    function verifyBookingData(BookingParameters calldata _params, bytes calldata _signature) external returns (bool);

    function book(Booking calldata _bookingData) external;

    function cancelByGuest(
        string calldata _bookingId,
        uint256 _guestAmount,
        uint256 _hostAmount,
        uint256 _treasuryAmount,
        uint256 _cancelTimestamp
    ) external;

    function cancelByHost(string calldata _bookingId, uint256 _guestAmount, uint256 _cancelTimestamp) external;

    function payout(
        string calldata _bookingId,
        uint256 _hostAmount,
        uint256 _treasuryAmount,
        uint256 _payoutTimestamp,
        uint8 _payoutType
    ) external;
}
