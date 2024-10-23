// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@rmrk-team/evm-contracts/contracts/RMRK/catalog/RMRKCatalog.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CNFTCatalog is RMRKCatalog, Ownable {
    constructor(string memory _childBaseUri) RMRKCatalog(_childBaseUri, "slots") Ownable(msg.sender) {}

	function addPartAndSetEquipableForAll(
		uint64 partId, 
		string memory metadataURI, 
		address contractAddress
	) external onlyOwner {
		address[] memory addresses = new address[](1);
		addresses[0] = contractAddress;

		_addPart(
			IntakeStruct({
				partId: partId,
				part: Part({
					itemType: ItemType.Slot,
					z: 0,
					equippable: addresses,
					metadataURI: metadataURI
				})
    		})
		);
	}
}