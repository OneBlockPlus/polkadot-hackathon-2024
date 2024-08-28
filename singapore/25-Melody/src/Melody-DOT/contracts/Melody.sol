// SPDX-License-Identifier: Apache-2.0

pragma solidity ^0.8.24;

import {RMRKMultiAssetPreMint} from
    "@rmrk-team/evm-contracts/contracts/implementations/premint/RMRKMultiAssetPreMint.sol";
import {RMRKAbstractMultiAsset} from
    "@rmrk-team/evm-contracts/contracts/implementations/abstract/RMRKAbstractMultiAsset.sol";

contract Melody is RMRKMultiAssetPreMint {
    // Events
    // Variables

    // Constructor
    constructor(
        string memory collectionMetadata,
        uint256 maxSupply,
        address royaltyRecipient,
        uint16 royaltyPercentageBps
    ) RMRKMultiAssetPreMint("Melody", "MLD", collectionMetadata, maxSupply, royaltyRecipient, royaltyPercentageBps) {}

    // Methods
    function mint(address to, uint256 numToMint, string memory tokenURI)
        public
        override
        returns (uint256 firstTokenId)
    {
        (uint256 nextToken, uint256 totalSupplyOffset) = _prepareMint(numToMint);

        for (uint256 i = nextToken; i < totalSupplyOffset;) {
            _setTokenURI(i, tokenURI);
            _safeMint(to, i, "");
            unchecked {
                ++i;
            }
        }

        firstTokenId = nextToken;
    }
}
