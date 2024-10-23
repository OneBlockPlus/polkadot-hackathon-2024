# DOTCIRCLES

**DOTCIRCLES** is a Substrate-based blockchain pallet designed for implementing decentralized savings circles, known globally as ROSCAs (Rotating Savings and Credit Associations). Built for a Polkadot parachain, it introduces a trustless and transparent way to participate in savings circles, ensuring security, transparency, and decentralized coordination between participants.

## Introduction

Savings circles, also known as ROSCAs, are community-based savings schemes used by millions of people worldwide, often as a form of informal banking where formal credit systems are inaccessible. These circles go by many names across the globe:

- **Hui** (China)
- **Pardner** (Caribbean, Jamaica)
- **Tontine** (France, some parts of Africa)
- **Chit Fund** (India)
- **Susu** (West Africa)
- **Cundina** (Mexico)
- **Pasanaku** (Bolivia)
- **Kou** (Japan)
- **Paluwagan** (Philippines)
- **Esusu** (Nigeria, some parts of West Africa)
- **Jama'iyah** (Middle East, North Africa)
- **Stokvel** (South Africa)
- **Gameya** (Egypt)
- **Kameti** (Pakistan)
- **Kye** (Korea)
- **Tandas** (Mexico)

The concept is simple: a group of people agree to contribute a fixed sum of money at regular intervals, and at each interval, one person in the group takes home the entire pot. This process repeats until each member has received a payout.

### Why People Use Savings Circles

- **Access to Credit**: For individuals without access to formal banking systems or credit, savings circles provide a means of borrowing money.
- **Cultural and Social Value**: Many cultures rely on trust and social bonds within a community, making ROSCAs a familiar and trusted method.
- **Lack of Formal Credit Systems**: In areas with no access to banks or micro-loans, ROSCAs serve as an essential source of funds.

### The Risks

However, traditional savings circles come with some significant risks:
- **Centralized Points of Failure**: The organizer often handles the money, which can lead to theft or mismanagement.
- **Participant Defaults**: Some members may fail to make their contributions on time, causing disruptions in the circle.
- **Trust Issues**: A high level of trust is required, which can lead to exclusion or misuse, especially in informal or unregulated groups.

**DOTCIRCLES** aims to solve these issues by leveraging blockchain technology, eliminating central points of failure, and ensuring that all transactions are transparent, verifiable, and governed by smart contracts. Each circle is self-enforcing, and optional security deposits can be used to mitigate the risk of defaults.

## Architecture

**DOTCIRCLES** is built as a Substrate pallet that allows users to create, manage, and participate in savings circles in a decentralized manner. Below is an explanation of the extrinsics (functions) that can be called within the pallet.

### Extrinsics

1. **`create_rosca`**  
   Creates a new ROSCA with a given set of invited participants, contribution amount, and frequency. The caller becomes the first member of the ROSCA.

   - **Parameters**: 
     - `random_order`: Whether the order of participants will be randomized.
     - `invited_pre_verified_participants`: List of invited participants.
     - `minimum_participant_threshold`: Minimum number of participants required.
     - `contribution_amount`: The amount each participant contributes per cycle.
     - `contribution_frequency`: The block interval between contributions.
     - `start_by_block`: The latest block by which the ROSCA must be started.
     - `position`: Optionally specifies the caller’s position in the payout order.
     - `name`: A name for the ROSCA.

2. **`join_rosca`**  
   Allows invited participants to join a pending ROSCA by claiming an available position.

   - **Parameters**: 
     - `rosca_id`: ID of the ROSCA to join.
     - `position`: Optionally specifies the position the participant wants to claim.

3. **`leave_rosca`**  
   Removes a participant from a ROSCA before it has started.

   - **Parameters**: 
     - `rosca_id`: ID of the ROSCA to leave.

4. **`start_rosca`**  
   Initiates the ROSCA once the minimum participant threshold is met and the ROSCA’s start block has been reached.

   - **Parameters**: 
     - `rosca_id`: ID of the ROSCA to start.

5. **`contribute_to_rosca`**  
   Contributes to the current cycle of the ROSCA. Each participant must send their contribution to the eligible claimant of that round.

   - **Parameters**: 
     - `rosca_id`: ID of the active ROSCA.

