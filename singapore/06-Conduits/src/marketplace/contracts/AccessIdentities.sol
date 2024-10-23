// SPDX-License-Identifier: Apache-2.0
pragma solidity ^0.8.24;

contract AccessIdentities {
    struct Identity {
        string prefix;
        string digest;
    }

    error InvalidIndex();

    mapping(address => Identity[]) internal _identities;

    function getIdentities(address user) public view returns (Identity[] memory) {
        return _identities[user];
    }

    function addIdentity(string memory prefix, string memory digest) public {
        Identity memory newIdentity = Identity(prefix, digest);
        _identities[msg.sender].push(newIdentity);
    }

    function removeIdentity(uint256 index) public {
        if(index >= _identities[msg.sender].length) {
            revert InvalidIndex();
        }
        Identity[] storage identities = _identities[msg.sender];
        identities[index] = identities[identities.length - 1];
        identities.pop();
    }
}
