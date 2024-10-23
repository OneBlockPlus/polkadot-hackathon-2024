// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// npm install @openzeppelin/contracts
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

contract PflixNFT is ERC721 {

    uint32 public amount;

    string public url;

    mapping(string => string) public _assetIdToFileName;
    mapping(string => string) public _assetIdToFileUrl;
    mapping(uint256 => string) public _tokenIdToCoverImage;

    constructor(
        string memory name_, 
        string memory symbol_, 
        uint32 amount_, 
        string memory url_
    ) ERC721(name_, symbol_) {
        amount = amount_;
        url = url_;
    }

    function batchMint(uint32 _number, string memory _assetId, string memory _fileName, string memory _fileUrl,string memory _coverURL) public {
        require(amount >= _number, "The NFT casting quantity has reached the upper limit");

        for (uint32 i = 0; i < _number; i++) {
            uint256 tokenId = uint256(keccak256(abi.encodePacked(_assetId, uint2str(i))));
            _mint(msg.sender, tokenId);
            _assetIdToFileName[_assetId] = _fileName;
            _assetIdToFileUrl[_assetId] = _fileUrl;
            _tokenIdToCoverImage[tokenId] = _coverURL;
        }
    }

    /**
    * @dev See {IERC721Metadata-tokenURI}.
    */
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        _requireOwned(tokenId);

        string memory coverImage = _tokenIdToCoverImage[tokenId];

        return coverImage;
    }

    function uint2str(uint256 _i) internal view returns (string memory) {
        uint256 maxLen = amount;
        uint256 numLen = 1;
        uint256 temp = maxLen;
        while (temp > 9) {
            temp /= 10;
            numLen++;
        }

        bytes memory bstr = new bytes(numLen);
        for (uint256 j = numLen; j > 0; j--) {
            bstr[j - 1] = bytes1(uint8(48 + (_i % 10)));
            _i /= 10;
        }
        return string(bstr);
    }

    /**
     * @dev Base URI for computing {tokenURI}. If set, the resulting URI for each
     * token will be the concatenation of the `baseURI` and the `tokenId`. Empty
     * by default, can be overridden in child contracts.
     */
    function _baseURI() internal view virtual override returns (string memory) {
        return url;
    }
}
