# Project opentgov

## Introduction

opentgov is a new Telegram platform built for voting & participating in Polkadot's OpenGov.
It aims at improving participation, transparency and disucission of DOT stakeholders regarding on-chain referendums.

More than only discovering new spending proposals or tracking them, DOT stakeholders will be able to directly vote in telegram using the bot, in a trustless-way thanks to the proxy account mechanism.

By bringing OpenGov to Telegram in a totally automated way, opentgov is redefining web3 governance for the biggest DAO ever.

## Features planned for the Hackathon

- [ ] Tracking and indexing on-chain proposals.
- [ ] Creating a wrapper to connect to the Telegram API
- [ ] Automation of new posts per track/chan
- [ ] Automation of updating posts with voting infos
- [ ] Custodial solution with proxy wallet creation to allow on-chain vote from the app
- [ ] Front-end displaying current votes and activities on the Telegram channels
- [ ] Automated X posts with new proposals

## Architecture

- Node.JS server for indexing proposals in the DB & handling the proxy wallet voting system.
- Node.JS bot for posting, updating & managing the telegram chans.
- A SQLite DB to store the proposals infos and the chat activity.
- A Nuxt.JS front-end hosted on Vercel to display trending & approved proposals.

## Schedule

- 01/09/2024: Telegram Wrapper MVP
- 15/09/2024: On-chain proxy working
- 01/10/2024: Front-end deployed
- 10/10/2024: Full version working
- 16/10/2024: Submission & alpha launch

## Team info

| name         | role         | GitHub |
| ----------- | ----------- | -----------  |
| Marin  | Fullstack developer  | [mar1](https://github.com/mar1)   |

## Material for Demo

1. Demo Video [link to Youtube]
2. PPT [link to google doc]
