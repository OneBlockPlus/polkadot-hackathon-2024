// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@moonbeam/contracts/xcm-transactor/XcmTransactorV3.sol";
import {SP1Verifier} from "@sp1-contracts/SP1VerifierPlonk.sol";
import "./ScaleEncoder.sol";
import "./IRemoteVerifier.sol";
// import {console} from "forge-std/Test.sol";

struct TxLocation {
    uint128 blockHeight;
    uint128 txSID;
}

struct Proof {
    bytes proof;
    bytes publicValues;
}

struct BatchProof {
    uint128 batchId;
    TxLocation start;
    TxLocation end;
    Proof proof;
}

struct BatchState {
    uint128 batchId;
    uint128 txNumber;
    uint256 txLocation;
    bytes32 batchTxRootHash;
    bytes32 UTXORootHash;
    bytes32 assetRootHash;
}

// Information of destination which will receive proofs
struct Destination {
    // the SCALA encoding of interior, for example 0000000378
    bytes paraChainSelector;
    // the callindex of `transact` in xcm ethereum pallet, for example 0x2600
    bytes callindex;
    // evm contract address of the destination chain, for example 0x000000000000000000000000000000000000080C
    address destContract;
    // the reserved asset id which is mapping the native aaset of the destination chain, for example 000000000000000000000000000000000000000000000000000000000000080C
    bytes reservedAssetId;
}

uint256 constant BLOCK_START_INDEX = 1;
uint256 constant TRANSACTION_START_INDEX = 1;

uint64 constant REF_TIME = 1000000000;
uint64 constant PROOF_SIZE = 40000;
uint256 constant FEE_AMOUNT = 10000000;
uint256 constant GAS_LIMT = 1000000;

