// SPDX-License-Identifier: MIT
pragma solidity 0.8.27; 

import './Enums.sol';

interface IShop {
	struct Order {
		string orderId;
		Enums.OrderStatus status;
		address customer;
		Enums.ProductId productId;
	}

	event PlaceOrder(address indexed customer, string orderId);
	event UpdateStatus(string orderId, Enums.OrderStatus status);

	function placeOrder(string memory orderId, Enums.ProductId productId) external payable;

	function updateOrderStatus(string memory orderId, Enums.OrderStatus newStatus) external;

	function getOrderCustomer(string memory orderId) external view returns (address);

	function getOrderProductId(string memory orderId) external view returns (Enums.ProductId);
}