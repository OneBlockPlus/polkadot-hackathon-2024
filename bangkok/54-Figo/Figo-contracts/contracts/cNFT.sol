// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@rmrk-team/evm-contracts/contracts/RMRK/equippable/RMRKEquippable.sol";
import "@rmrk-team/evm-contracts/contracts/RMRK/catalog/RMRKCatalog.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

import "./CNFTCatalog.sol";

error MaxSupplyReached();
error InvalidPaymentAmount();
error InvalidEquipmentType();
error InvalidEquipmentSubtype();
error ParentHasNoChildren();

contract CNFT is RMRKEquippable, Ownable {
    using Strings for uint64;

	enum Parents {
		Garfield,
		Gary,
		Grafitti,
		Heartfelt,
		Peach,
		Ted,
		Tetris
	}

	uint64 constant PARENT = 1;
	uint64 constant WEAPON = 8;
	uint64 constant ACCESSORY = 11;
	uint64 constant BOOTS = 14;

	address public catalog;

	string _baseURI;

	uint64 _parentTokenId;
	uint64 _parentTokensAmount;
	uint64 _totalSupply;

	uint256 constant TOKEN_PRICE = 0.1 ether;

    mapping(uint64 => uint64) public types;

	event MintParent(address indexed to, Parents parentType, uint256 tokenId);
	event MintChild(uint64 parentId, uint64 equipmentType, uint8 equipmentSubType, uint256 childTokenId);
	event EquipChild(uint64 parentId, uint64 equipmentType, uint8 equipmentSubType, uint256 childTokenId);
	event UnequipChild(uint64 parentId, uint64 equipmentType);
	event TransferEquipment(uint256 parentIdFrom, uint64 equipmentType, uint8 equipmentSubType, uint256 parentIdTo);

    constructor(string memory baseURI) RMRKEquippable() Ownable(msg.sender) {
        _baseURI = baseURI;

		_parentTokenId = 1;
		_parentTokensAmount = 1;
		_totalSupply = 1000;

		CNFTCatalog Catalog = new CNFTCatalog(_baseURI); // Add metadata for catalog itself
		catalog = address(Catalog);
    }

    function _getTokenURI(uint64 tokenType) internal view returns (string memory) {
		return string(abi.encodePacked(_baseURI, tokenType.toString(), ".json"));
    }

	function setBaseURI(string memory baseURI) external onlyOwner {
		_baseURI = baseURI;
	}

    function setPartsAndAssets() external onlyOwner {
		for(uint64 i = 8; i <= 14; i++) {
			CNFTCatalog(catalog).addPartAndSetEquipableForAll(i, _getTokenURI(i), address(this));
			_setValidParentForEquippableGroup(i, address(this), i < 11 ? 8 : i < 14 ? 11 : 14);
		}
    }                                      

    function mintParent(address to, Parents parentType) external payable {
		// if(msg.value < TOKEN_PRICE) revert InvalidPaymentAmount();
		if(_parentTokensAmount == _totalSupply) revert MaxSupplyReached();

		uint64 assetId = _parentTokenId;
		uint64 tokenType = PARENT + uint64(parentType);

		uint64[] memory partsId = new uint64[](7);
		for(uint64 i = 8; i <= 14; i++) {
			partsId[i - 8] = i;
		}

		RMRKEquippable._addAssetEntry(
			assetId,
			tokenType,
			address(catalog),
			_getTokenURI(tokenType),
			partsId
		);

		uint256 tokenId = uint256(_parentTokenId);
        _safeMint(to, tokenId, "");
		_approve(msg.sender, _parentTokenId);
		_approveForAssets(msg.sender, _parentTokenId);
		_addAssetToToken(tokenId, assetId, 0);
		acceptAsset(tokenId, 0, assetId);

		_parentTokenId += 8;
        _parentTokensAmount++;

		emit MintParent(msg.sender, parentType, tokenId);
    }

    function _mintEquipment(uint64 parentTokenId, uint64 equipmentType, uint8 equipmentSubType) internal returns(uint256 tokenId) {
		uint64 groupId = equipmentType + equipmentSubType;
		uint64 assetId = parentTokenId + 1 + groupId - 8;
		tokenId = uint256(assetId);

		uint64[] memory partsId = new uint64[](0);
		RMRKEquippable._addAssetEntry(
			assetId,
			groupId,
			address(catalog),
			_getTokenURI(groupId),
			partsId
		);

		_nestMint(
            address(this),
			tokenId,
			parentTokenId,
			""
		);
		_approve(msg.sender, tokenId);
		_approveForAssets(msg.sender, tokenId);
		_addAssetToToken(tokenId, assetId, 0);
		acceptAsset(tokenId, 0, assetId);

        types[assetId] = equipmentType;

		emit MintChild(parentTokenId, equipmentType, equipmentSubType, tokenId);
    }

    function mintAndEquip(
		uint64 parentTokenId,
		uint64 equipmentType,
		uint8 equipmentSubType
	) external {
		if(equipmentType != 8 && equipmentType != 11 && equipmentType != 14) revert InvalidEquipmentType();
		if(equipmentType == 14 && equipmentSubType > 0 || equipmentSubType > 2) revert InvalidEquipmentSubtype();

		uint256 childTokenId = _mintEquipment(parentTokenId, equipmentType, equipmentSubType);	
		acceptChild(uint256(parentTokenId), 0, address(this), childTokenId);

		Child[] memory children = childrenOf(uint256(parentTokenId));

		equip(
			IntakeEquip({
				tokenId: uint256(parentTokenId),
				childIndex: children.length - 1,
				assetId: parentTokenId,
				slotPartId: equipmentType,
				childAssetId: uint64(childTokenId)
			})	
		);
		emit EquipChild(parentTokenId, equipmentType, equipmentSubType, childTokenId);
	}

	function addEquipment(
		uint64 parentTokenId,
		uint64 equipmentType,
		uint8 equipmentSubType
	) external {
		if(equipmentType != 8 && equipmentType != 11 && equipmentType != 14) revert InvalidEquipmentType();
		if(equipmentType == 14 && equipmentSubType > 0 || equipmentSubType > 2) revert InvalidEquipmentSubtype();

		uint64 childTokenId = parentTokenId + 1 + equipmentType + equipmentSubType - 8;

		Child[] memory children = childrenOf(uint256(parentTokenId));
		uint64 childIndex = 0;
		for(uint64 i = 0; i < children.length; i++) {
			if(children[i].tokenId == childTokenId) {
				childIndex = i;
				break;
			}
		}

		equip(
			IntakeEquip({
				tokenId: uint256(parentTokenId),
				childIndex: childIndex,
				assetId: parentTokenId,
				slotPartId: equipmentType,
				childAssetId: childTokenId
			})	
		);
		emit EquipChild(parentTokenId, equipmentType, equipmentSubType, childTokenId);
	}
	
    function removeEquipment(
        uint64 parentTokenId,
        uint64 equipmentType
    ) external {
       	if(equipmentType != 8 && equipmentType != 11 && equipmentType != 14) revert InvalidEquipmentType();

        unequip(
			uint256(parentTokenId),
			parentTokenId,
			uint64(equipmentType)
		); 
		emit UnequipChild(parentTokenId, equipmentType);
    }

	function transferEquipment(
		uint256 parentTokenId, 
		uint64 equipmentType, 
		uint8 equipmentSubType, 
		uint256 toParentId
	) external {
		if(equipmentType != 8 && equipmentType != 11 && equipmentType != 14) revert InvalidEquipmentType();
		if(equipmentType == 14 && equipmentSubType > 0 || equipmentSubType > 2) revert InvalidEquipmentSubtype();

		uint256 childId = parentTokenId + 1 + equipmentType + equipmentSubType - 8;

		Child[] memory children = childrenOf(parentTokenId);
		if(children.length == 0) revert ParentHasNoChildren();

		uint256 childIndex = 0;
		for(uint256 i = 0; i < children.length; i++) {
			if(children[i].tokenId == childId) {
				childIndex = i;
				break;
			}
		}

		transferChild(
			parentTokenId,
			address(this),
			toParentId,
			childIndex,
			address(this),
			childId,
			false,
			""
		);
		emit TransferEquipment(parentTokenId, equipmentType, equipmentSubType, toParentId);
	}

	function approvedLastReceivedEquipment(uint256 parentTokenId) external {
		Child[] memory children = pendingChildrenOf(parentTokenId);
		acceptChild(parentTokenId, 0, address(this), children[children.length - 1].tokenId);
	}

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}