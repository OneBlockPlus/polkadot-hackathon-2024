// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "./GoalType.sol";

struct Goal {
    uint id;
    string name;
    string description;
    uint requiredStake;
    address creator;
    bool completed;
    address[] participants;
    uint taskCount;
    GoalType goalType;
    mapping(address => bool) isParticipant;
    mapping(address => bool) isClaimed;
    mapping(address => uint) completedTaskCount; // 使用 uint 来记录每个用户完成的任务数量
    mapping(address => uint) rewards; // 记录每个用户应得的奖励
}

struct GoalInfo {
    uint id;
    string name;
    string description;
    uint requiredStake;
    address creator;
    bool completed;
    address[] participants;
    GoalType goalType;
}

struct Task {
    string id; // g_issue#githubid -> issue
    string name;
    bool completed;
    string projectId;
    address taskCompleter;
}

struct Project {
    string id; // g_repo#githubid -> repo
    mapping(address => uint) userPoints;
    address[] participants; // List of participants who have earned points
}
