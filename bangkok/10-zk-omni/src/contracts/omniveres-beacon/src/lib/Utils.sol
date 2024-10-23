// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import 'hardhat/console.sol';
import './Types.sol';

library Utils {
    using Types for *;

    function bytesToHexString(
        bytes memory data
    ) internal pure returns (string memory) {
        bytes memory hexString = new bytes(2 * data.length);

        for (uint256 i = 0; i < data.length; i++) {
            uint8 byteValue = uint8(data[i]);
            bytes memory hexChars = '0123456789abcdef';
            hexString[2 * i] = hexChars[byteValue >> 4];
            hexString[2 * i + 1] = hexChars[byteValue & 0x0f];
        }

        return string(hexString);
    }

    function uint256ToLittleEndianBytes(
        uint256 value
    ) internal pure returns (bytes memory) {
        bytes memory result = new bytes(32);
        for (uint i = 0; i < 32; i++) {
            result[i] = bytes1(uint8(value >> (i * 8)));
        }
        return result;
    }

    function uint128ToLittleEndianBytes(
        uint128 value
    ) internal pure returns (bytes memory) {
        bytes memory result = new bytes(16);
        assembly {
            let ptr := add(result, 32) // skip the length part of the bytes array
            mstore(ptr, value) // store the 128-bit value

            // Convert to little endian
            let temp := mload(ptr)
            let littleEndian := or(
                or(
                    or(
                        shl(248, and(temp, 0xFF)),
                        shl(240, and(shr(8, temp), 0xFF))
                    ),
                    or(
                        shl(232, and(shr(16, temp), 0xFF)),
                        shl(224, and(shr(24, temp), 0xFF))
                    )
                ),
                or(
                    or(
                        shl(216, and(shr(32, temp), 0xFF)),
                        shl(208, and(shr(40, temp), 0xFF))
                    ),
                    or(
                        shl(200, and(shr(48, temp), 0xFF)),
                        shl(192, and(shr(56, temp), 0xFF))
                    )
                )
            )

            littleEndian := or(
                littleEndian,
                or(
                    or(
                        or(
                            shl(184, and(shr(64, temp), 0xFF)),
                            shl(176, and(shr(72, temp), 0xFF))
                        ),
                        or(
                            shl(168, and(shr(80, temp), 0xFF)),
                            shl(160, and(shr(88, temp), 0xFF))
                        )
                    ),
                    or(
                        or(
                            shl(152, and(shr(96, temp), 0xFF)),
                            shl(144, and(shr(104, temp), 0xFF))
                        ),
                        or(
                            shl(136, and(shr(112, temp), 0xFF)),
                            shl(128, and(shr(120, temp), 0xFF))
                        )
                    )
                )
            )

            mstore(ptr, littleEndian) // store the little endian value back
        }

        return result;
    }

    function bytesToField64Array(
        bytes memory data
    ) internal pure returns (uint256[] memory) {
        uint256 numChunks = data.length / 8;
        uint remainBytesLen = data.length % 8;
        numChunks = remainBytesLen > 0 ? numChunks + 1 : numChunks;
        uint256[] memory result = new uint256[](numChunks);

        assembly {
            // Pointer to the start of the input data
            let dataPtr := add(data, 0x20)

            // Pointer to the start of the result array
            let resultPtr := add(result, 0x20)

            for {
                let i := 0
            } lt(i, numChunks) {
                i := add(i, 1)
            } {
                // Read the current 8-byte chunk
                let chunkData := shr(192, mload(add(dataPtr, mul(i, 8))))
                // Reverse the 8-byte chunk
                let reversedChunk := 0
                for {
                    let j := 0
                } lt(j, 8) {
                    j := add(j, 1)
                } {
                    // Extract byte and shift it to the correct position
                    reversedChunk := or(
                        shl(
                            mul(j, 8),
                            and(shr(mul(sub(7, j), 8), chunkData), 0xFF)
                        ),
                        reversedChunk
                    )
                }

                // Store the reversed chunk in the result array
                mstore(add(resultPtr, mul(32, i)), reversedChunk)
            }
        }

        return result;
    }

    /**
     * @notice Calculate asset id
     * @param value convert uint256 to bytes8 only use in calAssetId
     */
    function uintToBytes8Reverse(
        uint value
    ) internal pure returns (bytes memory b) {
        bytes memory result = new bytes(8);

        assembly {
            let ptr := add(result, 32) // skip the length part of the bytes array
            mstore(ptr, value) // store the 128-bit value

            // Convert to little endian
            let temp := mload(ptr)
            let littleEndian := or(
                or(
                    or(
                        shl(248, and(temp, 0xFF)),
                        shl(240, and(shr(8, temp), 0xFF))
                    ),
                    or(
                        shl(232, and(shr(16, temp), 0xFF)),
                        shl(224, and(shr(24, temp), 0xFF))
                    )
                ),
                or(
                    or(
                        shl(216, and(shr(32, temp), 0xFF)),
                        shl(208, and(shr(40, temp), 0xFF))
                    ),
                    or(
                        shl(200, and(shr(48, temp), 0xFF)),
                        shl(192, and(shr(56, temp), 0xFF))
                    )
                )
            )

            mstore(ptr, littleEndian) // store the little endian value back
        }

        return result;
    }

    function deployToBytes(
        Types.Deploy memory deploy
    ) internal pure returns (bytes memory) {
        bytes memory originalNameBytes = bytes(deploy.metadata.name);
        bytes memory nameBytes = new bytes(Types.TOKEN_NAME_LEN);
        for (uint i; i < originalNameBytes.length; ++i) {
            nameBytes[i] = originalNameBytes[i];
        }
        return
            abi.encodePacked(
                deploy.metadata.salt,
                nameBytes,
                deploy.metadata.deployer,
                uint128ToLittleEndianBytes(deploy.metadata.totalSupply),
                uint128ToLittleEndianBytes(deploy.metadata.mintAmount),
                uint128ToLittleEndianBytes(deploy.metadata.price),
                inputToBytes(deploy.feeInputs),
                outputToBytes(deploy.feeOutputs)
            );
    }

    function MintToBytes(
        Types.Mint memory mint
    ) internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                mint.assetId,
                outputToBytes(mint.outputs),
                inputToBytes(mint.feeInputs),
                outputToBytes(mint.feeOutputs)
            );
    }

    function TransferToBytes(
        Types.Transfer memory transfer
    ) internal pure returns (bytes memory) {
        return
            abi.encodePacked(
                transfer.assetId,
                inputToBytes(transfer.inputs),
                outputToBytes(transfer.outputs),
                inputToBytes(transfer.feeInputs),
                outputToBytes(transfer.feeOutputs)
            );
    }

    function inputToBytes(
        Types.Input[] memory inputs
    ) internal pure returns (bytes memory result) {
        for (uint i; i < inputs.length; ++i) {
            result = abi.encodePacked(
                result,
                inputs[i].txid,
                uintToBytes8Reverse(inputs[i].index),
                inputs[i].omniAddress,
                uint128ToLittleEndianBytes(inputs[i].amount)
            );
        }
    }

    function outputToBytes(
        Types.Output[] memory outputs
    ) internal pure returns (bytes memory result) {
        for (uint i; i < outputs.length; ++i) {
            result = abi.encodePacked(
                result,
                outputs[i].omniAddress,
                uint128ToLittleEndianBytes(outputs[i].amount)
            );
        }
    }

    /**
     * @dev Convert public key to omnniverse address and eth chain address
     */
    function convertPulicKey(
        bytes calldata publicKey
    ) internal pure returns (bytes32 omniAddress, address chainAddress) {
        assembly {
            let pk := mload(0x40)
            omniAddress := calldataload(add(publicKey.offset, 0))
            mstore(add(pk, 0x20), calldataload(add(publicKey.offset, 0)))
            mstore(add(pk, 0x40), calldataload(add(publicKey.offset, 0x20)))
            chainAddress := keccak256(add(pk, 0x20), 0x40)
        }
    }

    /**
     * @notice Calculate asset id
     * @param salt Randomly generated bytes
     * @param originalNameBytes The bytes of asset name
     * @param deployer The deplpyer of the asset
     */
    function calAssetId(
        bytes8 salt,
        bytes memory originalNameBytes,
        bytes32 deployer
    ) internal pure returns (bytes32) {
        bytes memory nameBytes = new bytes(Types.TOKEN_NAME_LEN);
        for (uint i; i < originalNameBytes.length; ++i) {
            nameBytes[i] = originalNameBytes[i];
        }
        bytes memory data = abi.encodePacked(salt, nameBytes, deployer);
        return keccak256(data);
    }

    /**
     * @notice comress the utxo
     * @param assetId the omniverse asset id
     * @param txid the transaction id
     * @param index the transaction index
     * @param omniAddress the omniverse address
     * @param amount the asset amount
     *
     * @return result the keccak256 of utxo
     */
    function compressUTXO(
        bytes32 assetId,
        bytes32 txid,
        uint64 index,
        bytes32 omniAddress,
        uint128 amount
    ) internal pure returns (bytes32 result) {
        assembly {
            let memPtr := mload(0x40)
            mstore(memPtr, assetId)
            mstore(add(memPtr, 0x20), txid)
            mstore(add(memPtr, 0x40), shl(192, index))
            mstore(add(memPtr, 0x60), omniAddress)
            mstore(add(memPtr, 0x80), shl(128, amount))

            result := keccak256(memPtr, 0x90)
        }
    }
}
