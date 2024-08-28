// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

import {MockProduct} from "./MockProduct.sol";

contract MockProductFactory {
    struct DeviceBinding {
        address product;
        uint256 tokenId;
    }

    mapping (address => DeviceBinding) internal _deviceBindings;

    function createProduct() public returns (address) {
        MockProduct product = new MockProduct("Mock Product", "MP", "https://examples.com");
        return address(product);
    }

    function createActivatedDevice(address product, address device, address receiver) public returns (uint256) {
        uint256 tokenId = MockProduct(product).mint(receiver);
        _deviceBindings[device] = DeviceBinding({
            product: product,
            tokenId: tokenId
        });
        return tokenId;
    }

    function getDeviceBinding(address device) public view returns (DeviceBinding memory) {
        return _deviceBindings[device];
    } 
}