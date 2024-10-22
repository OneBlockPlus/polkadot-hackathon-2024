// SPDX-License-Identifier: MIT
pragma solidity 0.8.27;

import './Enums.sol';

interface IProducts {
	function mintProduct(Enums.ProductId productId, address receiver) external;
}