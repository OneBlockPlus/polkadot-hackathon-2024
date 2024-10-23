//SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.8.4 <0.9.0;

import "../BookadotStructs.sol";
import { BookadotEIP712 } from "../libs/BookadotEIP712.sol";

contract BookadotEIP712Test {
    address authorizedAddress;

    constructor(address _authorizedAddress) {
        authorizedAddress = _authorizedAddress;
    }

    function verify(BookingParameters memory parameters, bytes memory signature) external view returns (bool) {
        return BookadotEIP712.verify(parameters, address(this), authorizedAddress, signature);
    }
}
