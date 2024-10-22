# Project "./augmeaProtocol"

"./augmeaProtocol" is a decentralized overcollateralized stablecoin backed by liquid staking value where simply by holding the asset allows users to automatically earn yield, thanks to the continuous rewards from staking plus up to four different ways to generate even more yield on the same invested capital.


## Introduction

Project name:

"./augmeaProtocol"


Project creation date:

Coding for the project started the 10/11/24.


Project background, including github link before, won any rewards before, got any grant from web3 foundation and so on:

The project started with the idea of implementing metapool (liquid staking tech) and extending its use case on a defi protocol on an ethereum ecosystem using solidity contracts.



The problem the project try to resolve:

The concept behind this project emerged in response to practices by Tether, the pioneering entity in centralized, fiat-backed stablecoins. Tether traditionally invests the fiat collateral in treasury bonds and various financial instruments, retaining the generated revenue rather than distributing it among the stablecoin holders. This project seeks to eliminate the centralized intermediary by directly distributing the revenue accrued from the stablecoin’s collateral to its holders, thereby fostering a more equitable and decentralized financial ecosystem.



## Features planned for the Hackathon

The status of project before participate the Hackathon:

Already had the idea and the overall architecture to implement it.



Features are planed for the Hackathon:

- Use runtime api interaction to implement liquid staking
- Create smart contracts for:
  - liquid staking token
  - liquid token vault
  - liquid staking backed stablecoin
  - defi lending protocol
- Use DIA oracle to get price feeds
- Build a basic/medium UI front end with contracts interaction


## Architect

Diagram of architect for the project:

https://drive.google.com/file/d/1rcqS1xh1UScXTdDItyg8IIqJ9ThQJp7Q/view?usp=sharing


Description for each component:

- liquidStaking contract interacts with the parachainRuntime to enable runtime api calls from contract.
- liquidStablecoinVault contract locks the liquidStakingTokens collateral, offers flashloans, controls the minting of the augmeaStablecoin and uses the diaPriceOracle to calculate how much liquidStakingTokens equals to 2 usd to mint 1 augmeaStablecoin.
- wrappedDot contract emits PSP22 tokens by locking dot asset.
- augmeaLendingProtocol contract uses the augmeaStablecoin as asset that lenders use, wrappedDot that borrowers locks as collateral and diaPriceOracle to calculate the liquidation price of positions and borrowing power of the collateral.


## Schedule

Timeline for all activities of your project during Hackathon:

- Investigation and design of parachain runtime api calls implementations: 10/11/24
- Deveopment of smart contracts: 10/12/24 - 10/15/24
- Simple frontend for smart conatracts interaction: 10/16/24
- Design of fronted UI: 10/17/24 - 10/18/24
- Frontend UI design implementation: 10/19/24 - 10/21/24


Important milestone like first submit, pre-demo, testnet:

The time milestones followed were:
  - Design smart contracts functionality to interact with the blockchain´s runtime api
  - Develop smart contracts correctly ensuring there are no errors
  - Deploy smart contracts on testnet
  - Build simple frontend to interact with smart contracts
  - Design frontend UI
  - Implement UI on frontend that has already interaction with smart contracts
  - Demo


Completed features, tests, docs or in production:

All the project features planned at the start were completed and smart contracts deployed to alephZero testnet and ready to be used on the following addresses:
  - liquidStakingToken: 5FFaySnQQNC2rJjGiK3UYsXDpdxLvZaz18VqUZSUMtuH22rb
  - augmeaStablecoin: 5GuuHEF48acQHx6uNoigK9eY3rMyjrPantGKLVAkEufGW58X
  - liquidStablecoinVault: 5D7TKjKGLz6rBaEjwREWKmUxkN9UJQo7orP2FpcoqCKGfoLP
  - wrappedDot: 5FmczWdABJDuNv9TREjyvFPc4JgLfnh1smoPSjQLTAGuqamm
  - shareToken: 5CrcMaK16kznjdzscSfFdXEQ16xwrYn1VBomNSrweaGPz3LZ
  - augmeaLendingProtocol: 5CxVw4Gm7QJ2XWwF3KRFcZEjPjB2kc8doUZD7TbjCZWB6piX

## Team info

All team members and each one's background:

- Erezedor / Carlos Arroyo: Fullstack Dapp developer


Contact info for each one, email, github hander and so on:

- Erezedor
  - github: @Kanoopz
  - email: agonzalez.carlos@gmail.com
  - X: https://x.com/yoSoyDev_eth


## Track and bounty

Track you choose:

Category 2 (HOT)


Bounty you will apply:

None


** Mandatory before offline demo, submit aterial for Demo

| Materiial    | Link                                                                                                 |
| ------------ | ---------------------------------------------------------------------------------------------------- |
| Video        |                                                                                                      |
| Presentation | https://drive.google.com/file/d/1cUFQYWzzS0RW2pYS8A55ATlg1PY-tf4-/view?usp=sharing                   |


optional parts
1. tokenomics design
2. marketing plan
3. vc, investment
4. community growth
