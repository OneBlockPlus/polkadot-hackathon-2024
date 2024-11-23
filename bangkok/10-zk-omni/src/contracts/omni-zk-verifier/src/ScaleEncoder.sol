// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

library ScaleEncoder {
    function encodeCompact(uint256 value) public pure returns (bytes memory) {
        if (value <= 63) {
            // use 1 byte
            return abi.encodePacked(uint8(value << 2));
        } else if (value <= 16383) { // 2^14-1
            // use 2 bytes
            return abi.encodePacked(
                uint8(((value & 0xFF) << 2) | 0x01),
                uint8((value >> 6) & 0xFF)
            );
        } else if (value <= 1073741823) { // 2^30-1
            // use 4 bytes
            return abi.encodePacked(
                uint8(((value & 0xFF) << 2) | 0x02),
                uint8((value >> 6) & 0xFF),
                uint8((value >> 14) & 0xFF),
                uint8((value >> 22) & 0xFF)
            );
        } else {
            // more bytes
            bytes memory b = abi.encodePacked(uint8(0x03));
            for (uint256 i = 0; i < 8; i++) {
                b = abi.encodePacked(b, uint8((value >> (i * 8)) & 0xff));
            }
            return b;
        }
    }
}