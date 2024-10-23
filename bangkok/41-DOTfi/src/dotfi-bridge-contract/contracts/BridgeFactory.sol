// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

contract BridgeFactory is AccessControl {
    bytes32 public constant CONTRACT_DEPLOYER_ROLE = keccak256("CONTRACT_DEPLOYER_ROLE");
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");

    address[] public deployedTokens;
    mapping(address => mapping(address => bool)) public authorizedAddresses;
    address public admin;

    event TokenDeployed(address indexed tokenAddress, string name, string symbol, uint256 maxSupply);
    event AddressAuthorized(address indexed tokenAddress, address indexed authorizedAddress, bool authorized);

    constructor(address _admin) {
        admin = _admin;
        _grantRole(ADMIN_ROLE, _admin);
    }

    modifier onlyAdmin() {
        require(hasRole(ADMIN_ROLE, msg.sender), "Not authorized");
        _;
    }

    modifier onlyContractDeployer() {
        require(hasRole(CONTRACT_DEPLOYER_ROLE, msg.sender), "Not a contract deployer");
        _;
    }

    function setContractDeployer(address deployer) external onlyAdmin {
        _grantRole(CONTRACT_DEPLOYER_ROLE, deployer);
    }

    function authorizeAddress(address tokenAddress, address authorizedAddress, bool authorized) external onlyAdmin {
        authorizedAddresses[tokenAddress][authorizedAddress] = authorized;
        emit AddressAuthorized(tokenAddress, authorizedAddress, authorized);
    }

    function deployToken(
        string memory name, 
        string memory symbol, 
        uint8 decimals, 
        uint256 maxSupply
    ) external onlyContractDeployer returns (address) {
        BridgeToken newToken = new BridgeToken(name, symbol, decimals, maxSupply, address(this));
        deployedTokens.push(address(newToken));
        emit TokenDeployed(address(newToken), name, symbol, maxSupply);
        return address(newToken);
    }

    function transferTokenFromBridge(
        address token,
        address to,
        uint256 amount
    ) external {
        require(authorizedAddresses[token][msg.sender], "Not authorized to transfer this token");
        ERC20(token).transfer(to, amount);
    }

    function getDeployedTokens() external view returns (uint256) {
        return deployedTokens.length;
    }
}

contract BridgeToken is ERC20, ERC20Burnable {
    constructor(
        string memory name,
        string memory symbol,
        uint8 decimals,
        uint256 maxSupply,
        address bridgeContract
    ) ERC20(name, symbol) {
        _mint(bridgeContract, maxSupply * 10**uint256(decimals));
    }
}
