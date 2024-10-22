// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

interface Enums {
	enum OrderStatus {
		Received, Processing, Picked, Packed, Delivered
	}

	enum Activity {
		Picking, Packing, Delivery
	}

	enum ProductId {
		Green, Purple, Blue
	}
}