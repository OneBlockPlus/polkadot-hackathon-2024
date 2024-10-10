
import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const trustedForwarder = "0xd8253782c45a12053594b9deB72d8e8aB2Fca54c";

const MultiElectionVotingModule = buildModule("MultiElectionVotingModule", (m) => {

    const multiElection = m.contract("MultiElectionVoting", [trustedForwarder]);

    return { multiElection };
});

export default MultiElectionVotingModule;

// Deployed MultiElectionVoting: 0x212E076ECC738D6491c26fE83d8Eb4cC67B9973d

