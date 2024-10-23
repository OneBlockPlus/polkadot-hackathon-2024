// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import "hardhat/console.sol";

library Types {
    uint8 constant TOKEN_NAME_LEN = 24;
    uint8 constant Chunk_Size = 8;

    enum TxType {
        Deploy,
        Mint,
        Transfer
    }

    struct UTXO {
        bytes32 omniAddress;
        bytes32 assetId;
        bytes32 txid;
        uint64 index;
        uint128 amount;
    }

    struct Input {
        bytes32 txid;
        uint64 index;
        uint128 amount;
        bytes32 omniAddress;
    }

    struct Output {
        bytes32 omniAddress;
        uint128 amount;
    }

    struct Metadata {
        bytes8 salt;
        string name;
        bytes32 deployer;
        uint128 totalSupply;
        uint128 mintAmount;
        uint128 price;
    }

    struct Token {
        Metadata metadata;
        uint128 currentSupply;
    }

    struct TokenDetails {
        bytes32 assetId;
        Token details;
    }

    struct Deploy {
        Metadata metadata;
        bytes signature;
        Input[] feeInputs;
        Output[] feeOutputs;
    }

    struct Mint {
        bytes32 assetId;
        bytes signature;
        Output[] outputs;
        Input[] feeInputs;
        Output[] feeOutputs;
    }

    struct Transfer {
        bytes32 assetId;
        bytes signature;
        Input[] inputs;
        Output[] outputs;
        Input[] feeInputs;
        Output[] feeOutputs;
    }

    struct GenesisInfo {
        bytes32 omniAddress;
        uint128 amount;
    }

    struct FeeConfig {
        // the fee token asset id
        bytes32 assetId;
        // the fee token receiver
        bytes32 receiver;
        // the amount pay for transaction
        uint128 amount;
    }

    struct SystemConfig {
        FeeConfig feeConfig;
        // the maximum number of UTXOs allowed in a single transaction
        uint maxTxUTXO;
        uint8 decimals;
    }
    
    struct TxLocation {
        uint blockHeight;
        uint txSID;
    }

    struct BatchProofData {
        uint id;
        TxLocation start;
        TxLocation end;
    }

    struct BatchState {
        BatchProofData proof;
        uint txNumber;
        bytes32 batchTxRootHash;
        bytes32 UTXORootHash;
        bytes32 assetRootHash;
    }

    struct AATransformer {
        uint chainId;
        address srcAddress;
    }

    struct SubmitTxInfo {
        TxType txType;
        bytes publicKey;
        bytes txData;
        bytes synchronizerSignature;
    }
}
