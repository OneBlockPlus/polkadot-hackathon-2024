# GameScore 合约 README

## 概述

`GameScore` 是一个基于 Ink! 的智能合约，旨在管理多人游戏中的积分、押金和排名。该合约允许玩家在进入游戏时支付押金，并根据游戏结果分发奖励。它还维护了游戏房间的玩家积分和排名数据。

## 合约功能

### 1. **构造函数**

- **`new()`**: 
  - 创建一个新的 `GameScore` 实例。
  - 初始化合约的所有者为部署者账户。
  - 初始化 `score`、`deposit` 和 `ranking` 三个映射，用于存储游戏房间的相关数据。

### 2. **更新玩家积分**

- **`update_score(room_id: String, player: AccountId, new_score: u32)`**: 
  - 更新指定房间内某个玩家的积分。
  - 如果玩家已存在，更新其积分；如果不存在，则添加该玩家及其积分。
  - 根据新的积分排序更新房间内的玩家排名。

### 3. **加入游戏**

- **`join_game(room_id: String)`**: 
  - 允许玩家通过支付押金加入指定的游戏房间。
  - 检查押金是否达到最低要求（1个单位），如果不满足则拒绝加入。
  - 如果玩家已经在房间内有押金，则不会重复记录。

### 4. **发放奖励**

- **`end_game(room_id: String, winner: AccountId)`**: 
  - 结束指定房间的游戏，并将所有玩家押金的总和（除最后一名玩家的押金外）奖励给赢家。
  - 结束游戏后清除该房间的所有押金记录。

### 5. **查询房间积分**

- **`get_room_score(room_id: String) -> Vec<(AccountId, u32)>`**: 
  - 返回指定房间的所有玩家及其积分。

### 6. **查询房间排名**

- **`get_room_ranking(room_id: String) -> Vec<AccountId>`**: 
  - 返回指定房间的玩家排名列表。

### 7. **查询房间押金**

- **`get_room_deposit(room_id: String) -> Vec<(AccountId, u128)>`**: 
  - 返回指定房间的所有玩家及其押金。

## 数据结构

- **`owner: AccountId`**: 合约的所有者，通常是合约的部署者。
- **`score: Mapping<String, Vec<(AccountId, u32)>>`**: 存储每个房间内玩家的积分列表。
- **`deposit: Mapping<String, Vec<(AccountId, u128)>>`**: 存储每个房间内玩家的押金列表。
- **`ranking: Mapping<String, Vec<AccountId>>`**: 存储每个房间内玩家的排名。


## 结论

`GameScore` 合约为多人游戏的开发提供了强大的支持，能够管理游戏中的积分、押金和排名，适合于需要分发奖励的游戏应用场景。