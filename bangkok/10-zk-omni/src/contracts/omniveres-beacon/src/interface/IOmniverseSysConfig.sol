// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

/**
 * @notice Interface of Omniverse system config
 */
interface IOmniverseSysConfig {
    /**
     * @notice Gas cost per Omniverse transaction
     */
    function gasFee() external view returns (uint128);

    /**
     * @notice The Omniverse account which will receive gas fee
     */
    function gasRecipient() external view returns (bytes32);

    /**
     * @notice The Omniverse gas token asset id
     */
    function gasAssetId() external view returns (bytes32);

    /**
     * @notice The max UTXO number allowed in an Omniverse transaction, including alls inputs and outputs
     */
    function maxUTXONumber() external view returns (uint256);

    /**
     * @notice Decimals of Omniverse assets
     */
    function decimals() external view returns (uint8);

    /**
     * @notice The up limit of Omniverse token name deployed
     */
    function tokenNameLimit() external view returns (uint8);

    /**
     * @notice Retruns all system config information
     */
    function getSystemConfig()
        external
        view
        returns (bytes32, bytes32, uint128, uint, uint8, uint128);
}
