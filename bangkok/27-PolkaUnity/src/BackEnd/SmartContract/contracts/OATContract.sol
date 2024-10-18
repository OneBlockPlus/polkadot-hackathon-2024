pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OATContract is ERC721, Ownable {
    enum OATTYPE {
        Staking, // 0,
        CreationTime, // 1,
        Transfer // 2,
    }

    struct OATInfo {
        string name;
        uint128 score;
        string description;
        OATTYPE oatType;
    }

    mapping(uint256 => OATInfo) public OAT;

    mapping(address => uint256[3]) public HoldingList;
    
    error BannedTransfer();

    constructor(string memory name_, string memory symbol_) ERC721(name_, symbol_) Ownable(msg.sender) {}

    function getScore(uint256 _tokenId) public virtual returns (uint128) {
        return OAT[_tokenId].score;
    }

    function transferFrom(address from, address to, uint256 tokenId) override public virtual {
        revert BannedTransfer();
    }

    function safeTransferFrom(address from, address to, uint256 tokenId, bytes memory data) override public virtual {
        revert BannedTransfer();
    }

    function mintOAT(address to, string memory name, uint128 score, string memory description, OATTYPE oattype) public {
        require(msg.sender == owner(), "Not owner");
        if (to == address(0)) {
            revert ERC721InvalidReceiver(address(0));
        }

        if (oattype == OATTYPE.Staking) {
            if (OAT[HoldingList[to][0]].score == score) {
                return;
            }
        }

        if (oattype == OATTYPE.CreationTime) {
            if (OAT[HoldingList[to][1]].score == score) {
                return;
            }
        }

        if (oattype == OATTYPE.Transfer) {
            if (OAT[HoldingList[to][2]].score == score) {
                return;
            }
        }

        uint256 tokenId = _generateToken();

        address previousOwner = _update(to, tokenId, address(0));

        if (previousOwner != address(0)) {
            revert ERC721InvalidSender(address(0));
        }

        OATInfo memory oatInfo = OATInfo (name, score, description, oattype);
        OAT[tokenId] = oatInfo;
        
        if (oattype == OATTYPE.Staking) {
            HoldingList[to][0] = tokenId;
        }

        if (oattype == OATTYPE.CreationTime) {
            HoldingList[to][1] = tokenId;
        }

        if (oattype == OATTYPE.Transfer) {
            HoldingList[to][2] = tokenId;
        }

        return;
    }

    function _generateToken() private view returns (uint256) {
        return uint256(keccak256(abi.encode(block.timestamp)));
    }
}


