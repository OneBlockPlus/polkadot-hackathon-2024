// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.4 <0.9.0;

import { ReentrancyGuard } from "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import { IBookadotConfig } from "./interfaces/IBookadotConfig.sol";
import { IBookadotFactory } from "./interfaces/IBookadotFactory.sol";
import { IBookadotTicket } from "./interfaces/IBookadotTicket.sol";
import { Booking, BookingParameters, BookingStatus } from "./BookadotStructs.sol";
import { TransferHelper } from "./libs/TransferHelper.sol";

contract BookadotProperty is ReentrancyGuard {
    /// property id
    uint256 public id;
    /// host address
    address private host;
    /// booking id to Booking
    mapping(string => Booking) public bookings;
    /// addresses authorized by the host to act in the host's behalf
    mapping(address => bool) public hostDelegates;
    /// config contract
    IBookadotConfig private configContract;
    /// factory contract
    IBookadotFactory private factoryContract;
    /// ticket contract
    IBookadotTicket private ticket;

    /**
    @param _id Property Id
    @param _config Contract address of BookadotConfig
    @param _factory Contract address of BookadotFactory
    @param _host Wallet address of the owner of this property
    */
    constructor(uint256 _id, address _config, address _factory, address _host) {
        id = _id;
        configContract = IBookadotConfig(_config);
        factoryContract = IBookadotFactory(_factory);
        host = _host;
    }

    /**
    @notice Modifier to check if the caller is the host or a delegate approved by the host
    */
    modifier onlyHostOrDelegate() {
        require(
            msg.sender == host || hostDelegates[msg.sender],
            "Property: Only the host or a host's delegate is authorized to call this action"
        );

        _;
    }

    function approve(address delegate) external onlyHostOrDelegate {
        hostDelegates[delegate] = true;
    }

    function revoke(address delegate) external onlyHostOrDelegate {
        hostDelegates[delegate] = false;
    }

    function _validateBookingParameters(
        BookingParameters memory _params,
        bytes memory _signature
    ) private returns (bool) {
        require(bookings[_params.bookingId].guest == address(0), "Property: Booking already exists");
        require(block.timestamp < _params.bookingExpirationTimestamp, "Property: Booking data is expired");
        require(configContract.supportedTokens(_params.token), "Property: Token is not whitelisted");
        require(_params.checkInTimestamp + 1 days >= block.timestamp, "Property: Booking for past date is not allowed");
        require(
            _params.checkOutTimestamp >= _params.checkInTimestamp + 1 days,
            "Property: Booking period should be at least one night"
        );
        require(
            _params.cancellationPolicies.length > 0,
            "Property: Booking should have at least one cancellation policy"
        );

        for (uint256 i = 0; i < _params.cancellationPolicies.length; i++) {
            require(
                _params.bookingAmount >= _params.cancellationPolicies[i].refundAmount,
                "Property: Refund amount is greater than booking amount"
            );
        }

        if (_params.cancellationPolicies.length > 1) {
            for (uint256 i = 0; i < _params.cancellationPolicies.length - 1; i++) {
                require(
                    _params.cancellationPolicies[i].expiryTime < _params.cancellationPolicies[i + 1].expiryTime,
                    "Property: Cancellation policies should be in chronological order"
                );
            }
        }

        require(factoryContract.verifyBookingData(_params, _signature), "Property: Invalid signature");

        return true;
    }

    function setTicketAddress(address _ticket) external {
        require(address(ticket) == address(0), "Property: Ticket address already set");
        ticket = IBookadotTicket(_ticket);
    }

    /**
    @param _params Booking data provided by oracle backend
    @param _signature Signature of the transaction
    */
    function book(BookingParameters calldata _params, bytes calldata _signature) external payable nonReentrant {
        _book(_params, _signature);
    }

    /**
    @param _params Booking data provided by oracle backend
    @param _signature Signature of the transaction
    */
    function bulkBook(BookingParameters[] calldata _params, bytes[] calldata _signature) external payable nonReentrant {
        require(_params.length == _signature.length, "Property: Invalid input length");
        require(_params.length > 0, "Property: Empty input");
        require(_params.length <= 10, "Property: Exceeds maximum limit");
        for (uint8 i = 0; i < _params.length; i++) {
            _book(_params[i], _signature[i]);
        }
    }

    function cancel(string calldata _bookingId) public nonReentrant {
        Booking memory booking = bookings[_bookingId];
        require(booking.guest != address(0), "Property: Booking does not exist");
        require(booking.guest == msg.sender, "Property: Only the guest can cancel the booking");
        require(booking.balance > 0, "Property: Booking is already cancelled or paid out");

        uint256 guestAmount;
        for (uint256 i = 0; i < booking.cancellationPolicies.length; i++) {
            if (booking.cancellationPolicies[i].expiryTime >= block.timestamp) {
                guestAmount = booking.cancellationPolicies[i].refundAmount;
                break;
            }
        }

        _updateBookingStatus(_bookingId, BookingStatus.CancelledByGuest);

        // Refund to the guest
        uint256 treasuryAmount = ((booking.balance - guestAmount) * configContract.fee()) / 10000;
        uint256 hostAmount = booking.balance - guestAmount - treasuryAmount;

        _payout(booking.token, booking.guest, guestAmount);
        _payout(booking.token, host, hostAmount);
        _payout(booking.token, configContract.bookadotTreasury(), treasuryAmount);

        ticket.burn(booking.ticketId);

        factoryContract.cancelByGuest(_bookingId, guestAmount, hostAmount, treasuryAmount, block.timestamp);
    }

    /**
    When a booking is cancelled by the host, the whole remaining balance is sent to the guest.
    Any amount that has been paid out to the host or to the treasury through calls to `payout` will have to be refunded manually to the guest.
    */
    function cancelByHost(string calldata _bookingId) external nonReentrant onlyHostOrDelegate {
        Booking memory booking = bookings[_bookingId];
        require(booking.guest != address(0), "Property: Booking does not exist");
        require(
            (booking.status == BookingStatus.InProgress || booking.status == BookingStatus.PartialPayOut) &&
                booking.balance > 0,
            "Property: Booking is already cancelled or fully paid out"
        );

        // Refund to the guest
        uint256 guestAmount = booking.balance;

        _updateBookingStatus(_bookingId, BookingStatus.CancelledByHost);

        _payout(booking.token, booking.guest, guestAmount);

        ticket.burn(booking.ticketId);

        factoryContract.cancelByHost(_bookingId, guestAmount, block.timestamp);
    }

    /**
    Anyone can call the `payout` function. When it is called, the difference between 
    the remaining balance and the amount due to the guest if the guest decides to cancel
    is split between the host and treasury.
    */
    function payout(string calldata _bookingId) external nonReentrant {
        Booking storage booking = bookings[_bookingId];
        require(booking.guest != address(0), "Property: Booking does not exist");
        require(booking.balance != 0, "Property: Booking is already cancelled or fully paid out");

        uint256 toBePaid;

        if (
            booking.cancellationPolicies[booking.cancellationPolicies.length - 1].expiryTime +
                configContract.payoutDelayTime() <
            block.timestamp
        ) {
            toBePaid = booking.balance;
        } else {
            for (uint256 i = 0; i < booking.cancellationPolicies.length; i++) {
                if (booking.cancellationPolicies[i].expiryTime + configContract.payoutDelayTime() >= block.timestamp) {
                    require(
                        booking.balance >= booking.cancellationPolicies[i].refundAmount,
                        "Property: Insufficient booking balance"
                    );
                    toBePaid = booking.balance - booking.cancellationPolicies[i].refundAmount;
                    break;
                }
            }
        }

        require(toBePaid > 0, "Property: Invalid payout call");

        uint256 currentBalance = booking.balance - toBePaid;
        booking.balance = currentBalance;

        _updateBookingStatus(
            _bookingId,
            currentBalance == 0 ? BookingStatus.FullyPaidOut : BookingStatus.PartialPayOut
        );

        // Split the payment
        uint256 treasuryAmount = (toBePaid * configContract.fee()) / 10000;
        uint256 hostAmount = toBePaid - treasuryAmount;

        _payout(booking.token, host, hostAmount);
        _payout(booking.token, configContract.bookadotTreasury(), treasuryAmount);

        factoryContract.payout(_bookingId, hostAmount, treasuryAmount, block.timestamp, currentBalance == 0 ? 1 : 2);
    }

    function _updateBookingStatus(string calldata _bookingId, BookingStatus _status) internal {
        if (
            _status == BookingStatus.CancelledByGuest ||
            _status == BookingStatus.CancelledByHost ||
            _status == BookingStatus.FullyPaidOut ||
            _status == BookingStatus.EmergencyCancelled
        ) {
            bookings[_bookingId].balance = 0;
        }
        bookings[_bookingId].status = _status;
    }

    function _book(BookingParameters calldata _params, bytes calldata _signature) internal {
        // Check if parameters are valid
        _validateBookingParameters(_params, _signature);
        address sender = msg.sender;

        Booking storage booking = bookings[_params.bookingId];
        for (uint256 i = 0; i < _params.cancellationPolicies.length; i++) {
            booking.cancellationPolicies.push(_params.cancellationPolicies[i]);
        }
        booking.id = _params.bookingId;
        booking.checkInTimestamp = _params.checkInTimestamp;
        booking.checkOutTimestamp = _params.checkOutTimestamp;
        booking.balance = _params.bookingAmount;
        booking.guest = sender;
        booking.token = _params.token;
        booking.status = BookingStatus.InProgress;

        _payin(_params.token, sender, _params.bookingAmount);

        booking.ticketId = ticket.mint(sender);
        booking.status = BookingStatus.InProgress;

        // emit Book event
        factoryContract.book(booking);
    }

    function _payin(address _token, address _from, uint256 _amount) internal {
        if (_token == TransferHelper.NATIVE_TOKEN) {
            require(msg.value >= _amount, "Property: Insufficient amount");
        } else {
            TransferHelper.safeEnoughTokenApproved(_token, _from, address(this), _amount);
            TransferHelper.safeTransferFrom(_token, _from, address(this), _amount);
        }
    }

    function _payout(address _token, address _to, uint256 _amount) internal {
        if (_token == TransferHelper.NATIVE_TOKEN) {
            _to.call{ value: _amount }("");
        } else {
            TransferHelper.safeTransfer(_token, _to, _amount);
        }
    }

    function totalBooking() external view returns (uint256) {
        return ticket.totalSupply();
    }

    function getBooking(string calldata _bookingId) external view returns (Booking memory) {
        return bookings[_bookingId];
    }
}
