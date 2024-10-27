// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/utils/Strings.sol";
contract PolkaGift {

    /// Highest bidder struct
    struct highest_bidder_struct {
        ///Token Id
        string token_id;
        ///Event Id
        string event_id;
        ///Highest Bidder
        address wallet;
        ///Highest Bid price
        string price;
    }


    struct event_token_struct{
        ///Event Id
        string event_id;
        ///Token Uri
        string token_uri;
    }
    struct token_bid_struct{
        ///Token Id
        string token_id;
        ///Bid URI
        string bid_uri;

    }

    uint256 private _tokenIds;
    uint256 private _bidIds;
    uint256 private _eventIds;
    uint256 private _EventTokenIds;
    uint256 private _TokenBidIds;
    uint256 private _TokenHighestBidIds;
    uint256 public _EventTokenSearchIds;
    mapping(string => bool) public AllEventEndTime; //Event ID => bool
    mapping(uint256 => event_token_struct) private AllEventTokens;
    mapping(uint256 => token_bid_struct) private AllTokensBids;
    mapping(uint256 => highest_bidder_struct) public TokenHighestBidders; //_TokenHighestBidIds => highest bidder struct
    mapping(string => string[2]) public _SearchedStore;
    mapping(string => string) private _bidURIs;
    mapping(string => string) private _tokenURIs; //_tokenIds => Token URI
    mapping(string => string[2]) private _eventURIs;
    mapping(string => string) private _eventRaised;

    function claimToken(
        address _claimer,
        string memory _tokenURI,
        string memory _eventid
    ) public returns (uint256) {
        _setTokenURI(string.concat("m_" , Strings.toString(_tokenIds)), _tokenURI);
        _setTokenEvent(_EventTokenIds, _eventid, _tokenURI);

        _tokenIds++;
        _EventTokenIds++;
        return _tokenIds;
    }

    function _setTokenEvent(
        uint256 EventTokenId,
        string memory EventId,
        string memory _tokenURI
    ) public virtual {
        AllEventTokens[EventTokenId] = event_token_struct(
            string(EventId),
            string(_tokenURI)
        );
    }

    function createEvent(
        string memory _eventWallet,
        string memory _eventURI,
        uint256 endtime
    ) public returns (uint256) {
        string memory new_event_id = string.concat("m_" , Strings.toString(_eventIds));

        _setEventURI(new_event_id, _eventWallet, _eventURI);
        _setEventRaised(new_event_id, "0");
        AllEventEndTime[new_event_id] = false;
        _eventIds++;

        return _eventIds;
    }


    function distribute_event(string memory eventID) public{ 
      
    AllEventEndTime[eventID] = true;

    }
    function gettokenIdByUri(string memory _tokenURI)
        public
        view
        virtual
        returns (uint256)
    {
        for (uint256 i = 0; i < _tokenIds; i++) {
            if (
                keccak256(bytes(_tokenURIs[string.concat("m_", Strings.toString(i))])) == keccak256(bytes(_tokenURI))
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
                keccak256(bytes(_eventURIs[string.concat("m_", Strings.toString(i))][1])) ==
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
            if (keccak256(bytes(_bidURIs[string.concat("m_", Strings.toString(i))])) == keccak256(bytes(_bidURI))) {
                return i;
            }
        }

        return 0;
    }

    function gettokenSearchEventTotal(string memory EventID)
        public
        view
        virtual
        returns (string[] memory)
    {
        string[] memory _SearchedStoreToken = new string[](10);

        uint256 _EventTokenSearchIds2 = 0;

        for (uint256 i = 0; i < _EventTokenIds; i++) {
            if (
                keccak256(bytes(AllEventTokens[i].event_id)) ==
                keccak256(bytes(string(EventID)))
            ) {
                _SearchedStoreToken[_EventTokenSearchIds2] = AllEventTokens[i].token_uri;
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
                keccak256(bytes(_eventURIs[string.concat("m_", Strings.toString(i))][0])) == keccak256(bytes(Wallet))
            ) {
                _TemporarySearch++;
            }
        }
        string[] memory _SearchedStoreEvents = new string[](_TemporarySearch);
        for (uint256 i = 0; i < _eventIds; i++) {
            if (
                keccak256(bytes(_eventURIs[string.concat("m_", Strings.toString(i))][0])) == keccak256(bytes(Wallet))
            ) {
                _SearchedStoreEvents[_SearchIds] = _eventURIs[string.concat("m_", Strings.toString(i))][1];
                _SearchIds++;
            }
        }

        return _SearchedStoreEvents;
    }

    function getGetEventsTokenID(string memory EventId, string memory _tokenURI)
        public
        view
        virtual
        returns (uint256)
    {
        for (uint256 i = 0; i < _EventTokenIds; i++) {
            if (
                keccak256(bytes(AllEventTokens[i].event_id)) ==
                keccak256(bytes(string(EventId))) &&
                keccak256(bytes(AllEventTokens[i].token_uri)) ==
                keccak256(bytes(_tokenURI))
            ) {
                return i;
            }
        }

        return 0;
    }

    function _getSearchedTokenURI(string memory _tokenId)
        public
        view
        virtual
        returns (string memory)
    {
        return _SearchedStore[_tokenId][0];
    }

    function _setEventURI(
        string memory eventId,
        string memory _eventWallet,
        string memory _eventURI
    ) public virtual {
        _eventURIs[eventId] = [_eventWallet, _eventURI];
    }

    function _setTokenURI(string memory tokenId, string memory _tokenURI)
        public
        virtual
    {
        _tokenURIs[tokenId] = _tokenURI;
                
    }

    function eventURI(string memory eventId) public view returns (string[2] memory) {
        return _eventURIs[eventId];
    }

    function tokenURI(string memory tokenId)
        public
        view
        virtual
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

    function _setBidURI(string memory bidId, string memory _bidURI) public virtual {
        _bidURIs[bidId] = _bidURI;
    }

    function BidURI(string memory BidId) public view returns (string memory) {
        return _bidURIs[BidId];
    }

    function getTotalBid(string memory TokenID)
        public
        view
        virtual
        returns (string[] memory)
    {
        string[] memory _SearchedStoreBid = new string[](10);

        uint256 _TokenBidSearchIds2 = 0;

        for (uint256 i = 0; i < _TokenBidIds; i++) {
            if (
                keccak256(bytes(AllTokensBids[i].token_id)) ==
                keccak256(bytes(string(TokenID)))
            ) {
                _SearchedStoreBid[_TokenBidSearchIds2] = AllTokensBids[i].bid_uri;
                _TokenBidSearchIds2++;
            }
        }

        return _SearchedStoreBid;
    }

    function getBidsSearchToken(string memory TokenID)
        public
        view
        virtual
        returns (string[] memory)
    {
        string[] memory _SearchedStoreBid = new string[](10);

        uint256 _TokenBidSearchIds2 = 0;

        for (uint256 i = 0; i < _TokenBidIds; i++) {
            if (
                keccak256(bytes(AllTokensBids[i].token_id)) ==
                keccak256(bytes(string(TokenID)))
            ) {
                _SearchedStoreBid[_TokenBidSearchIds2] = AllTokensBids[i].bid_uri;
                _TokenBidSearchIds2++;
            }
        }

        return _SearchedStoreBid;
    }

    function _setTokenBid(
        uint256 TokenBidId,
        string memory TokenId,
        string memory _BidURI
    ) public virtual {
        AllTokensBids[TokenBidId] = token_bid_struct(
            string(TokenId),
            string(_BidURI)
        );
    }


    function _setTokenHighestBid(
        string memory token_id,
        string memory event_id,
        address wallet,
        string memory price
    ) public virtual {

        string memory old_id = getTokenHighestBid(token_id);
        if ( keccak256(bytes(old_id)) != keccak256(bytes(string("-1")))){

            TokenHighestBidders[strToUint(old_id)]= highest_bidder_struct({
                token_id: token_id,
                event_id: event_id,
                wallet: wallet,
                price: price
            });
        }else{
            TokenHighestBidders[_TokenHighestBidIds] = highest_bidder_struct({
                token_id: token_id,
                event_id: event_id,
                wallet: wallet,
                price: price
            });
            _TokenHighestBidIds++;
        }

    }
    function strToUint(string memory _str) public pure returns(uint256 res) {
        
        for (uint256 i = 0; i < bytes(_str).length; i++) {
            if ((uint8(bytes(_str)[i]) - 48) < 0 || (uint8(bytes(_str)[i]) - 48) > 9) {
                return (0);
            }
            res += (uint8(bytes(_str)[i]) - 48) * 10**(bytes(_str).length - i - 1);
        }
        
        return (res);
    }
    function getTokenHighestBid(string memory token_id)   
        public
        view
        virtual
        returns (string memory){
            for (uint256 i = 0; i < _TokenHighestBidIds; i++) {
            if (
                    keccak256(bytes(TokenHighestBidders[i].token_id)) ==
                    keccak256(bytes(string(token_id)))
                ) {
                    return Strings.toString(i);
                }
            }
            return "-1";

        }

    function getEventRaised(string memory _eventId)
        public
        view
        virtual
        returns (string memory)
    {
        return _eventRaised[_eventId];
    }

    function _setEventRaised(string memory _eventId, string memory _raised) public {
        _eventRaised[_eventId] = _raised;
    }

    function createBid(
        string memory _tokenId,
        string memory _bidURI,
        string memory _eventid,
        string memory _raised,
        string memory _bid_price

    ) public {
        uint256 _EventTokenId = getGetEventsTokenID(
            _eventid,
            _tokenURIs[_tokenId]
        );

        _setTokenHighestBid(_tokenId,_eventid,msg.sender,_bid_price);
        
        _setEventRaised(_eventid, _raised);

        _setTokenBid(_TokenBidIds, _tokenId, _bidURI);
        _TokenBidIds++;
        _bidIds++;
    }
}
