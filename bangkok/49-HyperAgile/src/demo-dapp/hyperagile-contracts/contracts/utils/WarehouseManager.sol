// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import '../interfaces/IWarehouse.sol';

error NotAnOwner();
error NotAWarehouse();

contract WarehouseManager {

	address owner;
	IWarehouse Warehouse;

	constructor() {
		owner = msg.sender;
	}

	function setWarehouse(address warehouse) external {
		if(msg.sender != owner) revert NotAnOwner();
		Warehouse = IWarehouse(warehouse);
	}

	modifier onlyWarehouse {
		if(msg.sender != address(Warehouse)) revert NotAWarehouse();
		_;
	}
}