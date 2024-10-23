// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Uncomment this line to use console.log
// import 'hardhat/console.sol';
import '@openzeppelin/contracts/utils/cryptography/ECDSA.sol';
import '@openzeppelin/contracts/utils/Strings.sol';
import '@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol';
import '@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol';
import './Storage.sol';
import './lib/Types.sol';
import './lib/Utils.sol';
import './interface/IOmniverseSysConfig.sol';

string constant PERSONAL_SIGN_PREFIX = '\x19Ethereum Signed Message:\n';
string constant OMNIVERSE_AA_SC_PREFIX = 'Register to Omniverse AA: ';

contract OmniverseBeacon is Storage, UUPSUpgradeable, OwnableUpgradeable {
    using EnumerableSet for EnumerableSet.Bytes32Set;
    using EnumerableSet for EnumerableSet.AddressSet;

    /**
     * @notice Throws when the utxo is not found in the set of unspent UTXOs
     * @param txid Transaction ID of the generated UTXO
     * @param index Index of the output in the transaction
     * @param omniAddress Address of the omniverse account
     * @param amount Amount of the omniverse asset
     */
    error UTXONotExist(
        bytes32 txid,
        uint64 index,
        bytes32 omniAddress,
        uint128 amount
    );

    /**
     * @notice Throw when the UTXO does not belong to the signer
     * @param signer Transaction signer
     * @param owner UTXO owner
     */
    error NotUTXOOwner(bytes32 signer, bytes32 owner);

    /**
     * @notice Throw when the input amount mismatch to the known UTXO amount
     */
    error IncorrectAmount();

    /**
     * @notice Throw when the length of input pulick key is mismatch
     */
    error InvalidPulicKeyLength();
    /**
     * @notice Throw when the fee transfer transaction structure is incorrect
     */
    error IncorrectTransferFeeToken();

    /**
     * @notice Throw when pay for fee not enough
     */
    error FeeNotEnough();

    /**
     * @notice Throw when exceeds the maximum number of UTXOs allowed
     *         in a single transaction
     */
    error ExceedMaxTxUTXOs();

    /**
     * @notice Throw when exceeds the token already deployed
     */
    error TokenAlreadyDeployed();
    /**
     * @notice Throw when token name exceeds the default length
     */
    error TokenNameTooLong();

    /**
     * @notice Throw when total mint amount exceeds the total supply
     */
    error ExceedMaximumSupply();

    /**
     * @notice Throw when mint amonut mismatch mint amount
     */
    error MismatchMintAmount();

    /**
     * @notice Throw when signature is invalid
     */
    error InvalidSignature();

    error InvalidSynchronizerSignatureLength();

    error AATransformerAlreadyRegistered();

    error OutputAmountShouldNotBeZero();

    /**
     * @dev Throw when mint price mismatch the system config.
     */
    error MintPriceMismatch(uint128 price, uint128 expect);
    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error NotSubmitter(address account);

    /**
     * @dev The caller account is not authorized to perform an operation.
     */
    error NotGovernor(address account);

    /**
     * @param assetId Deployed asset id
     * @param omniTokenAddress the contract of omniverse asset
     * @param metadata The asset metadata
     */
    event Deploy(
        bytes32 assetId,
        address omniTokenAddress,
        Types.Metadata metadata
    );

    /**
     * @param assetId Mint asset id
     * @param receipts Mint asset receipts
     */
    event Mint(bytes32 assetId, Types.Output[] receipts);

    /**
     * @param assetId Transfer asset id
     * @param receipts Transfer asset receipts
     */
    event Transfer(
        bytes32 assetId,
        Types.Output[] fee_receipts,
        Types.Output[] receipts
    );

    /**
     * @dev Throws if called by any account other than the submitter.
     */
    modifier onlySubmitter() {
        if (!submitter.contains(msg.sender)) {
            revert NotSubmitter(msg.sender);
        }
        _;
    }

    /**
     * @dev Throws if called by any account other than the submitter.
     */
    modifier onlyGovernor() {
        if (msg.sender != governor) {
            revert NotGovernor(msg.sender);
        }
        _;
    }

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    function initialize(
        address _governor,
        IOmniverseEIP712 _signatureVerifier,
        IZKVerifier _zkVerifier,
        IOmniverseTokenFactory _factory,
        IOmniverseSysConfig _systemConfig,
        Types.GenesisInfo[] calldata genesisAccounts,
        Types.Metadata calldata feeTokenMetadata
    ) public initializer {
        governor = _governor;
        __Ownable_init(_governor);
        __UUPSUpgradeable_init();
        signatureVerifier = _signatureVerifier;
        zkVerifier = _zkVerifier;
        factory = _factory;
        uint128 currentSupply;
        bytes32 gasAssetId = _systemConfig.gasAssetId();
        for (uint64 i; i < genesisAccounts.length; ++i) {
            // 0 as genesis txid
            Types.UTXO memory utxo;
            utxo.assetId = gasAssetId;
            utxo.txid = bytes32(0);
            utxo.amount = genesisAccounts[i].amount;
            utxo.index = i;
            utxo.omniAddress = genesisAccounts[i].omniAddress;
            bytes32 utxoHash = Utils.compressUTXO(
                utxo.assetId,
                utxo.txid,
                utxo.index,
                utxo.omniAddress,
                utxo.amount
            );
            UTXOSet[utxoHash] = true;
            currentSupply += genesisAccounts[i].amount;

            _balances[gasAssetId][
                genesisAccounts[i].omniAddress
            ] += genesisAccounts[i].amount;
        }
        Types.Token memory feeToken;
        feeToken.metadata = feeTokenMetadata;
        feeToken.currentSupply = currentSupply;
        tokens[gasAssetId] = feeToken;
        address newOmniveseTokenAddress = factory.createOmniverseToken(
            gasAssetId,
            IOmniverseBeacon(address(this))
        );

        omniTokenAddress[gasAssetId] = newOmniveseTokenAddress;
        systemConfig = _systemConfig;
    }

    /**
     * @notice Submit batch Omniverse transactions
     * @param txs The omniverse transactions
     */
    function submitBatchTx(
        Types.SubmitTxInfo[] calldata txs
    ) public onlySubmitter {
        for (uint i; i < txs.length; ++i) {
            submitTx(
                txs[i].txType,
                txs[i].publicKey,
                txs[i].txData,
                txs[i].synchronizerSignature
            );
        }
    }

    /**
     * @notice Submit Omniverse transaction
     * @param txType The transaction type
     * @param publicKey The publicKey of signer
     * @param txData The data of the transaction
     * @param synchronizerSignature Synchronizer signature
     */
    function submitTx(
        Types.TxType txType,
        bytes calldata publicKey,
        bytes calldata txData,
        bytes calldata synchronizerSignature
    ) public onlySubmitter {
        // Get eth address and omni address from public key
        if (publicKey.length != 64) {
            revert InvalidPulicKeyLength();
        }
        (bytes32 omniSigner, address signer) = Utils.convertPulicKey(publicKey);
        if (
            aaTransformer[omniSigner].srcAddress != address(0) &&
            synchronizerSignature.length != 65
        ) {
            revert InvalidSynchronizerSignatureLength();
        }
        if (!signatureVerifier.verifySignature(txType, txData, signer)) {
            revert InvalidSignature();
        }

        (
            bytes32 feeAssetId,
            bytes32 feeReceiver,
            uint128 feeAmount,
            uint maxTxUTXO,
            ,
            uint128 mintPrice
        ) = systemConfig.getSystemConfig();

        uint128 feeAssetBalance = _balances[feeAssetId][omniSigner];
        if (txType == Types.TxType.Transfer) {
            Types.Transfer memory omniTx = abi.decode(txData, (Types.Transfer));
            if (
                omniTx.inputs.length +
                    omniTx.outputs.length +
                    omniTx.feeInputs.length +
                    omniTx.feeOutputs.length >
                maxTxUTXO
            ) {
                revert ExceedMaxTxUTXOs();
            }

            bytes memory txBytes = Utils.TransferToBytes(omniTx);
            bytes32 txid = keccak256(txBytes);
            if (omniTx.assetId == feeAssetId) {
                if (omniTx.inputs.length == 0 && omniTx.outputs.length == 0) {
                    uint totalInputAmount;
                    for (uint i; i < omniTx.feeInputs.length; ++i) {
                        bytes32 utxo = Utils.compressUTXO(
                            omniTx.assetId,
                            omniTx.feeInputs[i].txid,
                            omniTx.feeInputs[i].index,
                            omniTx.feeInputs[i].omniAddress,
                            omniTx.feeInputs[i].amount
                        );
                        totalInputAmount += omniTx.feeInputs[i].amount;
                        feeAssetBalance -= omniTx.feeInputs[i].amount;
                        checkUTXO(omniSigner, utxo, omniTx.feeInputs[i]);
                        UTXOSet[utxo] = false;
                    }

                    uint totalOutputAmount;
                    bool paidForFee;
                    for (uint i; i < omniTx.feeOutputs.length; ++i) {
                        totalOutputAmount += omniTx.feeOutputs[i].amount;
                        if (
                            omniTx.feeOutputs[i].omniAddress == feeReceiver &&
                            omniTx.feeOutputs[i].amount == feeAmount
                        ) {
                            paidForFee = true;
                        }
                    }
                    if (totalOutputAmount != totalInputAmount) {
                        revert IncorrectAmount();
                    }
                    if (!paidForFee) {
                        revert FeeNotEnough();
                    }
                } else {
                    revert IncorrectTransferFeeToken();
                }
            } else {
                uint128 omniAssetBalance = _balances[omniTx.assetId][
                    omniSigner
                ];
                uint128 totalSpent = checkFee(
                    omniSigner,
                    omniTx.feeInputs,
                    omniTx.feeOutputs
                );
                feeAssetBalance -= totalSpent;
                uint totalInputAmount;
                for (uint i; i < omniTx.inputs.length; ++i) {
                    bytes32 utxo = Utils.compressUTXO(
                        omniTx.assetId,
                        omniTx.inputs[i].txid,
                        omniTx.inputs[i].index,
                        omniTx.inputs[i].omniAddress,
                        omniTx.inputs[i].amount
                    );
                    checkUTXO(omniSigner, utxo, omniTx.inputs[i]);
                    totalInputAmount += omniTx.inputs[i].amount;
                    omniAssetBalance -= omniTx.inputs[i].amount;
                    UTXOSet[utxo] = false;
                }

                uint totalOutputAmount;
                for (uint i; i < omniTx.outputs.length; ++i) {
                    totalOutputAmount += omniTx.outputs[i].amount;
                }

                if (totalInputAmount != totalOutputAmount) {
                    revert IncorrectAmount();
                }

                _balances[omniTx.assetId][omniSigner] = omniAssetBalance;
                generateUTXO(omniTx.assetId, txid, omniTx.outputs, 0);
            }

            _balances[feeAssetId][omniSigner] = feeAssetBalance;
            _txid[txid] = true;

            generateUTXO(
                feeAssetId,
                txid,
                omniTx.feeOutputs,
                uint64(omniTx.outputs.length)
            );

            emit Transfer(omniTx.assetId, omniTx.feeOutputs, omniTx.outputs);
        } else if (txType == Types.TxType.Mint) {
            Types.Mint memory omniTx = abi.decode(txData, (Types.Mint));
            if (
                omniTx.outputs.length +
                    omniTx.feeInputs.length +
                    omniTx.feeOutputs.length >
                maxTxUTXO
            ) {
                revert ExceedMaxTxUTXOs();
            }
            uint128 totalSpent = checkFee(
                omniSigner,
                omniTx.feeInputs,
                omniTx.feeOutputs
            );
            Types.Token memory token = tokens[omniTx.assetId];
            uint128 currentSupply = token.currentSupply;
            for (uint i; i < omniTx.outputs.length; ++i) {
                currentSupply += omniTx.outputs[i].amount;
                if (currentSupply > token.metadata.totalSupply) {
                    revert ExceedMaximumSupply();
                }
                if (omniTx.outputs[i].amount != token.metadata.mintAmount) {
                    revert MismatchMintAmount();
                }
            }

            bytes memory txBytes = Utils.MintToBytes(omniTx);
            bytes32 txid = keccak256(txBytes);
            _txid[txid] = true;

            feeAssetBalance -= totalSpent;
            _balances[feeAssetId][omniSigner] = feeAssetBalance;

            // generate new omnniverse asset UTXO
            generateUTXO(omniTx.assetId, txid, omniTx.outputs, 0);
            // generate new fee asset UTXO
            generateUTXO(
                feeAssetId,
                txid,
                omniTx.feeOutputs,
                uint64(omniTx.outputs.length)
            );

            // update currenSupply
            token.currentSupply = currentSupply;
            tokens[omniTx.assetId] = token;

            emit Mint(omniTx.assetId, omniTx.outputs);
        } else if (txType == Types.TxType.Deploy) {
            Types.Deploy memory omniTx = abi.decode(txData, (Types.Deploy));
            if (
                omniTx.feeInputs.length + omniTx.feeOutputs.length > maxTxUTXO
            ) {
                revert ExceedMaxTxUTXOs();
            }

            if (omniTx.metadata.price != mintPrice) {
                revert MintPriceMismatch(omniTx.metadata.price, mintPrice);
            }

            bytes memory originalNameBytes = bytes(omniTx.metadata.name);
            if (originalNameBytes.length > 24) {
                revert TokenNameTooLong();
            }
            // check fee spend, and return spend utxo
            uint128 totalSpent = checkFee(
                omniSigner,
                omniTx.feeInputs,
                omniTx.feeOutputs
            );
            bytes32 assetId = Utils.calAssetId(
                omniTx.metadata.salt,
                originalNameBytes,
                omniTx.metadata.deployer
            );
            if (bytes(tokens[assetId].metadata.name).length > 0) {
                revert TokenAlreadyDeployed();
            }
            bytes memory txBytes = Utils.deployToBytes(omniTx);
            bytes32 txid = keccak256(txBytes);
            _txid[txid] = true;

            feeAssetBalance -= totalSpent;
            _balances[feeAssetId][omniSigner] = feeAssetBalance;

            // generate new fee utxo
            generateUTXO(feeAssetId, txid, omniTx.feeOutputs, 0);

            address newOmniveseTokenAddress = factory.createOmniverseToken(
                assetId,
                IOmniverseBeacon(address(this))
            );
            Types.Token memory token;
            token.metadata = omniTx.metadata;
            token.currentSupply = 0;
            tokens[assetId] = token;
            omniTokenAddress[assetId] = newOmniveseTokenAddress;
            emit Deploy(assetId, newOmniveseTokenAddress, token.metadata);
        }
        totalTxid += 1;
    }

    function generateUTXO(
        bytes32 assetId,
        bytes32 txid,
        Types.Output[] memory outputs,
        uint64 startIndex
    ) internal {
        for (uint64 i; i < outputs.length; ++i) {
            if (outputs[i].amount == 0) {
                revert OutputAmountShouldNotBeZero();
            }
            bytes32 utxo = Utils.compressUTXO(
                assetId,
                txid,
                startIndex + i,
                outputs[i].omniAddress,
                outputs[i].amount
            );
            UTXOSet[utxo] = true;
            _balances[assetId][outputs[i].omniAddress] += outputs[i].amount;
        }
    }

    /**
     * @notice Check the correctness of the UTXO
     * @param signer Convert uint256 to bytes8 only use in calAssetId
     * @param utxo The UTXOSet
     * @param input The input UTXO
     */
    function checkUTXO(
        bytes32 signer,
        bytes32 utxo,
        Types.Input memory input
    ) internal view {
        bool exist = UTXOSet[utxo];
        if (exist) {
            if (input.omniAddress != signer) {
                revert NotUTXOOwner(signer, input.omniAddress);
            }
        } else {
            revert UTXONotExist(
                input.txid,
                input.index,
                input.omniAddress,
                input.amount
            );
        }
    }

    function checkFee(
        bytes32 signer,
        Types.Input[] memory feeInputs,
        Types.Output[] memory feeOutputs
    ) internal returns (uint128) {
        (
            bytes32 feeAssetId,
            bytes32 feeReceiver,
            uint128 feeAmount,
            ,
            ,

        ) = systemConfig.getSystemConfig();
        uint128 totalFeeInput;
        for (uint i; i < feeInputs.length; ++i) {
            bytes32 utxo = Utils.compressUTXO(
                feeAssetId,
                feeInputs[i].txid,
                feeInputs[i].index,
                feeInputs[i].omniAddress,
                feeInputs[i].amount
            );
            checkUTXO(signer, utxo, feeInputs[i]);
            UTXOSet[utxo] = false;
            totalFeeInput += feeInputs[i].amount;
        }

        uint128 totalFeeOutput;
        uint128 payForFee;
        for (uint i = 0; i < feeOutputs.length; ++i) {
            if (feeOutputs[i].omniAddress == feeReceiver) {
                payForFee += feeOutputs[i].amount;
            }
            totalFeeOutput += feeOutputs[i].amount;
        }
        if (payForFee < feeAmount) {
            revert FeeNotEnough();
        }

        if (totalFeeInput != totalFeeOutput) {
            revert IncorrectAmount();
        }
        return totalFeeInput;
    }

    function updateSystemConfig(
        IOmniverseSysConfig newSysConfig
    ) public onlyGovernor {
        systemConfig = newSysConfig;
    }

    /**
     *
     * @param chainId Source chain ids
     * @param srcAddress Source AA transformer contract address
     * @param publicKey AA transformer omniverse public key
     * @param signature AA transformer omniverse signature
     */
    function registerAATransformer(
        uint256 chainId,
        address srcAddress,
        bytes calldata publicKey,
        bytes calldata signature
    ) public {
        if (publicKey.length != 64) {
            revert InvalidPulicKeyLength();
        }
        (bytes32 omniAddress, address omniSigner) = Utils.convertPulicKey(
            publicKey
        );

        if (aaTransformer[omniAddress].srcAddress != address(0)) {
            revert AATransformerAlreadyRegistered();
        }
        bytes memory rawData = abi.encodePacked(
            OMNIVERSE_AA_SC_PREFIX,
            '0x',
            Utils.bytesToHexString(abi.encodePacked(srcAddress)),
            ', chain id: ',
            Strings.toString(chainId)
        );
        bytes32 hash = keccak256(
            abi.encodePacked(
                PERSONAL_SIGN_PREFIX,
                bytes(Strings.toString(rawData.length)),
                rawData
            )
        );
        address recoverAddress = ECDSA.recover(hash, signature);

        if (omniSigner != recoverAddress) {
            revert InvalidSignature();
        }

        aaTransformer[omniAddress].chainId = chainId;
        aaTransformer[omniAddress].srcAddress = srcAddress;
    }

    /**
     * @dev Change current governor
     *
     * @param newGovernor Address of the new governor
     */
    function changeGovernor(address newGovernor) public onlyGovernor {
        governor = newGovernor;
    }

    /**
     * @dev Add submitter address
     */
    function setSubmitter(address account) public onlyGovernor {
        submitter.add(account);
    }

    /**
     * @dev Add synchronizer
     *
     * @param account omniverse Address of synchronizer
     */
    function setSynchronizer(bytes32 account) public onlyGovernor {
        _synchronizer = account;
    }

    function synchronizer() public view returns (bytes32) {
        return _synchronizer;
    }

    /**
     * Get the submitters
     * @param offset The displacement used when querying the submitter list
     * @param limit the maximum number of submitter returned in a query
     */
    function submitters(
        uint offset,
        uint limit
    ) public view returns (address[] memory) {
        uint length = submitter.length();
        if (offset > length) {
            return new address[](0);
        }
        if (offset + limit > length) {
            limit = length - offset;
        }
        uint j;
        address[] memory subs = new address[](limit);
        for (uint i = offset; i < offset + limit; ++i) {
            subs[j] = submitter.at(i);
            ++j;
        }
        return subs;
    }

    /**
     * @dev Retruns beacon config information
     */
    function getSystemConfig()
        public
        view
        returns (
            bytes32 assetId,
            bytes32 receiver,
            uint128 amount,
            uint maxTxUTXO,
            uint8 _decimals,
            uint128 mintPrice
        )
    {
        return systemConfig.getSystemConfig();
    }

    function getSystemConfigAddress() public view returns (address) {
        return address(systemConfig);
    }

    /**
     * @dev Retruns eip712 domain
     */
    function eip712Domain()
        public
        view
        returns (
            string memory _name,
            string memory _version,
            uint256 _chainId,
            address _verifyingContract
        )
    {
        (
            ,
            _name,
            _version,
            _chainId,
            _verifyingContract,
            ,

        ) = signatureVerifier.eip712Domain();
    }

    function getGovernor() public view returns (address) {
        return governor;
    }

    /**
     * @dev Returns true if the txid is exist
     */
    function containsTxID(bytes32 txid) public view returns (bool) {
        return _txid[txid];
    }

    /**
     * @dev Returns true if the txid is exist
     */
    function containsUTXO(Types.UTXO memory utxo) public view returns (bool) {
        return
            UTXOSet[
                Utils.compressUTXO(
                    utxo.assetId,
                    utxo.txid,
                    utxo.index,
                    utxo.omniAddress,
                    utxo.amount
                )
            ];
    }

    /**
     * @dev Retruns AA transformer information
     */
    function getAATransformer(
        bytes32 omniAddress
    ) public view returns (Types.AATransformer memory) {
        return aaTransformer[omniAddress];
    }

    /**
     * @dev Retruns AA transformer information
     */
    function isAATransformer(bytes32 omniAddress) public view returns (bool) {
        return aaTransformer[omniAddress].srcAddress != address(0);
    }

    /**
     * Get the assets
     * @param assetId The token asset id
     */
    function getToken(
        bytes32 assetId
    ) public view returns (Types.Token memory result) {
        return tokens[assetId];
    }

    /**
     * @notice Returns latest batch proof information
     * @return (latest proved batch id, latest proved transaction sequence id)
     */
    function getLatestVerifyInfo() public view returns (uint, uint) {
        Types.BatchState memory batchProof = zkVerifier.latestBatchProof();
        return (batchProof.proof.id, batchProof.proof.end.txSID);
    }

    /**
     * @dev Retruns total transaction number
     */
    function txNumber() public view returns (uint) {
        return totalTxid;
    }

    function getOmniTokenAddress(
        bytes32 assetId
    ) public view returns (address) {
        return omniTokenAddress[assetId];
    }

    function getOmniToken(
        bytes32 assetId
    )
        public
        view
        returns (
            bytes8 salt,
            string memory _name,
            bytes32 deployer,
            uint128 _totalSupply,
            uint128 mintAmount,
            uint128 price,
            uint128 currentSupply
        )
    {
        Types.Token memory token = tokens[assetId];
        salt = token.metadata.salt;
        _name = token.metadata.name;
        deployer = token.metadata.deployer;
        _totalSupply = token.metadata.totalSupply;
        mintAmount = token.metadata.mintAmount;
        price = token.metadata.price;
        currentSupply = token.currentSupply;
    }

    function setAddress(bytes calldata publicKey) public {
        (bytes32 omniAddress, address account) = Utils.convertPulicKey(
            publicKey
        );
        _addresses[account] = omniAddress;
    }

    function containsAddress(address account) public view returns (bool) {
        if (_addresses[account] != bytes32(0)) {
            return true;
        } else {
            return false;
        }
    }

    function balanceOf(
        bytes32 assetId,
        address account
    ) external view returns (uint256) {
        bytes32 omniAddress = _addresses[account];
        return _balances[assetId][omniAddress];
    }

    function balanceOf(
        bytes32 assetId,
        bytes32 omniAddress
    ) external view returns (uint256) {
        return _balances[assetId][omniAddress];
    }

    function name(bytes32 assetId) external view returns (string memory _name) {
        (, _name, , , , , ) = getOmniToken(assetId);
    }

    function totalSupply(
        bytes32 assetId
    ) external view returns (uint256 _totalSupply) {
        (, , , _totalSupply, , , ) = getOmniToken(assetId);
    }

    function decimals() external view returns (uint8) {
        return systemConfig.decimals();
    }
}
