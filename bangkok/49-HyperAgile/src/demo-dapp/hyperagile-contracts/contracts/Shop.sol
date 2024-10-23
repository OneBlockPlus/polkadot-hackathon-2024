// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import "./interfaces/Enums.sol";

import "./utils/WarehouseManager.sol";

error OrderAlreadyExists();
error AccessDenied();

contract Shop is WarehouseManager {
	struct Order {
		string orderId;
		Enums.OrderStatus status;
		address customer;
		Enums.ProductId productId;
	}

	mapping (string => Order) public orders;

	event PlaceOrder(address indexed customer, string orderId);
	event UpdateStatus(string orderId, Enums.OrderStatus status);

	constructor() WarehouseManager() {}

	function placeOrder(
		string memory orderId, 
		Enums.ProductId productId,
		uint8 v,
		bytes32 r,
		bytes32 s
	) external payable {
		if(orders[orderId].customer != address(0)) revert OrderAlreadyExists();
		if(ecrecover(keccak256(abi.encodePacked(orderId)), v, r, s) != owner) revert AccessDenied();

		payable(owner).transfer(msg.value);

		Order memory newOrder = Order(
			orderId,
			Enums.OrderStatus.Received,
			msg.sender,
			productId
		);

		orders[orderId] = newOrder;

		emit PlaceOrder(msg.sender, orderId);
		emit UpdateStatus(orderId, Enums.OrderStatus.Received);
	}

	function updateOrderStatus(string memory orderId, Enums.OrderStatus newStatus) onlyWarehouse public {
		orders[orderId].status = newStatus;
		emit UpdateStatus(orderId, newStatus);
	}

	function getOrderCustomer(string memory orderId) external view returns (address) {
		return orders[orderId].customer;
	}

	function getOrderProductId(string memory orderId) external view returns (Enums.ProductId) {
		return orders[orderId].productId;
	}
}