/// @title Omniverse ZK Verifier.
/// @author Omnize Labs
/// @notice This contract implements verifying the proof of omniverse transactions and state
contract OmniverseZKVerifier is
    SP1Verifier,
    UUPSUpgradeable,
    OwnableUpgradeable
{
    /// @notice The verification key for the omniverse program.
    bytes32 public any_vkey_hash;
    uint128 public nextBatchId;
    Destination[] public destinations;
    mapping(uint128 => BatchState) batchStateList;
    mapping(uint256 => uint256) blockHeightToBatchId;

    /**
     * @notice Throws when batch id does not match with stored data
     * @param id The submitted batch id
     * @param expected The expected batch id
     */
    error BatchIDNotMatch(uint128 id, uint128 expected);

    /**
     * @notice Throws when pre UTXO merkle root check failed
     * @param root The submitted pre UTXO merkle root
     * @param expected The expected pre UTXO merkle root
     */
    error PreUTXORootError(bytes32 root, bytes32 expected);

    /**
     * @notice Throws when pre asset merkle root check failed
     * @param root The submitted pre asset merkle root
     * @param expected The expected pre asset merkle root
     */
    error PreAssetRootError(bytes32 root, bytes32 expected);

    /**
     * @notice Throws when transaction arrange error
     * @param id The submitted batch id
     * @param start The starting location
     * @param end The ending location
     */
    error TransactionLocationError(
        uint128 id,
        TxLocation start,
        TxLocation end
    );

    error XCMSendFailed();

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    function initialize(bytes32 _any_vkey_hash, Destination[] memory _destinations) public initializer {
        __Ownable_init(msg.sender);
        __UUPSUpgradeable_init();
        any_vkey_hash = _any_vkey_hash;
        for (uint i = 0; i < _destinations.length; i++) {
            destinations.push(_destinations[i]);
        }
    }

    /**
     * @notice Send verification result to other parachains
     */
    function verifyResultToOtherParachains() internal {
        // get the latest batch state
        BatchState storage batchState = batchStateList[nextBatchId - 1];

        // encode the evm call data
        bytes memory evmCalldata = abi.encodeWithSelector(IRemoteVerifier.receiveOriginProof.selector, batchState);

        for (uint i = 0; i < destinations.length; i++) {
            transactTo(destinations[i], evmCalldata);
        }
    }

    /**
     */
    function transactTo(Destination storage destination, bytes memory evmCalldata) internal {
        // encode the substrate call data
        bytes memory substrateCallData = abi.encodePacked(
            destination.callindex,  // callindex
            hex"01",    // V2
            GAS_LIMT, // gas limit
            hex"00",    // Action Call
            destination.destContract,    // destination contract address
            hex"00",    // value
            evmCalldata    // evm call data
        );
        
        // tranact XCM call
        XcmTransactorV3.Multilocation memory dest = XcmTransactorV3.Multilocation(
            1,
            new bytes[](1)
        );
        dest.interior[0] = destination.paraChainSelector;

        // fee
        XcmTransactorV3.Multilocation memory fee = XcmTransactorV3.Multilocation(
            1,
            new bytes[](1)
        );
        dest.interior[0] = destination.reservedAssetId;

        XcmTransactorV3.Weight memory weightInfo = XcmTransactorV3.Weight(
            type(uint64).max,
            PROOF_SIZE
        );
    
        uint256 feeAmount = FEE_AMOUNT;

        XcmTransactorV3(XCM_TRANSACTOR_V3_ADDRESS).transactThroughSignedMultilocation(
            dest,
            fee,
            weightInfo,
            substrateCallData,
            feeAmount,
            XcmTransactorV3.Weight(
                0,
                0
            ),
            true
        );
    }

    /**
     * @notice Submit batch proof
     * @dev The proof MUST be submitted in order
     * @param batchProof Proof data of a batch of transactions
     */
    function submitBatchProof(BatchProof calldata batchProof) public {
        uint128 _nextBatchId = nextBatchId;
        if (batchProof.batchId != _nextBatchId) {
            revert BatchIDNotMatch(batchProof.batchId, _nextBatchId);
        }

        // check location
        if (
            batchProof.end.txSID < batchProof.start.txSID ||
            batchProof.end.blockHeight < batchProof.start.blockHeight
        ) {
            revert TransactionLocationError(
                batchProof.batchId,
                batchProof.start,
                batchProof.end
            );
        }

        if (batchProof.batchId == 0) {
            if (
                batchProof.start.blockHeight != BLOCK_START_INDEX ||
                batchProof.start.txSID != TRANSACTION_START_INDEX
            ) {
                revert TransactionLocationError(
                    batchProof.batchId,
                    batchProof.start,
                    batchProof.end
                );
            }
        } else {
            BatchState storage pre = batchStateList[batchProof.batchId - 1];
            uint64 preEndBlockHeight = uint64(pre.txLocation >> 64) &
                0xffffffffffffffff;
            uint64 preEndTxSID = uint64(pre.txLocation) & 0xffffffffffffffff;
            if (
                preEndBlockHeight > batchProof.start.blockHeight ||
                preEndBlockHeight < batchProof.start.blockHeight - 1 ||
                preEndTxSID + 1 != batchProof.start.txSID
            ) {
                revert TransactionLocationError(
                    batchProof.batchId,
                    batchProof.start,
                    batchProof.end
                );
            }
        }
        (
            bytes32 preAssetRoot,
            bytes32 preUTXORoot,
            bytes32 curAssetRoot,
            bytes32 curUTXORoot,
            bytes32 batchTxMerkleRoot
        ) = decodePublicValue(batchProof.proof.publicValues);

        if (batchProof.batchId != 0) {
            BatchState memory preBatchState = batchStateList[
                batchProof.batchId - 1
            ];
            if (preBatchState.UTXORootHash != preUTXORoot) {
                revert PreUTXORootError(
                    preUTXORoot,
                    preBatchState.UTXORootHash
                );
            }
            if (preBatchState.assetRootHash != preAssetRoot) {
                revert PreAssetRootError(
                    preAssetRoot,
                    preBatchState.assetRootHash
                );
            }
        }

        batchStateList[_nextBatchId].batchId = batchProof.batchId;
        batchStateList[_nextBatchId].txLocation =
            (uint256(uint64(batchProof.start.blockHeight)) << 192) |
            (uint256(uint64(batchProof.start.txSID)) << 128) |
            (uint256(uint64(batchProof.end.blockHeight)) << 64) |
            uint256(uint64(batchProof.end.txSID));
        batchStateList[_nextBatchId].txNumber =
            batchProof.end.txSID -
            batchProof.start.txSID +
            1;
        batchStateList[_nextBatchId].assetRootHash = curAssetRoot;
        batchStateList[_nextBatchId].UTXORootHash = curUTXORoot;
        batchStateList[_nextBatchId].batchTxRootHash = batchTxMerkleRoot;
        this.verifyProof(
            any_vkey_hash,
            batchProof.proof.publicValues,
            batchProof.proof.proof
        );
        nextBatchId = batchProof.batchId + 1;

        verifyResultToOtherParachains();
    }

    function decodePublicValue(
        bytes memory publicValue
    )
        internal
        pure
        returns (
            bytes32 preAssetRoot,
            bytes32 preUTXORoot,
            bytes32 curAssetRoot,
            bytes32 curUTXORoot,
            bytes32 batchTxMerkleRoot
        )
    {
        assembly {
            let len := mload(publicValue)
            batchTxMerkleRoot := mload(add(publicValue, len))
            curUTXORoot := mload(sub(add(publicValue, len), 0x20))
            curAssetRoot := mload(sub(add(publicValue, len), 0x40))
            preUTXORoot := mload(sub(add(publicValue, len), 0x60))
            preAssetRoot := mload(sub(add(publicValue, len), 0x80))
        }
    }
}