6. **`manually_end_rosca`**  
   Ends a ROSCA manually if all contributions have been made, or if it has passed the final contribution block.

   - **Parameters**: 
     - `rosca_id`: ID of the ROSCA to end.

7. **`claim_security_deposit`**  
   Allows participants to claim their security deposit after the ROSCA has completed (if security deposits were used).

   - **Parameters**: 
     - `rosca_id`: ID of the completed ROSCA.

8. **`add_to_security_deposit`**  
   Adds additional funds to a participant’s security deposit, which acts as collateral to ensure contributions. Note that security deposits are optional and not required for all ROSCAs.

   - **Parameters**: 
     - `rosca_id`: ID of the ROSCA.
     - `amount`: Amount to add to the security deposit.

### Key Features

- **Optional Security Deposits**: Participants can optionally lock funds as collateral, which can be slashed in case of default, providing a safety net for other participants with the added benefit of not being marked as defaulted.
- **Random or Ordered Payout**: Organizers can choose whether the payout order is fixed or randomized, offering flexibility based on the group’s preferences.
- **Decentralized Trust**: All contributions and payments are handled by the blockchain, eliminating the need for trust in a single organizer.
- **On-Chain Reputation**: A reputation system could be integrated to track participants’ histories of contributions and defaults across multiple ROSCAs.



## Potential Future Steps

While **DOTCIRCLES** is focused on creating decentralized savings circles (ROSCAs), there are several opportunities to extend this functionality further and integrate additional blockchain features. Here are a few directions the project could take beyond the hackathon:

### 1. Decentralized Identity (DID)
Integrating **decentralized identity (DID)** systems into **DOTCIRCLES** would allow participants to establish verifiable, on-chain identities. This can provide:

- **Reputation Management**: Participants can build a transparent, verifiable reputation based on their participation and payment history in ROSCAs. This reputation can follow them across different ROSCAs and even to other decentralized applications.
- **Trustless KYC**: Identity verification without central authorities or intermediaries, allowing the ROSCA system to be open to global participants.
- **Enhanced Security**: With DID, only verified participants can join certain ROSCAs, reducing the risk of bad actors and improving the overall trustworthiness of the system.

Integrating DID solutions, such as Polkadot’s Identity pallet or decentralized identity standards like DID from the W3C, could significantly strengthen user trust and accountability in the system.

### 2. Loans Based on Payment History
One significant extension of **DOTCIRCLES** could be the introduction of **decentralized loans based on payment history**:

- **Creditworthiness**: Participants’ payment histories within the ROSCAs can be used to assess their creditworthiness. A participant who consistently makes timely contributions could be eligible for decentralized loans through a smart contract system.
- **Lending Pools**: Trusted participants could borrow from a community pool or lending protocol. The interest rates for these loans could be influenced by a participant’s historical reliability in the savings circles.
- **Microloans**: For participants in areas without access to traditional banking, this would provide them with a form of decentralized finance (DeFi) that builds upon their ROSCA reputation.

This functionality could be developed using existing decentralized lending protocols or by introducing new loan structures within the **DOTCIRCLES** framework.

### 3. Staking with Security Deposits
While **DOTCIRCLES** currently allows for **optional security deposits**, this feature could be further enhanced by integrating staking mechanisms:

- **Staking Rewards**: Participants could earn staking rewards on their locked security deposits, ensuring that even collateralized funds are working for them while held in the system.
- **Yield-Generating Deposits**: Security deposits could be locked into yield-generating protocols, such as Polkadot’s staking or DeFi platforms like Aave or Compound, which generate passive income for participants while securing the system.
- **Risk Mitigation**: The staking mechanism could offer slashing penalties for missed payments, but participants would be incentivized by the possibility of earning rewards on their locked deposits, adding a positive dimension to the security deposit system.

By combining staking with security deposits, **DOTCIRCLES** could provide additional financial incentives for participants, making it more than just a savings circle but a platform for earning passive income while promoting responsible behavior.

---

These features would add significant value to **DOTCIRCLES**, turning it into a comprehensive DeFi platform for savings, loans, and decentralized identity. While these features are beyond the scope of the current hackathon, they represent exciting future directions for the project.

