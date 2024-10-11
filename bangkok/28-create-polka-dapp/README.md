## Basic Information

Project name: Create Polka Dapp

Project approval date (month and year): September 2024

Project Creation date: May, 2024

### Project Background

- [Repo](https://github.com/OpeOginni/create-polka-dapp)
- Participated in the Polkadot Prodigy Hackathon where the project was initiated. Have received no extra funding or grants.

## Project Overall Introduction

### Logo

![image-20220622110833152](./docs/create-polka-dapp.png)

### Problem Statement

Polkadot offers a highly scalable, interoperable network for building decentralized applications, but many developers face the challenge of getting started with setting up projects. To solve this, **Create Polka Dapp** provides an easy-to-use CLI for scaffolding starter applications, simplifying the development process for Polkadot-based dApps.

Despite its initial utility, the project currently supports only frontend creation, and there’s a strong need for more flexibility in terms of frameworks, contracts, and evm and substrate chains.

### Introduction

**Create Polka Dapp** is a scaffolding CLI tool aimed at developers looking to quickly set up their Polkadot-based dApp. It currently focuses on frontend-only development but has a roadmap for expansion. The key features include:

- **Frontend Scaffolding**: Quickly set up React or Svelte-based frontends for Polkadot applications.
- **Wallet Integration**: Out-of-the-box wallet connection functionality for Polkadot.
- **Future Expansion**: Plans to support contracts, full-stack setups, and integration with various parachains.

The project's main code repository is available [here](https://github.com/OpeOginni/create-polka-dapp/tree/polkadot-2024-hackathon), and the NPM package can be found [here](https://www.npmjs.com/package/create-polka-dapp).

### Details

- [Pitch Deck](https://github.com/OpeOginni/create-polka-dapp/tree/polkadot-2024-hackathon) -> will be updated
- [Demo Video](https://github.com/OpeOginni/create-polka-dapp/tree/polkadot-2024-hackathon) -> will be updated

## Things Planned to be Done During the Hackathon

### CLI Tool

- Runtime Module
  - [x] Scaffold contracts for different parachains.
  - [x] Integrate contract templates alongside frontend templates.
- Web Frontend
  - [x] Add Next.js as a frontend option.
  - [x] Improve existing React and Svelte templates with modern best practices.
- CLI Templates
  - [x] Scaffold options for contracts, frontend-only, or full-stack depending on developer needs.
  - [ ] Custom CLI templates for specific parachains based on development tools (EVM or INK)

## Hackathon Progress

As the project develops during the hackathon, this section will track the completed features and milestones.

- 2024 Hackathon Milestone:
  - Added new CLI templates.
  - Enhanced wallet functionality and flow.
  - Initial contract scaffolding support.

## Commit Progress

- [Updated CLI dependencies (moved to more lightweight deps) & Setup templates into categories (frontend, contract, frontend + contract)](https://github.com/OpeOginni/create-polka-dapp/commit/13d0a79bab110845b73aec3310b9bb8c80ccf43a)

- [Worked on Current React Frontend Templates](https://github.com/OpeOginni/create-polka-dapp/commit/c1b479e8be1353d0c641227a4243969dd50f3764)

  - Reduced the size of the package by getting rid of JS frontend templates as developers can easily switch the TS templates to work as JS.
  - Completely updated the React + TS frontend template, adding tailwindcss for styling and improving the wallet connection UI and UX.
  - Lastly I decided to stick with `Polkadot-Onboard` for the wallet connection and interaction as this provides end developers with a smooth use and they can make their own custom changes as easy as they like.

- [Created Template for NextJS App Router + Typescript plus new frontend features](https://github.com/OpeOginni/create-polka-dapp/commit/b6d627b0e6cba04f3762b571601f5de9ebfc5189)

  - Added extra extension wallets and nice UI making users install suggested wallets they dont have
  - Implemented a chain switching system where users can move from chain to chain

- [Added Ink Contract Template](https://github.com/OpeOginni/create-polka-dapp/commit/3f971c3edb1c8f85294f5d26f8244e6ae4589ed3)

  - Implemented a simple Hello World Ink Contract Teamplte with a simple Set and Get function.

- [Updated CLI Generation Script](https://github.com/OpeOginni/create-polka-dapp/commit/13a426a0d01c7e2b8fc609784b24e9ff6297fd85)

  - Upgraded Scripts to work for Contracts, Frontend and Contacts + Frontend
  - Added a SubDir Option for users who want to scaffold in a new project but a unique directory.

- [Final Template Details](https://github.com/OpeOginni/create-polka-dapp/commit/2467a9b492be91d8f5a4c915d10fd0c64c26aa81)

  - Added details on how users can implement contract calls on their frontends
  - Fixed Bugs on React + TS template

- [Updated polkagate-icon](https://github.com/OpeOginni/create-polka-dapp/commit/f64218e0d6f169dac6d403d95bea265905db8505)

## Choosen Track

This project is for the **(Infrastructure) Polkadot ecological developer tools** Track

## Member Information

**Ope Oginni**

- Over 2 years of software development experience, specializing in blockchain and decentralized applications.
- Github: [OpeOginni](https://github.com/OpeOginni)
- Discord: obo.baddest
