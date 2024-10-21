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

