// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC165} from "@openzeppelin/contracts/utils/introspection/IERC165.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract MockProduct is Ownable, ERC721 {
    string public BASE_TOKEN_URI;
    uint256 private _tokenIdCount;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) Ownable(msg.sender) ERC721(name, symbol) {
        BASE_TOKEN_URI = baseTokenURI;
        _tokenIdCount = 1;
    }

    function mint(address to) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCount++;
        _mint(to, tokenId);
        return tokenId;
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view virtual override(ERC721) returns (bool) {
        return
            interfaceId == type(IProduct).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function _baseURI() internal view override returns (string memory) {
        return BASE_TOKEN_URI;
    }
}

interface IProduct is IERC721 {
    /**
     * @notice Initializes the product with the given parameters.
     * @param name The name of the product.
     * @param symbol The symbol of the product.
     * @param baseTokenURI The base URI for the product's tokens.
     */
    function initialize(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) external;

    /**
     * @notice Mints a new token to the specified address.
     * @param to The address to mint the token to.
     * @return uint256 The token ID of the newly minted token.
     */
    function mint(address to) external returns (uint256);
}