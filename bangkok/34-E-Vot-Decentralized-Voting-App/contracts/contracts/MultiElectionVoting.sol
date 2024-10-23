// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import {ERC2771Context} from "@gelatonetwork/relay-context/contracts/vendor/ERC2771Context.sol";

contract MultiElectionVoting is ERC2771Context {
    struct Candidate {
        string name;
        uint256 voteCount;
        bool isRegistered;
    }

    struct Voter {
        bool isRegistered;
        bool hasVoted;
    }

    struct Election {
        string title;
        uint256 startDate;
        uint256 endDate;
        mapping(bytes32 => Candidate) candidates;
        bytes32[] candidateList;
        mapping(address => Voter) accreditedVoters;
    }

    mapping(uint256 => Election) public elections;
    // mapping(address => Voter) public voters;
    uint256 public electionCount;

    event ElectionCreated(
        uint256 electionId,
        string title,
        uint256 startDate,
        uint256 endDate
    );
    event CandidateAdded(uint256 electionId, bytes32 candidateId, string name);
    event VoterAccredited(uint256 electionId, address voter);
    event Voted(uint256 electionId, address voter, bytes32 candidateId);

    constructor(address trustedForwarder) ERC2771Context(trustedForwarder) {}

    function createElection(
        string memory title,
        uint256 startDate,
        uint256 endDate
    ) public {
        require(
            startDate > block.timestamp,
            "Start date must be in the future"
        );
        require(endDate > startDate, "End date must be after start date");

        uint256 electionId = electionCount++;
        Election storage newElection = elections[electionId];
        newElection.title = title;
        newElection.startDate = startDate;
        newElection.endDate = endDate;

        emit ElectionCreated(electionId, title, startDate, endDate);
    }

    function addCandidate(uint256 electionId, string memory name) public {
        require(
            block.timestamp < elections[electionId].startDate,
            "Election has already started"
        );

        bytes32 candidateId = keccak256(abi.encodePacked(name, electionId));
        require(
            elections[electionId].candidates[candidateId].voteCount == 0,
            "Candidate already exists"
        );

        elections[electionId].candidates[candidateId] = Candidate(
            name,
            0,
            true
        );
        elections[electionId].candidateList.push(candidateId);

        emit CandidateAdded(electionId, candidateId, name);
    }

    function accreditVoter(uint256 electionId, address voterAddress) public {
        require(
            block.timestamp < elections[electionId].startDate,
            "Election has already started"
        );
        require(
            !elections[electionId].accreditedVoters[voterAddress].isRegistered,
            "Voter already accredited"
        );

        // if (!voters[voterAddress].isRegistered) {
        //     voters[voterAddress].isRegistered = true;
        // }
        elections[electionId]
            .accreditedVoters[voterAddress]
            .isRegistered = true;

        emit VoterAccredited(electionId, voterAddress);
    }

    function vote(uint256 electionId, bytes32 candidateId) public {
        address voter = _msgSender();
        require(
            elections[electionId].accreditedVoters[voter].isRegistered,
            "Voter is not accredited for this election"
        );
        
        // require(
        //     !voters[voter].hasVoted[electionId],
        //     "Voter has already voted in this election"
        // );

        require(
            block.timestamp >= elections[electionId].startDate &&
                block.timestamp <= elections[electionId].endDate,
            "Election is not active"
        );
        require(
            elections[electionId].candidates[candidateId].isRegistered == true,
            "Candidate does not exist"
        );

        // voters[voter].hasVoted[electionId] = true;
        elections[electionId].candidates[candidateId].voteCount++;

        emit Voted(electionId, voter, candidateId);
    }

    function getElectionDetails(
        uint256 electionId
    )
        public
        view
        returns (
            string memory title,
            uint256 startDate,
            uint256 endDate,
            uint256 candidateCount
        )
    {
        Election storage election = elections[electionId];
        return (
            election.title,
            election.startDate,
            election.endDate,
            election.candidateList.length
        );
    }

    function getCandidates(
        uint256 electionId
    )
        public
        view
        returns (bytes32[] memory, string[] memory, uint256[] memory)
    {
        Election storage election = elections[electionId];
        uint256 candidateCount = election.candidateList.length;

        string[] memory names = new string[](candidateCount);
        uint256[] memory voteCounts = new uint256[](candidateCount);

        for (uint256 i = 0; i < candidateCount; i++) {
            bytes32 candidateId = election.candidateList[i];
            Candidate storage candidate = election.candidates[candidateId];
            names[i] = candidate.name;
            voteCounts[i] = candidate.voteCount;
        }
        // [2838838ee, djj33333],   [Ade, Kola],    [2, 4]
        return (election.candidateList, names, voteCounts);
    }

    function hasUserVoted(
        uint256 electionId,
        address voterAddress
    ) public view returns (bool) {
        return elections[electionId].accreditedVoters[voterAddress].hasVoted;
    }
}
