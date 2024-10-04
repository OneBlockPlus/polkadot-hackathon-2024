# e-volt

# MultiElectionVoting Smart Contract

## Overview
The **MultiElectionVoting** smart contract is designed to manage multiple elections, allowing for the registration of candidates and voters, as well as the recording of votes in a decentralized and secure manner. The contract leverages the ERC2771Context for meta-transactions, ensuring that operations are executed within the context of trusted forwarders.

## Features
- **Election Management**: Create and manage multiple elections, each with a specific title, start date, and end date.
- **Candidate Registration**: Add candidates to specific elections before the election start date.
- **Voter Accreditation**: Register voters for specific elections, ensuring only accredited voters can participate.
- **Voting**: Accredited voters can vote for registered candidates within the active election period.
- **Election Information**: Retrieve details about elections, including the list of candidates and their vote counts.

## Contract Structure

### State Variables
- `mapping(uint256 => Election) public elections`: Stores all elections by their unique ID.
- `uint256 public electionCount`: Keeps track of the number of elections created.

### Structs
- **Candidate**: Represents a candidate in an election, storing their name, vote count, and registration status.
- **Voter**: Represents a voter, storing their registration and voting status.
- **Election**: Represents an election, storing the title, start and end dates, a list of candidates, and accredited voters.

### Events
- `ElectionCreated(uint256 electionId, string title, uint256 startDate, uint256 endDate)`: Emitted when a new election is created.
- `CandidateAdded(uint256 electionId, bytes32 candidateId, string name)`: Emitted when a new candidate is added to an election.
- `VoterAccredited(uint256 electionId, address voter)`: Emitted when a voter is accredited for an election.
- `Voted(uint256 electionId, address voter, bytes32 candidateId)`: Emitted when a vote is cast.

### Functions

- **Constructor**
  - `constructor(address trustedForwarder) ERC2771Context(trustedForwarder)`: Initializes the contract with the address of a trusted forwarder for meta-transactions.

- **createElection**
  - `function createElection(string memory title, uint256 startDate, uint256 endDate) public`: Creates a new election with the specified title, start date, and end date.

- **addCandidate**
  - `function addCandidate(uint256 electionId, string memory name) public`: Adds a new candidate to an election before it starts.

- **accreditVoter**
  - `function accreditVoter(uint256 electionId, address voterAddress) public`: Accredits a voter for a specific election.

- **vote**
  - `function vote(uint256 electionId, bytes32 candidateId) public`: Allows an accredited voter to cast their vote for a specific candidate during the active election period.

- **getElectionDetails**
  - `function getElectionDetails(uint256 electionId) public view returns (string memory title, uint256 startDate, uint256 endDate, uint256 candidateCount)`: Retrieves details about an election, including the title, start date, end date, and number of candidates.

- **getCandidates**
  - `function getCandidates(uint256 electionId) public view returns (bytes32[] memory, string[] memory, uint256[] memory)`: Retrieves the list of candidates for an election along with their names and vote counts.

- **hasUserVoted**
  - `function hasUserVoted(uint256 electionId, address voterAddress) public view returns (bool)`: Checks if a specific voter has voted in a particular election.


## contract was deployed to the arb sepolia testnet
Below is the contract address 

0xdB148aa6F1B878B55c1155d280dF4f8A07A4DA24

## How to Contribute

### Prerequisites
- Solidity ^0.8.17
- Gelato Relay
- MetaMask or any Ethereum-compatible wallet
- Node.js with Hardhat or Truffle for testing and deployment
- Web3.js
- Next.js
- Ether.js

### Steps to Contribute

1. **Fork the Repository**: Start by forking the repository to your GitHub account.

2. **Clone the Repository**: Clone the forked repository to your local development environment.
   ```bash
   git clone https://github.com/your-username/MultiElectionVoting.git
   ```

3. **Install Dependencies**: Navigate to the project directory and install the necessary dependencies.
   ```bash
   cd MultiElectionVoting
   npm install
   ```

4. **Compile the Contract**: Compile the smart contract using Hardhat or foundry.
   ```bash
   npx hardhat compile
   ```

5. **Run Tests**: Write and run unit tests to ensure the functionality of the contract.
   ```bash
   npx hardhat test
   ```

6. **Deploy the Contract**: Deploy the contract to your desired Ethereum network (e.g., Mainnet, Ropsten, etc.).
   ```bash
   npx hardhat run ignition/modules/MultiElectionVoting.ts --network lisk-sepolia
   ```

7. **Submit a Pull Request**: After making changes, push the changes to your forked repository and create a pull request.

8. **Review Process**: Your pull request will be reviewed by the maintainers. Ensure that you follow the coding standards and provide adequate documentation for your changes.

### Contribution Guidelines
- **Follow Solidity Best Practices**: Ensure your code follows best practices for security and efficiency.
- **Write Tests**: Include tests for any new features or modifications to ensure contract integrity.
- **Document Your Code**: Provide comments and documentation for any significant code changes or new features.
- **Adhere to the Code Style**: Maintain consistent code style as per the existing codebase.

### Issues
If you encounter any bugs or issues, please open an issue in the repository with detailed information on how to reproduce the problem.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Deployment
The smart contract was deployed on the Lisk network.
- **Contract Address**: 0x173A35de308c2B00B19D5102e4068BbD338fAD32