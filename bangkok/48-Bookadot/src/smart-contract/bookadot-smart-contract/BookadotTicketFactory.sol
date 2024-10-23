// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.4 <0.9.0;

import { Create2 } from "@openzeppelin/contracts/utils/Create2.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { BookadotTicket } from "./BookadotTicket.sol";

contract BookadotTicketFactory is Ownable {
    address private factory;

    event TicketCreated(uint256 indexed id, address ticketAddress);
    event FactoryChanged(address oldFactory, address newFactory);

    function setFactory(address _factory) external onlyOwner {
        address oldFactory = factory;
        require(oldFactory != _factory, "TicketFactory: Value unchanged");
        emit FactoryChanged(oldFactory, _factory);
        factory = _factory;
    }

    function deployTicket(
        uint256 _propertyId,
        bytes memory _ticketData
    ) external onlyFactory returns (address _ticket) {
        require(_ticketData.length > 0, "TicketFactory: empty data");
        bytes memory ticketBytecode = abi.encodePacked(type(BookadotTicket).creationCode, _ticketData);

        _ticket = Create2.deploy(0, keccak256(abi.encodePacked(_propertyId)), ticketBytecode);
        emit TicketCreated(_propertyId, _ticket);
    }

    modifier onlyFactory() {
        require(msg.sender == factory, "TicketFactory: Not factory");
        _;
    }
}
