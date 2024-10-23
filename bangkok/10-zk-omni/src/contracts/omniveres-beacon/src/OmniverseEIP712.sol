// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// import 'hardhat/console.sol';
import '@openzeppelin/contracts/utils/cryptography/EIP712.sol';
import './lib/Types.sol';
import 'solady/src/utils/ECDSA.sol';

contract OmniverseEIP712 is EIP712 {
    using Types for *;

    bytes32 private constant INPUT_TYPE_HASH =
        keccak256(
            'Input(bytes32 txid,uint32 index,uint128 amount,bytes32 address)'
        );
    bytes32 private constant OUTPUT_TYPE_HASH =
        keccak256('Output(uint128 amount,bytes32 address)');
    bytes32 private constant DEPLOY_TYPE_HASH =
        keccak256(
            'Deploy(bytes8 salt,string name,bytes32 deployer,uint128 mint_amount,uint128 price,uint128 total_supply,Input[] fee_inputs,Output[] fee_outputs)Input(bytes32 txid,uint32 index,uint128 amount,bytes32 address)Output(uint128 amount,bytes32 address)'
        );
    bytes32 private constant MINT_TYPE_HASH =
        keccak256(
            'Mint(bytes32 asset_id,Output[] outputs,Input[] fee_inputs,Output[] fee_outputs)Input(bytes32 txid,uint32 index,uint128 amount,bytes32 address)Output(uint128 amount,bytes32 address)'
        );
    bytes32 private constant TRANSFER_TYPE_HASH =
        keccak256(
            'Transfer(bytes32 asset_id,Input[] inputs,Output[] outputs,Input[] fee_inputs,Output[] fee_outputs)Input(bytes32 txid,uint32 index,uint128 amount,bytes32 address)Output(uint128 amount,bytes32 address)'
        );

    constructor(
        string memory name,
        string memory version
    ) EIP712(name, version) {}

    function verifySignature(
        Types.TxType txType,
        bytes calldata txData,
        address signer
    ) public view returns (bool) {
        bytes memory signature;
        bytes memory opBytes;
        if (txType == Types.TxType.Transfer) {
            Types.Transfer memory omniTx = abi.decode(txData, (Types.Transfer));
            signature = omniTx.signature;
            opBytes = transferToEip712Bytes(omniTx);
        } else if (txType == Types.TxType.Mint) {
            Types.Mint memory omniTx = abi.decode(txData, (Types.Mint));
            signature = omniTx.signature;
            opBytes = mintToEip712Bytes(omniTx);
        } else if (txType == Types.TxType.Deploy) {
            Types.Deploy memory omniTx = abi.decode(txData, (Types.Deploy));
            signature = omniTx.signature;
            opBytes = deployToEip712Bytes(omniTx);
        }
        bytes32 structHash = keccak256(opBytes);
        bytes32 hash = _hashTypedDataV4(structHash);
        address recovered = ECDSA.recover(hash, signature);
        return recovered == signer;
    }

    function deployToEip712Bytes(
        Types.Deploy memory operation
    ) public pure returns (bytes memory) {
        return
            abi.encodePacked(
                DEPLOY_TYPE_HASH,
                bytes32(operation.metadata.salt),
                keccak256(bytes(operation.metadata.name)),
                operation.metadata.deployer,
                uint256(operation.metadata.mintAmount),
                uint256(operation.metadata.price),
                uint256(operation.metadata.totalSupply),
                keccak256(inputsToEip712Bytes(operation.feeInputs)),
                keccak256(outputsToEip712Bytes(operation.feeOutputs))
            );
    }

    function mintToEip712Bytes(
        Types.Mint memory operation
    ) public pure returns (bytes memory) {
        return
            abi.encodePacked(
                MINT_TYPE_HASH,
                operation.assetId,
                keccak256(outputsToEip712Bytes(operation.outputs)),
                keccak256(inputsToEip712Bytes(operation.feeInputs)),
                keccak256(outputsToEip712Bytes(operation.feeOutputs))
            );
    }

    function transferToEip712Bytes(
        Types.Transfer memory operation
    ) public pure returns (bytes memory) {
        return
            abi.encodePacked(
                TRANSFER_TYPE_HASH,
                operation.assetId,
                keccak256(inputsToEip712Bytes(operation.inputs)),
                keccak256(outputsToEip712Bytes(operation.outputs)),
                keccak256(inputsToEip712Bytes(operation.feeInputs)),
                keccak256(outputsToEip712Bytes(operation.feeOutputs))
            );
    }

    function inputsToEip712Bytes(
        Types.Input[] memory inputs
    ) public pure returns (bytes memory) {
        bytes memory result;
        for (uint i; i < inputs.length; ++i) {
            result = abi.encodePacked(
                result,
                keccak256(
                    abi.encodePacked(
                        INPUT_TYPE_HASH,
                        inputs[i].txid,
                        uint256(inputs[i].index),
                        uint256(inputs[i].amount),
                        inputs[i].omniAddress
                    )
                )
            );
        }
        return result;
    }

    function outputsToEip712Bytes(
        Types.Output[] memory outputs
    ) public pure returns (bytes memory result) {
        for (uint i; i < outputs.length; ++i) {
            result = abi.encodePacked(
                result,
                keccak256(
                    abi.encodePacked(
                        OUTPUT_TYPE_HASH,
                        uint256(outputs[i].amount),
                        outputs[i].omniAddress
                    )
                )
            );
        }
    }
}
