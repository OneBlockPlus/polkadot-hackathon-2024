// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract BitcoinBridge is AccessControl {
    bytes32 public constant BITCOIN_PROCESSOR_ROLE = keccak256("BITCOIN_PROCESSOR_ROLE");
    bytes32 public constant API_PROVIDER_ROLE = keccak256("API_PROVIDER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    struct Request {
        address user;
        bool isCompleted;
    }

    struct Transaction {
        string incomingTxId;
        address destinationAccount;
        uint256 amount;
        string issueTxId;
        uint8 status;
    }

    struct OutgoingTransaction {
        address user;
        string outgoingTxId;
        address destinationAddress;
        uint256 amount;
        uint8 status;
    }

    address public bridgeAddress;
    IERC20 public bitcoinToken;
    mapping(address => string) public userBitcoinAddresses;
    Request[] public generationRequests;
    mapping(address => bool) public hasRequested;
    mapping(address => Transaction[]) public incomingTransactions;
    OutgoingTransaction[] public outgoingTransactions;

    event AccountGenerationRequested(address indexed user);
    event BitcoinAddressSet(address indexed user, string bitcoinAddress);
    event IncomingTransactionRegistered(address indexed user, string incomingTxId, uint256 amount);
    event OutgoingTransactionRequested(address indexed user, address destinationAddress, uint256 amount);
    event OutgoingTransactionCompleted(address indexed user, string outgoingTxId);

    constructor(address _admin, address _bridgeAddress, address _bitcoinToken) {
        _grantRole(ADMIN_ROLE, _admin);
        bridgeAddress = _bridgeAddress;
        bitcoinToken = IERC20(_bitcoinToken);
    }

    function setBitcoinProcessor(address bitcoinProcessor) external onlyRole(ADMIN_ROLE) {
        _grantRole(BITCOIN_PROCESSOR_ROLE, bitcoinProcessor);
    }

    function setAPIProvider(address apiProvider) external onlyRole(ADMIN_ROLE) {
        _grantRole(API_PROVIDER_ROLE, apiProvider);
    }

    function requestAccountGeneration() external {
        require(!hasRequested[msg.sender], "User has already requested an account");
        hasRequested[msg.sender] = true;
        generationRequests.push(Request({
            user: msg.sender,
            isCompleted: false
        }));
        emit AccountGenerationRequested(msg.sender);
    }

    function requestAccountGenerationByAPI(address user) external onlyRole(API_PROVIDER_ROLE) {
        require(!hasRequested[user], "User has already requested an account");
        hasRequested[user] = true;
        generationRequests.push(Request({
            user: user,
            isCompleted: false
        }));
        emit AccountGenerationRequested(user);
    }

    function setBitcoinAddress(uint256 requestId, string memory bitcoinAddress) external onlyRole(BITCOIN_PROCESSOR_ROLE) {
        require(requestId < generationRequests.length, "Invalid request ID");
        Request storage request = generationRequests[requestId];
        require(!request.isCompleted, "Request already completed");
        userBitcoinAddresses[request.user] = bitcoinAddress;
        request.isCompleted = true;
        emit BitcoinAddressSet(request.user, bitcoinAddress);
    }

    function registerIncomingTransaction(
        string memory incomingTxId, 
        address user, 
        uint256 amount
    ) external onlyRole(BITCOIN_PROCESSOR_ROLE) {
        require(bytes(userBitcoinAddresses[user]).length > 0, "No Bitcoin address found for this user");
        Transaction memory txInfo = Transaction({
            incomingTxId: incomingTxId,
            destinationAccount: user,
            amount: amount,
            issueTxId: "",
            status: 0
        });
        incomingTransactions[user].push(txInfo);
        emit IncomingTransactionRegistered(user, incomingTxId, amount);
    }

    function confirmIncomingTransaction(address user, uint256 txIndex, string memory issueTxId) external onlyRole(BITCOIN_PROCESSOR_ROLE) {
        require(txIndex < incomingTransactions[user].length, "Invalid transaction index");
        Transaction storage txInfo = incomingTransactions[user][txIndex];
        require(txInfo.status == 0, "Transaction already confirmed");
        txInfo.issueTxId = issueTxId;
        txInfo.status = 1;
    }

    function getUserIncomingTransactions() external view returns (Transaction[] memory) {
        return incomingTransactions[msg.sender];
    }

    function requestBridgeOut(uint256 amount, address destinationAddress) external {
        bitcoinToken.transferFrom(msg.sender, address(this), amount);
        outgoingTransactions.push(OutgoingTransaction({
            user: msg.sender,
            outgoingTxId: "",
            destinationAddress: destinationAddress,
            amount: amount,
            status: 0
        }));
        emit OutgoingTransactionRequested(msg.sender, destinationAddress, amount);
    }

    function completeOutgoingTransaction(uint256 txIndex, string memory outgoingTxId) external onlyRole(BITCOIN_PROCESSOR_ROLE) {
        require(txIndex < outgoingTransactions.length, "Invalid transaction index");
        OutgoingTransaction storage txInfo = outgoingTransactions[txIndex];
        require(txInfo.status == 0, "Transaction already completed");
        txInfo.outgoingTxId = outgoingTxId;
        txInfo.status = 1;
        bitcoinToken.transfer(bridgeAddress, txInfo.amount);
        emit OutgoingTransactionCompleted(txInfo.user, outgoingTxId);
    }

    function getAllGeneratedAddresses() external view returns (address[] memory users, string[] memory bitcoinAddresses) {
        uint256 count = generationRequests.length;
        users = new address[](count);
        bitcoinAddresses = new string[](count);
        for (uint256 i = 0; i < count; i++) {
            users[i] = generationRequests[i].user;
            bitcoinAddresses[i] = userBitcoinAddresses[users[i]];
        }
    }
}
