// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "./interfaces/IWarehouse.sol";

error NotAnOwner();
error NotAMutliSigner();


contract PickingRobot {

	IWarehouse Warehouse;
	address _owner;

	constructor(address warehouse) {
		Warehouse = IWarehouse(warehouse);
		_owner = msg.sender;
	}

	function pickOrder(string memory orderId, address verifier, uint8 v, bytes32 r, bytes32 s) external {
		if(msg.sender != _owner) revert NotAnOwner();
		if(ecrecover(keccak256(abi.encodePacked(orderId)), v, r, s) != verifier) revert NotAMutliSigner();
		Warehouse.pickOrder(orderId, verifier);
	}
}

contract PackingRobot {
	
	IWarehouse Warehouse;
	address _owner;

	constructor(address warehouse) {
		Warehouse = IWarehouse(warehouse);
		_owner = msg.sender;
	}

	function packOrder(string memory orderId, address verifier, uint8 v, bytes32 r, bytes32 s) external {
		if(msg.sender != _owner) revert NotAnOwner();
		if(ecrecover(keccak256(abi.encodePacked(orderId)), v, r, s) != verifier) revert NotAMutliSigner();
		Warehouse.packOrder(orderId, verifier);
	}
}

contract DeliveryRobot {
	
	IWarehouse Warehouse;
	address _owner;

	constructor(address warehouse) {
		Warehouse = IWarehouse(warehouse);
		_owner = msg.sender;
	}

	function deliverOrder(string memory orderId, address verifier, uint8 v, bytes32 r, bytes32 s) external {
		if(msg.sender != _owner) revert NotAnOwner();
		if(ecrecover(keccak256(abi.encodePacked(orderId)), v, r, s) != verifier) revert NotAMutliSigner();
		Warehouse.deliverOrder(orderId, verifier);
	}
}