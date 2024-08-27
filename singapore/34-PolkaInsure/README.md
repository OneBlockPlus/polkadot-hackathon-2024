# Project details
##### Name: PolkaInsure
##### Creation Date: 25 Aug 2024
##### Background: https://github.com/ray-97/polkadot-hackathon-2024, fresh from suggested idea @ https://dorahacks.io/idea/1548163

# Team information and Logo
##### Ruicong Cai
- Polkadot Blockchain Academy Wave 5 graduate
- Student @ National University of Singapore
- Background and interest in distributed computing and entrepreneurship
- contact: rc97@u.nus.edu

![alt text](image.png)

# Overview
##### Problem to be solved & Design
PolkaInsure as a prototype is a peer to peer insurance appchain for all things mutually agreeable by insurers and the insured. However, we would want to specialise towards being a cross chain appchain for smart contract failures, slashing risks (for stakers and validators), and Defi risks (slippage, impermanent loss etc). 

Due to the complexity of our desired enhancement (see below), we have for now settled on using game theory between users. Insurers and the insured have a rating system which affects their weight in voting. Suppose everyone initially has 100 points, users can self incur a hefty 25 points (prevent abuse) to penalise someone else for say 40 points. If either party points should fall below 1, the operation fails to go through. Both parties need to be fair for continued trust in contract (Insurers want insured to continue. Insured wants there to be insurers to exist.).

The insured can make claims, and if the votes in total weigh more than average points then the claim goes through. For now, insurers and insured can communicate over other channels to hash out details (risk and amount covered etc) that they are mutually agreeable to before they create and enter insurance funds.

##### Business value: why it is needed and what is the disruptive potential?
Helps insured to protect against loss and shock, especially if it is possibly hefty, by paying affordable amounts periodically to hedge against risks. This is useful particularly because many entities want to be moving fast in the blockchain world and it is quite impossible and time consuming to be completely safe from vulnerabilities, which is already proven historically to happen. Insurers on the other hand can make their money work for them by designing clever contracts with the insured.

Traditionally, institutionalised insurers hold the power and would try to manipulate clauses unilaterally set by them into their favor when the insured members need to claim. Additionally, they are free to design and price premiums one sidedly.
With use of blockchain, logic and clauses for insurance contract is mutual, transparent and enforced by code. There is increase in confidence that consumers are getting what they pay for because things are decentralised and they are equally in control. With adoption, PolkaInsure can become the go to avenue for fair and trusted insurance.

### Deliverable for hackathon
- Insurance fund (creation, insurer entry, insurer withdrawal, insured entry, insured claim) -> slight issue with figuring out transfer of fungibles
- Rating system

##### Demo link: 
- N/A, project still buggy

### Future enhancements needed to become a viable product
- Less trust and more truth with onchain monitoring, oracles, zk proofs etc.
- Allow multiple claims to a single insurance fund while factoring dynamically adjusted premiums based on claim rate.
- Mutable insurance fund details, approvable by insurers voting
- Introduce the notion of cycles / time periods to charge recurring fees to those opting into insurance + enable periodic calculation of payouts of insurers + dynamically rebalance ratings based on staying period
- staking / mechanisms to grow deposited funds to generate returns for insurers who provided liquidity.
- minimum lock in periods for insurers
- more interopability to allow cross chain creation and purchase of insurance
- support sophisticated pricing structures tailored to needs of insurers. We hope to be able to attract reputable providers such as Insurace, Bridge Mutual and Nexus Mutual
- UI for user friendliness and convenience 

# Track and Selected Bounty
- Category 3 (Chain)
- Blockchain for good - security and transparency