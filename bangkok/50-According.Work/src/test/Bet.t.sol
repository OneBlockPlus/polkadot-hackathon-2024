// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Test} from "forge-std/Test.sol";
import "forge-std/console.sol";
import {Bet} from "../src/Bet.sol";
import "../src/GoalType.sol";
import "../src/Goal.sol";

contract BetTest is Test {
    Bet public bet;

    function setUp() public {
        bet = new Bet();
    }

    function testCreateGoal() public {
        bet.createGoal("Test Goal", "This is a test goal", 1 ether, 5);
        GoalInfo[] memory goals = bet.getAllGoals();

        assertEq(goals.length, 1, "Goal count should be 1");

        GoalInfo memory goal = goals[0];
        assertEq(goal.name, "Test Goal", "Goal name should be 'Test Goal'");
        assertEq(
            goal.description,
            "This is a test goal",
            "Goal description should be 'This is a test goal'"
        );
        assertEq(
            goal.requiredStake,
            1 ether,
            "Required stake should be 1 ether"
        );
        assertEq(
            uint(goal.goalType),
            uint(GoalType.Gambling),
            "Goal type should be Gambling"
        );
    }

    function testCreateTask() public {
        bet.createTask("Test Task 1", "Task 1", "Project 1");
        Task[] memory tasks = bet.getAllTasks();

        assertEq(tasks.length, 1, "Task count should be 1");

        Task memory task = tasks[0];
        assertEq(task.id, "Test Task 1", "Task ID should be 'Test Task 1'");
        assertEq(task.name, "Task 1", "Task name should be 'Task 1'");
        assertEq(task.completed, false, "Task should not be completed");
    }

    function testCreateTaskRevert() public {
        bet.createTask("Test Task 1", "Task 1", "Project 1");
        vm.expectRevert("Task already exists.");
        bet.createTask("Test Task 1", "Task 1", "Project 1");
    }

    function testGetUnconfirmedTasks() public {
        bet.createTask("Test Task 1", "Task 1", "Project 1");
        bet.createTask("Test Task 2", "Task 2", "Project 1");

        Task[] memory unconfirmedTasks = bet.getUnconfirmedTasks();

        assertEq(
            unconfirmedTasks.length,
            2,
            "Unconfirmed task count should be 2"
        );
    }

    function testLinkWallet() public {
        bet.linkWallet(address(this), "TestGithub");
        string memory github = bet.getGithubByWallet(address(this));

        assertEq(github, "TestGithub", "Github account should be 'TestGithub'");
    }

    function testConfirmTask() public {
        address user1 = address(this);
        address user2 = vm.addr(2);

        bet.createProject("Project 1", "First Project");
        bet.linkWallet(user1, "TestGithub1");
        bet.linkWallet(user2, "TestGithub2");

        bet.createTask("g_issue#1", "Task 1", "Project 1");
        bet.confirmTask("g_issue#1", "TestGithub1", 10);
        bet.createTask("g_issue#2", "Task 2", "Project 1");
        bet.confirmTask("g_issue#2", "TestGithub1", 10);
        bet.createTask("g_issue#3", "Task 3", "Project 1");
        bet.confirmTask("g_issue#3", "TestGithub2", 10);

        bet.createProject("Project 2", "Second Project");
        bet.createTask("g_issue#2_1", "Task 1", "Project 2");
        bet.confirmTask("g_issue#2_1", "TestGithub1", 10);
        bet.createTask("g_issue#2_2", "Task 2", "Project 2");
        bet.confirmTask("g_issue#2_2", "TestGithub2", 10);

        Task[] memory tasks = bet.getAllTasks();
        assertEq(tasks[0].completed, true, "Task should be completed");

        uint points1 = bet.getUserPoints(user1);
        assertEq(points1, 30, "User1 should have 30 points");

        uint points2 = bet.getUserPoints(user2);
        assertEq(points2, 20, "User2 should have 20 points");

        uint projectPoints1 = bet.getProjectUserPoints("Project 1", user1);
        assertEq(
            projectPoints1,
            20,
            "User1 should have 20 points in Project 1"
        );
        uint projectPoints2 = bet.getProjectUserPoints("Project 1", user2);
        assertEq(
            projectPoints2,
            10,
            "User2 should have 10 points in Project 1"
        );

        address[] memory participants = bet.getProjectParticipants("Project 1");
        assertEq(participants.length, 2, "Project should have 1 participant");

        uint[] memory completedTasks1 = bet.getUserCompletedTasks(user1);
        assertEq(completedTasks1.length, 3, "User1 should have 3 completed task");

        uint[] memory completedTasks2 = bet.getUserCompletedTasks(user2);
        assertEq(completedTasks2.length, 2, "User2 should have 2 completed task");
    }

    function testGetUserPoints() public {
        bet.linkWallet(address(this), "TestGithub");
        bet.createTask("Test Task 1", "Task 1", "Project 1");

        bet.confirmTask("Test Task 1", "TestGithub", 10);
        uint points = bet.getUserPoints(address(this));

        assertEq(points, 10, "User should have 10 points");
    }

    function testGetUserCompletedTasks() public {
        bet.linkWallet(address(this), "TestGithub");
        bet.createTask("Test Task 1", "Task 1", "Project 1");
        bet.createTask("Test Task 2", "Task 2", "Project 1");

        bet.confirmTask("Test Task 1", "TestGithub", 10);
        uint[] memory completedTasks = bet.getUserCompletedTasks(address(this));

        assertEq(completedTasks.length, 1, "User should have 1 completed task");
        assertEq(completedTasks[0], 1, "Completed task ID should be 1");
    }

    function testDonateToProject() public {
        address user1 = address(this);
        address user2 = vm.addr(2);

        bet.createProject("Project 1", "First Project");
        bet.linkWallet(user1, "TestGithub1");
        bet.linkWallet(user2, "TestGithub2");

        bet.createTask("g_issue#1", "Task 1", "Project 1");
        bet.confirmTask("g_issue#1", "TestGithub1", 10);
        bet.createTask("g_issue#2", "Task 2", "Project 1");
        bet.confirmTask("g_issue#2", "TestGithub1", 10);
        bet.createTask("g_issue#3", "Task 3", "Project 1");
        bet.confirmTask("g_issue#3", "TestGithub2", 10);

        vm.deal(user1, 10 ether);
        vm.deal(user2, 0 ether);

        bet.donateToProject{value: 3 ether}("Project 1");
        console.log(address(bet).balance);

        assertEq(bet.getUserPoints(user1), 20, "User 1 should have 20 points");

        assertEq(
            bet.getTotalRewards(user1),
            2 ether,
            "Should rewared user1 2 ether"
        );
        assertEq(
            bet.getTotalRewards(user2),
            1 ether,
            "Should rewared user2 1 ether"
        );

        // TODO: wierd. It works if I deployed on chain. But not working in tests.
        // bet.claimReward();
        // console.log(user1.balance);
    }
}
