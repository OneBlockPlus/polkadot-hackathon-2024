// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PolkaGift is ERC721 {

    /// Highest bidder struct
    struct highest_bidder_struct {
        ///Token Id
        uint256 token_id;
        ///Event Id
        uint256 event_id;
        ///Highest Bidder
        address wallet;
    }

    /// Highest bidder struct
    struct event_endtime_struct {
        ///Event Id
        uint256 event_id;
        ///End Time
        uint256 end_time;
        ///Ended?
        bool ended;
    }

    uint256 private _tokenIds;
    uint256 private _bidIds;
    uint256 private _eventIds;
    uint256 private _EventTokenIds;
    uint256 private _TokenBidIds;
    uint256 private _TokenHighestBidIds;
    uint256 public _EventTokenSearchIds;
    mapping(uint256 => event_endtime_struct) public AllEventEndTime; //Event ID => event_endtime_struct
    mapping(uint256 => string[2]) private AllEventTokens;
    mapping(uint256 => string[2]) private AllTokensBids;
    mapping(uint256 => highest_bidder_struct) private TokenHighestBidders; //_TokenHighestBidIds => highest bidder struct
    mapping(uint256 => string[2]) public _SearchedStore;
    mapping(uint256 => string) private _bidURIs;
    mapping(uint256 => string) private _tokenURIs;
    mapping(uint256 => string[2]) private _eventURIs;
    mapping(uint256 => string) private _eventRaised;
    constructor() public ERC721("PolkaGift", "PCOIN") {}

    function claimToken(
        address _claimer,
        string memory _tokenURI,
        uint256 _eventid
    ) public returns (uint256) {
        _mint(_claimer, _tokenIds);
        _setTokenURI(_tokenIds, _tokenURI);
        _setTokenEvent(_EventTokenIds, _eventid, _tokenURI);
        _tokenIds++;
        _EventTokenIds++;
        return _tokenIds;
    }

    function _setTokenEvent(
        uint256 EventTokenId,
        uint256 EventId,
        string memory _tokenURI
    ) public virtual {
        AllEventTokens[EventTokenId] = [
            Strings.toString(EventId),
            string(_tokenURI)
        ];
    }

    function createEvent(
        string memory _eventWallet,
        string memory _eventURI,
        uint256 endtime
    ) public returns (uint256) {
        _setEventURI(_eventIds, _eventWallet, _eventURI);
        _setEventRaised(_eventIds, "0");
        AllEventEndTime[_eventIds] = event_endtime_struct({
            event_id:_eventIds,
            end_time:endtime,
            ended:false
        });
        _eventIds++;

        return _eventIds;
    }
    function distributeFull() public  {
        for (uint256 i = 0; i < _eventIds; i++) {
            event_endtime_struct memory endInfo = AllEventEndTime[i];
            bool Distribute = endInfo.end_time < block.timestamp ;
            if (Distribute == true && endInfo.ended == false) {
                distribute_event(i);
            }
        }
    }

    function distribute_event(uint256 eventID) public{ 
        for (uint256 i = 0; i < _TokenHighestBidIds; i++) {
           highest_bidder_struct memory hbidder = TokenHighestBidders[i];
            if (
               TokenHighestBidders[i].event_id == eventID
            ) {               
               _transfer(ownerOf(hbidder.token_id),hbidder.wallet,hbidder.token_id);
                AllEventEndTime[eventID].ended = true;
            }
        }

    }
    function gettokenIdByUri(string memory _tokenURI)
        public
        view
        virtual
        returns (uint256)
    {
        for (uint256 i = 0; i < _tokenIds; i++) {
            if (
                keccak256(bytes(_tokenURIs[i])) == keccak256(bytes(_tokenURI))
            ) {
                return i;
            }
        }

        return 0;
    }

    function getEventIdByURI(string memory _eventURI)
        public
        view
        virtual
        returns (uint256)
    {
        for (uint256 i = 0; i < _eventIds; i++) {
            if (
                keccak256(bytes(_eventURIs[i][1])) ==
                keccak256(bytes(_eventURI))
            ) {
                return i;
            }
        }

        return 0;
    }

    function getBidIdByUri(string memory _bidURI)
        public
        view
        virtual
        returns (uint256)
    {
        for (uint256 i = 0; i < _bidIds; i++) {
            if (keccak256(bytes(_bidURIs[i])) == keccak256(bytes(_bidURI))) {
                return i;
            }
        }

        return 0;
    }

    function gettokenSearchEventTotal(uint256 EventID)
        public
        view
        virtual
        returns (string[] memory)
    {
        string[] memory _SearchedStoreToken = new string[](10);

        uint256 _EventTokenSearchIds2 = 0;

        for (uint256 i = 0; i < _EventTokenIds; i++) {
            if (
                keccak256(bytes(AllEventTokens[i][0])) ==
                keccak256(bytes(Strings.toString(EventID)))
            ) {
                _SearchedStoreToken[_EventTokenSearchIds2] = AllEventTokens[i][
                    1
                ];
                _EventTokenSearchIds2++;
            }
        }

        return _SearchedStoreToken;
    }

    function getSearchEventbyWallet(string memory Wallet)
        public
        view
        virtual
        returns (string[] memory)
    {
        uint256 _TemporarySearch = 0;
        uint256 _SearchIds = 0;

        for (uint256 i = 0; i < _eventIds; i++) {
            if (
                keccak256(bytes(_eventURIs[i][0])) == keccak256(bytes(Wallet))
            ) {
                _TemporarySearch++;
            }
        }
        string[] memory _SearchedStoreEvents = new string[](_TemporarySearch);
        for (uint256 i = 0; i < _eventIds; i++) {
            if (
                keccak256(bytes(_eventURIs[i][0])) == keccak256(bytes(Wallet))
            ) {
                _SearchedStoreEvents[_SearchIds] = _eventURIs[i][1];
                _SearchIds++;
            }
        }

        return _SearchedStoreEvents;
    }

    function getGetEventsTokenID(uint256 EventId, string memory _tokenURI)
        public
        view
        virtual
        returns (uint256)
    {
        for (uint256 i = 0; i < _EventTokenIds; i++) {
            if (
                keccak256(bytes(AllEventTokens[i][0])) ==
                keccak256(bytes(Strings.toString(EventId))) &&
                keccak256(bytes(AllEventTokens[i][1])) ==
                keccak256(bytes(_tokenURI))
            ) {
                return i;
            }
        }

        return 0;
    }

    function _getSearchedTokenURI(uint256 _tokenId)
        public
        view
        virtual
        returns (string memory)
    {
        return _SearchedStore[_tokenId][0];
    }

    function _setEventURI(
        uint256 eventId,
        string memory _eventWallet,
        string memory _eventURI
    ) public virtual {
        _eventURIs[eventId] = [_eventWallet, _eventURI];
    }

    function _setTokenURI(uint256 tokenId, string memory _tokenURI)
        public
        virtual
    {
        _tokenURIs[tokenId] = _tokenURI;
                
    }

    function eventURI(uint256 eventId) public view returns (string[2] memory) {
        return _eventURIs[eventId];
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override 
        returns (string memory)
    {
        return _tokenURIs[tokenId];
    }

    function totalSupply() public view returns (uint256) {
        return _tokenIds;
    }

    function totalEvent() public view returns (uint256) {
        return _eventIds;
    }

    function _setBidURI(uint256 bidId, string memory _bidURI) public virtual {
        _bidURIs[bidId] = _bidURI;
    }

    function BidURI(uint256 BidId) public view returns (string memory) {
        return _bidURIs[BidId];
    }

    function getTotalBid(uint256 TokenID)
        public
        view
        virtual
        returns (string[] memory)
    {
        string[] memory _SearchedStoreBid = new string[](10);

        uint256 _TokenBidSearchIds2 = 0;

        for (uint256 i = 0; i < _TokenBidIds; i++) {
            if (
                keccak256(bytes(AllTokensBids[i][0])) ==
                keccak256(bytes(Strings.toString(TokenID)))
            ) {
                _SearchedStoreBid[_TokenBidSearchIds2] = AllTokensBids[i][1];
                _TokenBidSearchIds2++;
            }
        }

        return _SearchedStoreBid;
    }

    function getBidsSearchToken(uint256 TokenID)
        public
        view
        virtual
        returns (string[] memory)
    {
        string[] memory _SearchedStoreBid = new string[](10);

        uint256 _TokenBidSearchIds2 = 0;

        for (uint256 i = 0; i < _TokenBidIds; i++) {
            if (
                keccak256(bytes(AllTokensBids[i][0])) ==
                keccak256(bytes(Strings.toString(TokenID)))
            ) {
                _SearchedStoreBid[_TokenBidSearchIds2] = AllTokensBids[i][1];
                _TokenBidSearchIds2++;
            }
        }

        return _SearchedStoreBid;
    }

    function _setTokenBid(
        uint256 TokenBidId,
        uint256 TokenId,
        string memory _BidURI
    ) public virtual {
        AllTokensBids[TokenBidId] = [
            Strings.toString(TokenId),
            string(_BidURI)
        ];
    }


    function _setTokenHighestBid(
        uint256 token_id,
        uint256 event_id,
        address wallet
    ) public virtual {
        TokenHighestBidders[_TokenHighestBidIds] = highest_bidder_struct({
            token_id: token_id,
            event_id: event_id,
            wallet: wallet
        });
        _TokenHighestBidIds++;
    }
    function getEventRaised(uint256 _eventId)
        public
        view
        virtual
        returns (string memory)
    {
        return _eventRaised[_eventId];
    }

    function _setEventRaised(uint256 _eventId, string memory _raised) public {
        _eventRaised[_eventId] = _raised;
    }

    function createBid(
        uint256 _tokenId,
        string memory _bidURI,
        string memory _updatedURI,
        uint256 _eventid,
        string memory _raised
    ) public {
        uint256 _EventTokenId = getGetEventsTokenID(
            _eventid,
            _tokenURIs[_tokenId]
        );
        _tokenURIs[_tokenId] = _updatedURI;
        _setTokenHighestBid(_tokenId,_eventid,msg.sender);
        
        _setTokenEvent(_EventTokenId, _eventid, _updatedURI);
        _setEventRaised(_eventid, _raised);

        _setTokenBid(_TokenBidIds, _tokenId, _bidURI);
        _TokenBidIds++;
        _bidIds++;
    }
}
