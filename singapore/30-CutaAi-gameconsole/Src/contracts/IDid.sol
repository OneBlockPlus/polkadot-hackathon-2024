// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;


// define the interface and event of Did in this interface
interface IDid {

    event Deactivate(string did);

    function deactivateID(string calldata did, bytes calldata singer) external;


    event AddKey(string did, bytes pubKey, string[] controller);

    function addKey(string calldata did, bytes calldata newPubKey, string[] calldata pubKeyController,
        bytes calldata singer) external;

    event AddAddr(string did, address addr, string[] controller);

    function addAddr(string calldata did, address addr, string[] calldata pubKeyController,
        bytes calldata singer) external;


    event DeactivateKey(string did, bytes pubKey);

    function deactivateKey(string calldata did, bytes calldata pubKey, bytes calldata singer) external;

    event DeactivateAddr(string did, address addr);

    function deactivateAddr(string calldata did, address addr, bytes calldata singer) external;


    event AddNewAuthKey(string did, bytes pubKey, string[] controller);

    function addNewAuthKey(string calldata did, bytes calldata pubKey, string[] calldata controller,
        bytes calldata singer) external;

    function addNewAuthKeyByController(string calldata did, bytes calldata pubKey, string[] calldata controller,
        string calldata controllerSigner, bytes calldata singer) external;

    event AddNewAuthAddr(string did, address addr, string[] controller);

    function addNewAuthAddr(string calldata did, address addr, string[] calldata controller,
        bytes calldata singer) external;

    function addNewAuthAddrByController(string calldata did, address addr, string[] calldata controller,
        string calldata controllerSigner, bytes calldata singer) external;


    event SetAuthKey(string did, bytes pubKey);

    function setAuthKey(string calldata did, bytes calldata pubKey, bytes calldata singer) external;

    function setAuthKeyByController(string calldata did, bytes calldata pubKey, string calldata controller,
        bytes calldata singer) external;

    event SetAuthAddr(string did, address addr);

    function setAuthAddr(string calldata did, address addr,
        bytes calldata singer) external;

    function setAuthAddrByController(string calldata did, address addr, string calldata controller,
        bytes calldata singer) external;


    event DeactivateAuthKey(string did, bytes pubKey);

    function deactivateAuthKey(string calldata did, bytes calldata pubKey, bytes calldata singer) external;

    function deactivateAuthKeyByController(string calldata did, bytes calldata pubKey, string calldata controller,
        bytes calldata singer) external;

    event DeactivateAuthAddr(string did, address addr);

    function deactivateAuthAddr(string calldata did, address addr, bytes calldata singer) external;

    function deactivateAuthAddrByController(string calldata did, address addr, string calldata controller,
        bytes calldata singer) external;


    event AddContext(string did, string context);

    function addContext(string calldata did, string[] calldata context, bytes calldata singer) external;


    event RemoveContext(string did, string context);

    function removeContext(string calldata did, string[] calldata context, bytes calldata singer) external;


    event AddService(string did, string serviceId, string serviceType, string serviceEndpoint);

    function addService(string calldata did, string calldata serviceId, string calldata serviceType,
        string calldata serviceEndpoint, bytes calldata singer) external;


    event UpdateService(string did, string serviceId, string serviceType, string serviceEndpoint);

    function updateService(string calldata did, string calldata serviceId, string calldata serviceType,
        string calldata serviceEndpoint, bytes calldata singer) external;


    event RemoveService(string did, string serviceId);

    function removeService(string calldata did, string calldata serviceId, bytes calldata singer) external;


    event AddController(string did, string controller);

    function addController(string calldata did, string calldata controller, bytes calldata singer) external;


    event RemoveController(string did, string controller);

    function removeController(string calldata did, string calldata controller, bytes calldata singer) external;
}