// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

// TicketNFT Contract
contract TicketNFT is ERC721URIStorage {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    constructor(string memory _name, string memory _symbol) ERC721(_name, _symbol) {}

    function mintTicket(address recipient, string memory tokenURI) public returns (uint256) {
        _tokenIds.increment();
        uint256 newItemId = _tokenIds.current();
        _mint(recipient, newItemId);
        _setTokenURI(newItemId, tokenURI);
        return newItemId;
    }
}

// EventManagerWithNFT Contract
contract EventManagerWithNFT {
    struct EventDetails {
        string title;
        string date;
        string startTime;
        string endTime;
        string location;
        string imageUrl;
        string description;
        string category;
        string moreInformation;
        uint256 ticketPrice;
        uint256 maxTickets;
    }

    struct Event {
        uint256 eventId;
        EventDetails details;
        address[] attendees;
        uint256 ticketsSold;
        bool active;
        bool registered;
        address ticketNFTAddress;
        address host;
    }

    mapping(uint256 => Event) public events;
    mapping(uint256 => mapping(address => bool)) public hasPurchasedTicket; // Tracks ticket purchase per event
    mapping(address => uint256[]) public userRegisteredEvents; // Tracks events a user has registered for
    uint256 public nextEventId;

    event EventCreated(uint256 eventId, address ticketNFTAddress);
    event TicketPurchased(uint256 eventId, address buyer, uint256 id);

    constructor() {}

    function createEvent(
        EventDetails memory _details,
        string memory _ticketName,  // NFT Name
        string memory _ticketSymbol  // NFT Symbol
    ) public {
        // Deploy a new TicketNFT contract for this event
        TicketNFT newTicketNFT = new TicketNFT(_ticketName, _ticketSymbol);
        
        Event storage newEvent = events[nextEventId];
        newEvent.eventId = nextEventId;
        newEvent.details = _details;
        newEvent.active = true;
        newEvent.registered = true;
        newEvent.host = msg.sender;
        newEvent.ticketNFTAddress = address(newTicketNFT);

        emit EventCreated(nextEventId, address(newTicketNFT));

        nextEventId++;
    }

    function purchaseTicket(uint256 _eventId, string memory _ticketURI) public payable {
        Event storage eventDetails = events[_eventId];
        require(eventDetails.active, "Event is not active");
        require(msg.value == eventDetails.details.ticketPrice, "Incorrect Ether sent");
        require(eventDetails.ticketsSold < eventDetails.details.maxTickets, "All tickets sold");
        require(!hasPurchasedTicket[_eventId][msg.sender], "Ticket already purchased");

        eventDetails.attendees.push(msg.sender);
        eventDetails.ticketsSold++;

        // Mark the ticket as purchased by the user
        hasPurchasedTicket[_eventId][msg.sender] = true;

        // Interact with the specific TicketNFT contract for this event
        TicketNFT ticketNFT = TicketNFT(eventDetails.ticketNFTAddress);
        ticketNFT.mintTicket(msg.sender, _ticketURI);

        // Track the event for the user
        userRegisteredEvents[msg.sender].push(_eventId);

        emit TicketPurchased(_eventId, msg.sender, eventDetails.ticketsSold);
    }

    function deactivateEvent(uint256 _eventId) public {
        Event storage eventDetails = events[_eventId];
        require(eventDetails.active, "Event is already inactive");
        eventDetails.active = false;
    }

    function getEventDetails(uint256 _eventId) public view returns (EventDetails memory) {
        return events[_eventId].details;
    }

    function getEventAttendees(uint256 _eventId) public view returns (address[] memory) {
        return events[_eventId].attendees;
    }

    function getTicketNFTAddress(uint256 _eventId) public view returns (address) {
        return events[_eventId].ticketNFTAddress;
    }

    // Function to get all events a user has registered for
    function getRegisteredEvents(address _user) public view returns (uint256[] memory) {
        return userRegisteredEvents[_user];
    }
}
