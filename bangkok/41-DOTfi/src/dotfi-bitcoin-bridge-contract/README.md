
# BridgeFactory and BridgeToken Contracts

These contracts are designed for the **BridgeFactory** and **BridgeToken** systems, enabling the deployment and management of ERC20 tokens within a decentralized bridge system. Below is an outline of the key methods and their functionalities.

## BridgeFactory Contract

### Key Methods

1.  **constructor(address _admin)**:
    
    -   **Purpose**: Initializes the contract, setting the admin who is granted the `ADMIN_ROLE`.
2.  **setContractDeployer(address deployer)**:
    
    -   **Purpose**: Allows the admin to grant the `CONTRACT_DEPLOYER_ROLE` to a specified address. This role is necessary to deploy new tokens.
3.  **authorizeAddress(address tokenAddress, address authorizedAddress, bool authorized)**:
    
    -   **Purpose**: Allows the admin to authorize or deauthorize specific addresses for transferring a particular token from the bridge.
    -   **Event**: Emits an `AddressAuthorized` event when an address is authorized or deauthorized.
4.  **deployToken(string memory name, string memory symbol, uint8 decimals, uint256 maxSupply)**:
    
    -   **Purpose**: Allows a contract deployer to create a new ERC20 token with the specified parameters (name, symbol, decimals, and maxSupply). The entire max supply is minted to the bridge contract.
    -   **Returns**: The address of the deployed token.
    -   **Event**: Emits a `TokenDeployed` event when a new token is deployed.
5.  **transferTokenFromBridge(address token, address to, uint256 amount)**:
    
    -   **Purpose**: Allows authorized addresses to transfer tokens from the bridge to a recipient. This ensures that only approved addresses can initiate transfers.
    -   **Requirement**: The caller must be authorized for the specified token.
6.  **getDeployedTokens()**:
    
    -   **Purpose**: Returns the number of deployed tokens.

### Key Contract Variables

-   **ADMIN_ROLE**: Grants admin privileges, such as authorizing addresses and setting contract deployers.
-   **CONTRACT_DEPLOYER_ROLE**: Grants permission to deploy new ERC20 tokens.
-   **authorizedAddresses**: A mapping that stores whether an address is authorized to transfer specific tokens from the bridge.
-   **deployedTokens**: An array that tracks all tokens deployed by the bridge.

## BridgeToken Contract

### Key Methods

1.  **constructor(string memory name, string memory symbol, uint8 decimals, uint256 maxSupply, address bridgeContract)**:
    -   **Purpose**: Deploys a new ERC20 token with the specified name, symbol, and decimals. The total supply is minted to the bridge contract.

### Inherited Functionality from ERC20 and ERC20Burnable

-   **_mint(address to, uint256 amount)**: Mints the specified amount of tokens to the provided address.
-   **burn(uint256 amount)**: Allows token holders to burn (destroy) their tokens.
-   **burnFrom(address account, uint256 amount)**: Burns tokens on behalf of another account if the caller has the appropriate allowance.

## Events

-   **TokenDeployed**: Emitted when a new token is deployed through the `deployToken` function.
-   **AddressAuthorized**: Emitted when an address is authorized or deauthorized for transferring tokens.