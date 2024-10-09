# LunaCred

## Introduction

Lunacred is a decentralized staking and trust-based DApp built on the Moonbeam parachain. The platform allows users to build their credibility by staking tokens and receiving stakes from others, enabling a social-proof-based ranking system. Quadratic voting mechanisms are employed to ensure that a greater number of backers contribute more to a user's credibility score rather than just the volume of tokens staked.

## Features Planned for the Hackathon

1. **Credibility Staking**:

   - Users can stake $GLMR tokens on other users to increase their credibility score.
   - Quadratic voting mechanism: Credibility points are calculated as the square root of staked tokens.
   - Weekly rewards distribution based on credibility scores.

2. **User Interface**:

   - Stake/Unstake interface.
   - Display of user's rank, available $GLMR, locked $GLMR, and credibility staking rewards.
   - Credibility score display with weekly yield information.
   - Table showing address interactions, stakes, and credibility points.

3. **Token Economy Integration**:

   - Full integration with Moonbeam's $GLMR tokens for staking and rewards.

4. **Decentralized Governance**:

   - Governance tools using credibility scores for community-driven trust.

5. **Smart Contract Development**:
   - Core smart contracts for staking, credibility scoring, and reward distribution.

## How Credibility Staking Works

1. Users stake $GLMR tokens on other users' addresses to boost their credibility.
2. Credibility points are calculated using a quadratic voting system:
   - When a user stakes 25 $GLMR tokens, the recipient gains √25 = 5 credibility points.
   - This system rewards having more supporters over larger individual stakes.
3. Weekly rewards are distributed based on credibility scores.
4. Users can claim their rewards, which are a percentage of their CRED score.

## Architecture

LunaCred follows a typical DApp architecture, consisting of:

1. **Smart Contracts**: Written in Solidity, deployed on the Moonbeam network.
2. **Frontend**: React-based user interface with features for staking, unstaking, and viewing credibility scores.
3. **Web3 Integration**: Using Ethers.js for blockchain interactions.
4. **Moonbeam Network**: Utilizing Moonbase Alpha testnet for development and testing.

## Schedule

## Team info

## Material for Demo

1. Demo Video [link to Youtube]
2. PPT [link to google doc]
