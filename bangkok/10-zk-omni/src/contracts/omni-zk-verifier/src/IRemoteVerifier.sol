// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

/**
 * @notice This interface MUST be implemented by the contract on the destination chain,
    which will receive proof from the zk-verifier on Moonbeam
 */
interface IRemoteVerifier {
    struct BatchState {
        uint128 batchId;
        uint128 txNumber;
        uint256 txLocation;
        bytes32 batchTxRootHash;
        bytes32 UTXORootHash;
        bytes32 assetRootHash;
    }

    /**
     * @notice Receive proof state sent from zk-verifier on Moonbeam
     * @dev Only the sender derived from the origin verifier contract on Moonbeam can call the method
     */
    function receiveOriginProof(BatchState memory _state) external;
}