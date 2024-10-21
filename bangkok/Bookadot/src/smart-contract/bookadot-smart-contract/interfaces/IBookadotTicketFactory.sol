// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.4 <0.9.0;

interface IBookadotTicketFactory {
    function deployTicket(uint256 _propertyId, bytes memory _ticketData) external returns (address _ticket);
}
