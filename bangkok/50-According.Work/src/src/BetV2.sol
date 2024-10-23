// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import "./Goal.sol";
import "./GoalType.sol";

contract Bet is Initializable, OwnableUpgradeable, UUPSUpgradeable {
    Goal[] private goals;
    Task[] private tasks;
    mapping(string => uint) private taskIndices;
    mapping(address => uint[]) private userGoals;
    mapping(address => string) private walletToGithub;
    mapping(string => address) private githubToWallet;
    mapping(address => uint) private userPoints;
    mapping(address => uint[]) private userCompletedTasks;
    mapping(string => uint) private subToTaskId;

    // reward related
    mapping(string => Project) private projects;
    string[] private projectIds;
    mapping(address => uint) private totalRewards; // Tracks total rewards accumulated by each user
    mapping(address => uint) private claimedRewards; // Tracks rewards already claimed by each user
    uint testVersion;

    event GoalCreated(
        uint id,
        string name,
        string description,
        uint requiredStake,
        uint taskCount,
        GoalType goalType,
        address creator
    );
    event TaskCreated(string id, string sub);
    event GoalUnlocked(uint id, address user, uint stakeAmount);
    event GoalTaskConfirmed(uint id, address user, uint taskIndex);
    event TaskConfirmed(string id, address user, string taskName);
    event StakeClaimed(uint id, address user, uint stakeAmount);
    event GoalSettled(uint id);
    event WalletLinked(address wallet, string githubId);
    event ProjectCreated(string projectId, string name);
    event RewardClaimed(address user, uint reward);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override onlyOwner {}

    function createGoalSolo(
        string memory _name,
        string memory _description,
        uint _requiredStake,
        uint _taskCount
    ) public {
        _createGoal(
            _name,
            _description,
            _requiredStake,
            _taskCount,
            GoalType.Solo
        );
    }

    function createGoal(
        string memory _name,
        string memory _description,
        uint _requiredStake,
        uint _taskCount
    ) public {
        _createGoal(
            _name,
            _description,
            _requiredStake,
            _taskCount,
            GoalType.Gambling
        );
    }

    function _createGoal(
        string memory _name,
        string memory _description,
        uint _requiredStake,
        uint _taskCount,
        GoalType _goalType
    ) public {
        uint goalId = goals.length;
        Goal storage newGoal = goals.push();
        newGoal.id = goalId;
        newGoal.name = _name;
        newGoal.description = _description;
        newGoal.requiredStake = _requiredStake;
        newGoal.creator = msg.sender;
        newGoal.taskCount = _taskCount;
        newGoal.goalType = _goalType;
        newGoal.completed = false;

        emit GoalCreated(
            goalId,
            _name,
            _description,
            _requiredStake,
            _taskCount,
            _goalType,
            msg.sender
        );
    }

    event DebugLog(uint msgValue, uint requiredStake);

    function stakeAndUnlockGoal(uint _goalId) public payable {
        require(_goalId < goals.length, "Goal does not exist.");
        Goal storage goal = goals[_goalId];
        emit DebugLog(msg.value, goal.requiredStake);

        require(msg.value == goal.requiredStake, "Incorrect stake amount.");
        require(
            !goal.isParticipant[msg.sender],
            "Already participated in this goal."
        );

        goal.participants.push(msg.sender);
        goal.isParticipant[msg.sender] = true;
        userGoals[msg.sender].push(_goalId);

        emit GoalUnlocked(_goalId, msg.sender, msg.value);
    }

    function confirmTaskCompletion(uint _goalId, address _user) public {
        require(_goalId < goals.length, "Goal does not exist.");
        Goal storage goal = goals[_goalId];
        require(
            msg.sender == goal.creator,
            "Only goal creator can confirm task completion."
        );
        require(
            goal.isParticipant[_user],
            "User is not a participant of this goal."
        );
        require(
            goal.completedTaskCount[_user] < goal.taskCount,
            "All tasks already confirmed."
        );

        goal.completedTaskCount[_user] += 1;

        emit GoalTaskConfirmed(_goalId, _user, goal.completedTaskCount[_user]);
    }

    function claimStake(uint _goalId) public {
        require(_goalId < goals.length, "Goal does not exist.");
        Goal storage goal = goals[_goalId];
        require(
            goal.isParticipant[msg.sender],
            "Not a participant of this goal."
        );
        require(!goal.isClaimed[msg.sender], "Stake already claimed.");

        uint reward;
        if (goal.goalType == GoalType.Solo) {
            reward =
                (goal.requiredStake * goal.completedTaskCount[msg.sender]) /
                goal.taskCount;
        } else {
            reward = goal.rewards[msg.sender];
        }

        require(reward > 0, "No reward to claim.");

        payable(msg.sender).transfer(reward);
        goal.isClaimed[msg.sender] = true;

        emit StakeClaimed(_goalId, msg.sender, reward);
    }

    function settleGoal(uint _goalId) public {
        // only goal creator or contract owner can settle the goal
        require(
            msg.sender == goals[_goalId].creator || msg.sender == owner(),
            "Only goal creator or contract owner can settle the goal."
        );

        require(_goalId < goals.length, "Goal does not exist.");
        Goal storage goal = goals[_goalId];
        require(goal.goalType == GoalType.Gambling, "Not a gambling goal");

        uint totalStake = 0;
        uint totalCompletedTasks = 0;
        uint totalParticipants = goal.participants.length;
        // TODO: make sure the minimum fee can cover our cost.
        uint fee = (totalParticipants * goal.requiredStake) / 100;

        for (uint i = 0; i < totalParticipants; i++) {
            address participant = goal.participants[i];
            totalStake += goal.requiredStake;
            totalCompletedTasks += goal.completedTaskCount[participant];
        }

        require(
            totalStake > fee,
            "No stakes to distribute after fee deduction"
        );
        totalStake -= fee;

        for (uint i = 0; i < totalParticipants; i++) {
            address participant = goal.participants[i];
            uint userCompletedTaskCount = goal.completedTaskCount[participant];
            if (userCompletedTaskCount > 0) {
                uint reward = (totalStake * userCompletedTaskCount) /
                    totalCompletedTasks;
                goal.rewards[participant] = reward;
            }
        }

        goal.completed = true;
        emit GoalSettled(_goalId);
    }

    function getAllGoals() public view returns (GoalInfo[] memory) {
        GoalInfo[] memory goalInfos = new GoalInfo[](goals.length);
        for (uint i = 0; i < goals.length; i++) {
            Goal storage goal = goals[i];
            goalInfos[i] = GoalInfo(
                goal.id,
                goal.name,
                goal.description,
                goal.requiredStake,
                goal.creator,
                goal.completed,
                goal.participants,
                goal.goalType
            );
        }
        return goalInfos;
    }

    function getUserGoals(address _user) public view returns (uint[] memory) {
        return userGoals[_user];
    }

    function getGoalDetails(
        uint _goalId
    ) public view returns (GoalInfo memory) {
        require(_goalId < goals.length, "Goal does not exist.");
        Goal storage goal = goals[_goalId];
        return
            GoalInfo(
                goal.id,
                goal.name,
                goal.description,
                goal.requiredStake,
                goal.creator,
                goal.completed,
                goal.participants,
                goal.goalType
            );
    }

    // TODO: 分页
    function getAllTasks() public view returns (Task[] memory) {
        return tasks;
    }

    function getUnconfirmedTasks() public view returns (Task[] memory) {
        uint count = 0;
        for (uint i = 0; i < tasks.length; i++) {
            if (!tasks[i].completed) {
                count++;
            }
        }

        Task[] memory unconfirmedTasks = new Task[](count);
        uint index = 0;
        for (uint i = 0; i < tasks.length; i++) {
            if (!tasks[i].completed) {
                unconfirmedTasks[index] = tasks[i];
                index++;
            }
        }

        return unconfirmedTasks;
    }

    function createProject(
        string memory _projectId,
        string memory _name
    ) public onlyOwner {
        require(bytes(_projectId).length > 0, "Project ID cannot be empty.");
        require(
            bytes(projects[_projectId].id).length == 0,
            "Project already exists."
        );

        Project storage newProject = projects[_projectId];
        newProject.id = _projectId;
        projectIds.push(_projectId);

        emit ProjectCreated(_projectId, _name);
    }

    function createTask(
        string memory _id,
        string memory _name,
        string memory projectId
    ) public {
        require(bytes(_id).length > 0, "Task ID cannot be empty.");

        // Check if the project exists, if not, create it
        if (bytes(projects[projectId].id).length == 0) {
            createProject(projectId, projectId);
        }

        // Ensure the task doesn't already exist
        if (taskIndices[_id] != 0) {
            revert("Task already exists.");
        }

        // Add the task to the array and map its ID to the index
        tasks.push(
            Task({
                id: _id,
                name: _name,
                completed: false,
                projectId: projectId,
                taskCompleter: address(0)
            })
        );

        // Store the index (length - 1) + 1 to avoid using index 0 as a valid task index
        taskIndices[_id] = tasks.length;

        emit TaskCreated(_id, _name);
    }

    function linkWallet(address wallet, string memory github) public onlyOwner {
        require(
            keccak256(abi.encodePacked(walletToGithub[wallet])) ==
                keccak256(abi.encodePacked("")),
            "Wallet already linked to a Github account."
        );

        walletToGithub[wallet] = github;
        githubToWallet[github] = wallet;

        emit WalletLinked(wallet, github);
    }

    function confirmTask(
        string memory _taskId,
        string memory github,
        uint taskPoints
    ) public {
        uint taskIndex = taskIndices[_taskId];
        require(taskIndex != 0, "Task does not exist."); // taskIndex is 1-based, 0 means non-existent

        Task storage task = tasks[taskIndex - 1]; // Adjust index to match array (1-based to 0-based)
        address userAddress = githubToWallet[github];
        require(
            userAddress != address(0),
            "GitHub account not linked to a wallet."
        );
        require(!task.completed, "Task already confirmed.");

        task.completed = true;
        task.taskCompleter = userAddress;
        userCompletedTasks[userAddress].push(taskIndex);

        // Update user points for both global and project-specific records
        userPoints[userAddress] += taskPoints;
        Project storage project = projects[task.projectId];

        // Check if the user is already a participant in the project
        bool isParticipant = false;
        if (project.userPoints[userAddress] > 0) {
            isParticipant = true;
        }
        // Add to participants if not already included
        if (!isParticipant) {
            project.participants.push(userAddress);
        }

        project.userPoints[userAddress] += taskPoints;

        emit TaskConfirmed(_taskId, userAddress, task.name);
    }

    function donateToProject(string memory projectId) public payable {
        Project storage project = projects[projectId];
        require(bytes(project.id).length != 0, "Project does not exist.");

        uint totalProjectPoints = 0;

        // Calculate total points
        for (uint i = 0; i < project.participants.length; i++) {
            address participant = project.participants[i];
            totalProjectPoints += project.userPoints[participant];
        }

        // If no contribution at all, just donate to YouBet Wallet.
        if (totalProjectPoints > 0) {
            // Distribute donation based on userPoints
            for (uint i = 0; i < project.participants.length; i++) {
                address participant = project.participants[i];
                uint userShare = (project.userPoints[participant] * msg.value) /
                    totalProjectPoints;
                totalRewards[participant] += userShare;
            }
        }
    }

    function getAllProjectIds() public view returns (string[] memory) {
        return projectIds;
    }

    function getProjectParticipants(
        string memory projectId
    ) public view returns (address[] memory) {
        return projects[projectId].participants;
    }

    function getProjectUserPoints(
        string memory projectId,
        address user
    ) public view returns (uint) {
        return projects[projectId].userPoints[user];
    }

    function claimReward() public {
        uint reward = totalRewards[msg.sender] - claimedRewards[msg.sender];
        require(reward > 0, "No rewards to claim.");

        claimedRewards[msg.sender] += reward;

        // Transfer the reward to the user
        payable(msg.sender).transfer(reward);

        emit RewardClaimed(msg.sender, reward);
    }

    function getTotalRewards(address user) public view returns (uint) {
        return totalRewards[user];
    }

    function getClaimedRewards(address user) public view returns (uint) {
        return claimedRewards[user];
    }

    function getUserPoints(address _user) public view returns (uint) {
        return userPoints[_user];
    }

    function getUserCompletedTasks(
        address _user
    ) public view returns (uint[] memory) {
        return userCompletedTasks[_user];
    }

    function getGithubByWallet(
        address _wallet
    ) public view returns (string memory) {
        return walletToGithub[_wallet];
    }

    function getWalletByGithub(
        string memory github
    ) public view returns (address) {
        return githubToWallet[github];
    }
}
