// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.4 <0.9.0;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Create2 } from "@openzeppelin/contracts/utils/Create2.sol";
import { IBookadotConfig } from "./interfaces/IBookadotConfig.sol";
import { BookadotProperty } from "./BookadotProperty.sol";
import { BookadotEIP712 } from "./libs/BookadotEIP712.sol";
import { IBookadotTicketFactory } from "./interfaces/IBookadotTicketFactory.sol";
import "./BookadotStructs.sol";

contract BookadotFactory is Ownable {
    address public configContract;
    IBookadotTicketFactory ticketFactory;
    mapping(address => bool) private propertyMapping;

    event PropertyCreated(uint256[] ids, address[] properties, address host);
    event Book(address property, uint256 bookedTimestamp, Booking bookingData);
    event CancelByGuest(
        address property,
        string bookingId,
        uint256 guestAmount,
        uint256 hostAmount,
        uint256 treasuryAmount,
        uint256 cancelTimestamp
    );
    event CancelByHost(address property, string bookingId, uint256 guestAmount, uint256 cancelTimestamp);
    event Payout(
        address property,
        string bookingId,
        uint256 hostAmount,
        uint256 treasuryAmount,
        uint256 payoutTimestamp,
        uint8 payoutType // 1: full payout, 2: partial payout
    );
    event TicketFactoryChanged(address oldAddress, address newAddress);

    constructor(address _config, address _ticketFactory) {
        configContract = _config;
        ticketFactory = IBookadotTicketFactory(_ticketFactory);
    }

    modifier onlyMatchingProperty() {
        require(propertyMapping[msg.sender] == true, "Factory: Property not found");
        _;
    }

    modifier onlyOwnerOrbookadotOperator() {
        IBookadotConfig config = IBookadotConfig(configContract);
        address sender = _msgSender();
        require(
            (owner() == sender) || (config.bookadotSigner() == sender),
            "Factory: caller is not the owner or operator"
        );
        _;
    }

    function setTicketFactory(address _newTicketFactory) external onlyOwner {
        address _ticketFactory = address(ticketFactory);
        require(_ticketFactory != _newTicketFactory, "Factory: Value Unchanged");
        emit TicketFactoryChanged(_ticketFactory, _newTicketFactory);
        ticketFactory = IBookadotTicketFactory(_newTicketFactory);
    }

    function deployProperty(
        uint256[] calldata _ids,
        address _host,
        bytes memory _ticketData
    ) external onlyOwnerOrbookadotOperator {
        require(_ids.length > 0, "Factory: Invalid property ids");
        require(_host != address(0), "Factory: Host address is invalid");
        address[] memory properties = new address[](_ids.length);
        for (uint256 i = 0; i < _ids.length; i++) {
            address _propertyAddr = createProperty(_ids[i], _host);
            address _ticketAddr = createTicket(_ids[i], _propertyAddr, _ticketData);

            BookadotProperty(_propertyAddr).setTicketAddress(_ticketAddr);
            propertyMapping[_propertyAddr] = true;
            properties[i] = _propertyAddr;
        }
        emit PropertyCreated(_ids, properties, _host);
    }

    function verifyBookingData(
        BookingParameters calldata _params,
        bytes calldata _signature
    ) external view onlyMatchingProperty returns (bool) {
        IBookadotConfig config = IBookadotConfig(configContract);
        return BookadotEIP712.verify(_params, msg.sender, config.bookadotSigner(), _signature);
    }

    function book(Booking calldata _bookingData) external onlyMatchingProperty {
        emit Book(msg.sender, block.timestamp, _bookingData);
    }

    function cancelByGuest(
        string memory _bookingId,
        uint256 _guestAmount,
        uint256 _hostAmount,
        uint256 _treasuryAmount,
        uint256 _cancelTimestamp
    ) external onlyMatchingProperty {
        emit CancelByGuest(msg.sender, _bookingId, _guestAmount, _hostAmount, _treasuryAmount, _cancelTimestamp);
    }

    function cancelByHost(
        string memory _bookingId,
        uint256 _guestAmount,
        uint256 _cancelTimestamp
    ) external onlyMatchingProperty {
        emit CancelByHost(msg.sender, _bookingId, _guestAmount, _cancelTimestamp);
    }

    function payout(
        string memory _bookingId,
        uint256 _hostAmount,
        uint256 _treasuryAmount,
        uint256 _payoutTimestamp,
        uint8 _payoutType
    ) external onlyMatchingProperty {
        emit Payout(msg.sender, _bookingId, _hostAmount, _treasuryAmount, _payoutTimestamp, _payoutType);
    }

    function createProperty(uint256 _propertyId, address _host) internal returns (address propertyAddr) {
        bytes memory propertyBytecode = abi.encodePacked(
            type(BookadotProperty).creationCode,
            abi.encode(_propertyId, configContract, address(this), _host)
        );
        propertyAddr = Create2.deploy(0, keccak256(abi.encodePacked(_propertyId)), propertyBytecode);
    }

    function createTicket(
        uint256 _propertyId,
        address _propertyAddr,
        bytes memory _ticketData
    ) internal returns (address ticketAddr) {
        (
            string memory _nftName,
            string memory _nftSymbol,
            string memory _baseUri,
            address _owner,
            address _transferable
        ) = abi.decode(_ticketData, (string, string, string, address, address));
        _ticketData = abi.encode(_nftName, _nftSymbol, _baseUri, _owner, _transferable, _propertyAddr);
        ticketAddr = ticketFactory.deployTicket(_propertyId, _ticketData);
    }
}
