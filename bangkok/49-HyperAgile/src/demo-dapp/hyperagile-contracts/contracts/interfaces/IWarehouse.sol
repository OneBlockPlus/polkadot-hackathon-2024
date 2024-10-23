// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import './Enums.sol';

interface IWarehouse {
	
	enum Activity {
		Picking, Packing, Delivering
	}

	event WarehouseActivity(string orderId, Enums.OrderStatus status);
	event AssingRobot(string orderId, Activity activity, uint256 robotId);
	event ActivityVerifier(string orderId, Activity activity, address indexed verifier);

	function processOrder(string memory orderId) external;

	function pickOrder(string memory orderId, address verifier) external;

	function packOrder(string memory orderId, address verifier) external;

	function deliverOrder(string memory orderId, address verifier) external;

	function generateRobotId(string memory orderId, Activity activityType) external returns (uint256 robotId);
}