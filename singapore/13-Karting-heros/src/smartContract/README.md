# GameScore Smart Contract

## Overview

The `GameScore` smart contract is designed to manage player scores, deposits, and rankings for a multiplayer game. It allows players to join game rooms, update their scores, view rankings, and receive rewards based on their performance. The contract is built using the ink! framework for Substrate-based blockchains.

## Contract Structure

### Storage

- **`owner`**: The account that deployed the contract and is the only one authorized to perform certain actions.
- **`score`**: A mapping that stores the scores of players for each game room. The key is the room ID, and the value is a vector of tuples, each containing an `AccountId` and the player's score.
- **`deposit`**: A mapping that stores the deposits made by players for each game room. The key is the room ID, and the value is a vector of tuples, each containing an `AccountId` and the amount deposited.
- **`ranking`**: A mapping that stores the ranking of players based on their scores for each game room. The key is the room ID, and the value is a vector of `AccountId`s representing the ranking order.

### Constructor

- **`new()`**: Initializes the contract, setting the caller as the owner. It also initializes the `score`, `deposit`, and `ranking` mappings.

### Messages

- **`update_score(room_id: String, player: AccountId, new_score: u32)`**: Updates the score of a player in a specific game room. The scores are automatically sorted in descending order, and the rankings are updated accordingly.

- **`join_game(room_id: String)`**: Allows a player to join a game room by transferring a stake (deposit) to the contract. A minimum stake of 1 unit is required.

- **`end_game(room_id: String, winner: AccountId)`**: Ends the game for a specific room and transfers the accumulated deposits (excluding the last player's deposit) to the winner. The deposit records for the room are then cleared.

- **`get_room_score(room_id: String) -> Vec<(AccountId, u32)>`**: Retrieves the scores of all players in a specific game room.

- **`get_room_ranking(room_id: String) -> Vec<AccountId>`**: Retrieves the ranking of players based on their scores in a specific game room.

- **`get_room_deposit(room_id: String) -> Vec<(AccountId, u128)>`**: Retrieves the deposits made by all players in a specific game room.

## Usage

1. **Deploy the Contract**: The contract is deployed by the owner, who is granted special permissions.

2. **Join a Game**: Players join a game room by invoking the `join_game` function and transferring the required stake.

3. **Update Scores**: As the game progresses, the owner or any authorized party can update player scores using the `update_score` function.

4. **End the Game**: Once the game is over, the owner calls the `end_game` function to distribute the rewards to the winner.

5. **View Scores, Rankings, and Deposits**: Players can query the scores, rankings, and deposits for any game room using the respective getter functions.

## Dependencies

This contract relies on the following ink! and Substrate crates:
- `ink_lang`
- `ink_env`
- `ink_storage`