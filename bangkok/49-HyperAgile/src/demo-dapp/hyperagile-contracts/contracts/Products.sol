// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";

import './interfaces/Enums.sol';

import "./utils/WarehouseManager.sol";

contract Products is ERC1155, WarehouseManager {

	mapping (Enums.ProductId => uint256) public stock;
	mapping (uint256 => string) public uriStorage;

	constructor(string memory baseUri) WarehouseManager() ERC1155(baseUri) {
		stock[Enums.ProductId.Green] = 1000;
		stock[Enums.ProductId.Purple] = 1000;
		stock[Enums.ProductId.Blue] = 1000;

		uriStorage[0] = "https://rose-principal-turtle-588.mypinata.cloud/ipfs/QmSGmf1pUFwD1m9q2pwZrLKw1ToAqCjuh8RfMNQ7b3K35t";
		uriStorage[1] = "https://rose-principal-turtle-588.mypinata.cloud/ipfs/QmadtwcWu9XJrRvu6MbcRkixeKucjzXhF24X6h8L242dyj";
		uriStorage[2] = "https://rose-principal-turtle-588.mypinata.cloud/ipfs/QmbubD3uz2B7agdxZmfEM3RJNpDUgZvhjgM9CyADdBqi5K";
	}

	function mintProduct(Enums.ProductId productId, address receiver) onlyWarehouse public {
		require(stock[productId] > 0, 'Out of stock');
		_mint(receiver, uint256(productId), 1, "");
		stock[productId]--;
	}

	function replenish(Enums.ProductId productId, uint256 amount) public {
		require(msg.sender == owner, 'Not An Owner');
		stock[productId] += amount;
	}

    function uri(uint256 id) public view virtual override returns (string memory) {
        return uriStorage[id];
    }
}