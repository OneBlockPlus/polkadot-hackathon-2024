// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.3;

contract AILink {
    struct ModelHash {
        string modelHash;
        uint256 round;
    }

    mapping(address => ModelHash[]) public localModelHashes;

    mapping(uint256 => string) public globalModelHashes;

    event LocalModelSubmitted(address indexed client, string modelHash, uint256 round);

    event GlobalModelSubmitted(string modelHash, uint256 round);

    function submitLocalModelHash(string memory _modelHash, uint256 _round) public {
        localModelHashes[msg.sender].push(ModelHash(_modelHash, _round));
        emit LocalModelSubmitted(msg.sender, _modelHash, _round);
    }

    function submitGlobalModelHash(string memory _modelHash, uint256 _round) public {
        globalModelHashes[_round] = _modelHash;
        emit GlobalModelSubmitted(_modelHash, _round);
    }

    function getLocalModelHashes(address _client) public view returns (ModelHash[] memory) {
        return localModelHashes[_client];
    }

    function getGlobalModelHash(uint256 _round) public view returns (string memory) {
        return globalModelHashes[_round];
    }
}
