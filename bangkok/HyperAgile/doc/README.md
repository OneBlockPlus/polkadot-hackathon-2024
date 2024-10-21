# Code Submission Breakdown

### Project Folder Structure

Our team organise our code submission into two main root: 

1. `dapp-demo`: All the dapp related, contracts, and blockchain interaction code
2. `robot-sim`: All the robotic simulation setup and connection layer code

```bash
📦dapp-demo-root
┣ 📂public
┣ 📂src
.....┣ 📂app
..........┣ 📂api
...............┣ 📂order
....................┣ 📂local
....................┗ 📂random number
...............┗ 📂robot
..........┣ 📂home
...............┣ 📂inventory
...............┣ 📂store
...............┗ 📂track
..........┣ 📂order
...............┣ 📂approval
...............┗ 📂simulator
.....┣ 📂class
.....┣ 📂components
.....┣ 📂config
.....┣ 📂context
.....┣ 📂contracts ABI
.....┣ 📂data
.....┣ 📂hooks
.....┣ 📂services
.....┗ 📂utils

```

## DApp-Demo Folder Description

## app/

- **api/order/local:** running local simulations on Webot Simulator
- **api/order/random-number:** performing Moonbeam randomness process (request sending and fulfil request)
- **api/robot:** running online embeded Webot simulation, handle robot operation in each phase
- **home/inventory:** stock replenishment (erc-1155 product collection, off-chain stock tracker)
- **home/store:** off-chain on-hold mechanism (order form), order creation (Handling Moonbeam call permit, Moonbeam batch), off-chain db update, choose simulation method
- **home/track:** track each individual wallet address order list (via useOrder hook)
- **order/simulator:** run Webot simulations
- **order/approval:** multi-signature mechanism, keep track Activity Verifier of each phase
- **order/page:** perform order lifecycle on-chain, manage order state, detail on-chain log, render order page UI components

## class/  

- `HyperAgileContracts`: able to interact with all the order fulfilment process via smart contracts and run the order fulfilment lifecycle
- `WebotsSimulator`: able to interact (sending requests) with the connectivity layer of the Webot Simulator

## components/ 

Some reusable frontend UI components are stored here (cards, toast, styling)

## config/

database and wagmi configuration

## context/

- `WalletProvider`: manage wallet connection
- `OrdersProvider`: access and update order context through dapp

## contracts ABI/

ABI of respective contract, refer to `hyperagile-contracts/section` for contracts info

## data/

contract address, detail log template, product collection data, wallet links, customer-info rand value (a randomizer for faster demo purpose)

## hooks/

- `useOrders`: for add,retrieve,updating orders
- `useProcessOrder`: smart contract event listening, checking event logs, syncing order status, update data in each phase in cycle
- `useProducts`: load products, refresh stock info and update, fetch on-chain stock info

## services/

- `Database`: all firebase db interaction
- `DeOSS`: storing lifecycle reports on DeOSS

## utils/

- function encoders for smart contracts
- customer info random generator (built for faster demo purpose)
- `owner`: to process txn as warehouse owner
- `permitPrecompile`: creation and signing of call permit messsages
- `generateRandomNumber`: obtain random number from Moonbeam
