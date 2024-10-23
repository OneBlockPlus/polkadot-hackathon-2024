// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.3;

contract AILink {
    address public admin;
    address public server;
    mapping(address => bool) private registeredClients;

    // address > round > hash
    mapping(address => mapping(uint256 => string)) private localModelHashes;
    mapping(uint256 => string) private globalModelHashes;

    uint256 private start_round;
    uint256 private iterations; // number of iterations starting from start_round to start_round + iterations.
    uint256 private current_round; // always point to current round between start_round and start_round + iterations

    // Events
    event LocalModelSubmitted(
        address indexed client,
        string modelHash,
        uint256 round
    );
    event GlobalModelSubmitted(string modelHash, uint256 round);
    event ClientRegistered(address indexed client);
    event ClientDeregistered(address indexed client);
    event ServerUpdated(address indexed newServer);
    event AdminTransferred(address indexed oldAdmin, address indexed newAdmin);

    // Modifiers
    modifier onlyAdmin() {
        require(msg.sender == admin, "Access restricted to the admin.");
        _;
    }

    modifier onlyServer() {
        require(msg.sender == server, "Access restricted to the server.");
        _;
    }

    modifier onlyRegisteredClient() {
        require(
            registeredClients[msg.sender],
            "Access restricted to registered clients."
        );
        _;
    }

    modifier isValidSha256(string memory _modelHash) {
        require(bytes(_modelHash).length == 64, "Invalid SHA-256 hash length.");
        _;
    }

    modifier isValidRound(uint256 _round) {
        require(
            _round >= start_round && _round < start_round + iterations,
            "Round is out of valid range"
        );
        _;
    }

    modifier isValidStartRound(uint256 _start_round) {
        require(
            _start_round == current_round &&
                _start_round == start_round + iterations,
            "The new start round must be the next round after the previous set of iterations."
        );
        _;
    }

    modifier hashNotExists(address _client, uint256 _round) {
        require(
            bytes(localModelHashes[_client][_round]).length == 0,
            "Hash already exists for this round"
        );
        _;
    }

    // Constructor
    constructor(
        address _admin,
        address _server,
        uint256 _start_round,
        uint256 _iterations
    ) {
        admin = _admin;
        server = _server;

        start_round = _start_round;
        current_round = _start_round;

        iterations = _iterations;
    }

    // Functions
    function transferAdmin(address _newAdmin) public onlyAdmin {
        require(
            _newAdmin != address(0),
            "New admin cannot be the zero address."
        );
        emit AdminTransferred(admin, _newAdmin);
        admin = _newAdmin;
    }

    function updateServer(address _newServer) public onlyAdmin {
        require(_newServer != address(0), "Server cannot be the zero address.");
        server = _newServer;
        emit ServerUpdated(_newServer);
    }

    function registerClient(address _client) public onlyAdmin {
        require(!registeredClients[_client], "Client is already registered.");
        registeredClients[_client] = true;
        emit ClientRegistered(_client);
    }

    function deregisterClient(address _client) public onlyAdmin {
        require(registeredClients[_client], "Client is not registered.");
        registeredClients[_client] = false;
        emit ClientDeregistered(_client);
    }

    function submitLocalModelHash(
        string memory _modelHash,
        uint256 _round
    )
        public
        onlyRegisteredClient
        isValidSha256(_modelHash)
        isValidRound(_round)
        hashNotExists(msg.sender, _round)
    {
        localModelHashes[msg.sender][_round] = _modelHash;
        emit LocalModelSubmitted(msg.sender, _modelHash, _round);
    }

    function submitGlobalModelHash(
        string memory _modelHash,
        uint256 _round
    ) public onlyServer isValidSha256(_modelHash) isValidRound(_round) {
        require(
            bytes(globalModelHashes[_round]).length == 0,
            "Global model hash already exists for this round"
        );
        globalModelHashes[_round] = _modelHash;

        // Increment the current round
        current_round++;

        emit GlobalModelSubmitted(_modelHash, _round);
    }

    function getLocalModelHashAtRound(
        address _client,
        uint256 _round
    ) public view returns (string memory) {
        string memory hash = localModelHashes[_client][_round];
        require(
            bytes(hash).length > 0,
            "Model hash not found for the given round."
        );
        return hash;
    }

    function getGlobalModelHash(
        uint256 _round
    ) public view returns (string memory) {
        string memory hash = globalModelHashes[_round];
        require(
            bytes(hash).length > 0,
            "Global model hash not found for the given round."
        );
        return hash;
    }

    function doesLocalModelHashExist(
        address _client,
        uint256 _round
    ) public view returns (bool) {
        return bytes(localModelHashes[_client][_round]).length != 0;
    }

    function setStartRound(
        uint256 _startRound
    ) public onlyAdmin isValidStartRound(_startRound) {
        start_round = _startRound;
    }

    function getStartRound() public view returns (uint256) {
        return start_round;
    }

    function setIterations(uint256 _iterations) public onlyAdmin {
        iterations = _iterations;
    }

    function getIterations() public view returns (uint256) {
        return iterations;
    }

    function setCurrentRound(uint256 _currentRound) private {
        current_round = _currentRound;
    }

    function getCurrentRound() public view returns (uint256) {
        return current_round;
    }
}
