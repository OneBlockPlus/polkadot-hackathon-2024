
<img src="./doc/White.png" width="50px">

## Blog3

Blog3 is a Web3-inspired blog platform, as reflected in its name. However, Blog3 is not limited to just blogs; it aims to be the next generation content sharing platform, giving ownership back to both authors and readers. It covers blogs, novels, and other digital content forms.

Launched on 2024/09/01

## Background

In the current market, there are typical traditional blog platforms like Medium and crypto blog platforms such as Mirror.

Fierce competition exists among traditional blog platforms, forcing some content creators to migrate or operate across different platforms due to rapidly changing traffic patterns.

Crypto blog platforms typically target a small group of users, limiting their user base. They also often have limited monetization options for content creators.

## Problems to be Solved

As mentioned above, there are several issues that need to be addressed:

1. Centralized platforms control and host the content itself; literally, creators can't control the assets they should own.
2. Currently, many centralized content platforms receive most of the ad revenue, distributing only a portion to creators.
3. Readers are usually just consumers on general platforms, unable to be compensated for their attention and sharing contributions.

## Project Overview

Blog3 is here to revolutionize content platforms:

1. **Giving back ownership**: We will return ownership to content creators. Under a subscription model, only creators and subscribed readers can see the content. Storage management is also under the creators' control.
2. **Sharing broader revenue**: We have pre-set a bonding curve to ensure a fair revenue-sharing percentage between content creators and the platform, guaranteeing creators receive most of the revenue they deserve.
3. **Contribution means ownership**: We regard readers' tips to content as contributions, allowing readers to share in the revenue from the content once their tips reach a certain point on the bonding curve.


## Project Demonstration

### Basic Features

We support fundamental functions similar to other blog platforms, including article publication, subscription, and tipping. There are no entry barriers for creators. For example:

- Creators can set articles to be public or subscriber-only.
- Only subscribers can read certain articles.
- Users can set subscription fees on a monthly, quarterly, or yearly basis.

### Tip Bonding Curve

The Tip Bonding Curve is an innovative mechanism first proposed by Blog3. Under this system:

- Each tip is regarded as an investment in the article.
- 80% of shares are open for tippers, while the remaining 20% is kept for the creator.
- Once the Tip Bonding Curve threshold is achieved, the shares become public.
- All tips are shared among tippers and creators.
- Subsequent tips also enter the tip pool.

### Ad Auctions

When the Tip Bonding Curve threshold is successfully achieved, the article unlocks ad slots. The ad auction process works as follows:

- Anyone can bid for ad slots daily.
- The auction for the next day ends one hour before the previous day closes.
- The highest bidder secures the slot.
- Ad revenue is added to the pool along with tips.


## Technical Architecture
### Business Architecture
![business_architecture.png](doc%2Fbusiness_architecture.png)
### Technical Structure
![structure.jpg](doc%2Fstructure.jpg)

## Demo

- [Presentation](https://docs.google.com/presentation/d/1iUXXtaeWJx--H7DTvjyJET4Z_mN4jp7z/edit?usp=sharing&ouid=108399294800638300424&rtpof=true&sd=true)
- [Video](https://youtu.be/XzGvRMKR89I)

## Team Information

| Name         | Role         | Github                      |
| ----------- | ----------- |-----------------------------|
| Xin       | Full Stack Engineer | https://github.com/5255b64  |
| Frank         | Product Manager | https://github.com/Junweif2 |


## Selected and Category & Bounty

Category: Open Topic

Bounty: 
- CESS Network
- Moonbeam


## Planned and Completed Code Deliverables during the Hackathon

### Basic Features
- Authentication
  - [x] Login and Logout via Subwallet
  - [x] Login and Logout via Talisman

- Creator Features
  - [x] Articles List
  - [x] Followers List
  - [x] Markdown Editor
  - [ ] IPFS Uploading
  - [ ] Local Draft & Save
  - [ ] Set Article Mode (Public/Subscriber-only)
  - [x] Set Subscription Fees

- Reader Features
  - [x] Following List
  - [x] Article Rendering
  - [x] Subscription Validation
  - [x] Tipping Functionality

### Tip Bonding Curve

- Bonding Curve Implementation
  - [x] Curve Parameter Setting
  - [ ] Frontend Development
    - [ ] Progress Visualization
    - [ ] Share Price Display
  - [ ] Shares Ledger

- Tip Pool Management
  - [ ] Assets Holding via Multisig
  - [ ] Claim and Burn Mechanism

### Ad Auction

- Ad Slot Management
  - [ ] Frontend Display

- Auction Contract
  - [ ] Auction Mechanism Implementation
  - [ ] Revenue Transfer System

