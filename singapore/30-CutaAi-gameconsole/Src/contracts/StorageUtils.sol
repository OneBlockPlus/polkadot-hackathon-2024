// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "./ZeroCopySource.sol";
import "./ZeroCopySink.sol";
import "./KeyUtils.sol";
import "./IterableMapping.sol";
import "./DidUtils.sol";
import "./BytesUtils.sol";

library StorageUtils {
    using IterableMapping for IterableMapping.itmap;

    // represent public key in did document
    struct PublicKey {
        string id; // public key id
        string keyType; // public key type, in ethereum
        string[] controller; // did array, has some permission
        bytes pubKeyData; // public key or address bytes
        //        address ethAddr; // ethereum address, refer: https://www.w3.org/TR/did-spec-registries/#ethereumaddress
        bool deactivated; // is deactivated or not
        bool isPubKey; // existed in public key list or not
        //        bool isAuth; // existed in authentication list or not
        uint authIndex; // index at authentication list, 0 means no auth
    }

    function genPublicKeyFromDID(string memory did, string memory keyType) public pure returns (PublicKey memory){
        address didAddr = DidUtils.parseAddrFromDID(bytes(did));
        bytes memory id = abi.encodePacked(did, "#keys-1");
        string[] memory controller = new string[](1);
        controller[0] = did;
        return PublicKey(string(id), keyType, controller, abi.encodePacked(didAddr), false, true, 1);
    }

    function serializePubKey(PublicKey memory publicKey) public pure returns (bytes memory){
        bytes memory idBytes = ZeroCopySink.WriteVarBytes(bytes(publicKey.id));
        bytes memory keyTypeBytes = ZeroCopySink.WriteVarBytes(bytes(publicKey.keyType));
        bytes memory controllerLenBytes = ZeroCopySink.WriteUint255(publicKey.controller.length);
        bytes memory controllerBytes = new bytes(0);
        for (uint i = 0; i < publicKey.controller.length; i++) {
            controllerBytes = abi.encodePacked(controllerBytes,
                ZeroCopySink.WriteVarBytes(bytes(publicKey.controller[i])));
        }
        bytes memory pubKeyBytes = ZeroCopySink.WriteVarBytes(publicKey.pubKeyData);
        //        bytes memory ethAddrBytes = ZeroCopySink.WriteUint255(uint256(publicKey.ethAddr));
        bytes memory deactivatedBytes = ZeroCopySink.WriteBool(publicKey.deactivated);
        bytes memory isPubKeyBytes = ZeroCopySink.WriteBool(publicKey.isPubKey);
        //        bytes memory isAuthKeyBytes = ZeroCopySink.WriteBool(publicKey.isAuth);
        bytes memory authIndexBytes = ZeroCopySink.WriteUint255(publicKey.authIndex);
        // split result into two phase in case of too deep stack slots compiler error
        bytes memory result = abi.encodePacked(idBytes, keyTypeBytes, controllerLenBytes, controllerBytes, pubKeyBytes);
        return abi.encodePacked(result, deactivatedBytes, isPubKeyBytes, authIndexBytes);
    }

    function deserializePubKey(bytes memory data) public pure returns (PublicKey memory){
        (bytes memory id, uint offset) = ZeroCopySource.NextVarBytes(data, 0);
        bytes memory keyType;
        (keyType, offset) = ZeroCopySource.NextVarBytes(data, offset);
        uint controllerLen;
        (controllerLen, offset) = ZeroCopySource.NextUint255(data, offset);
        string[]memory controller = new string[](controllerLen);
        for (uint i = 0; i < controllerLen; i++) {
            bytes memory ctrl;
            (ctrl, offset) = ZeroCopySource.NextVarBytes(data, offset);
            controller[i] = string(ctrl);
        }
        bytes memory pubKey;
        (pubKey, offset) = ZeroCopySource.NextVarBytes(data, offset);
        //        uint256 ethAddr;
        //        (ethAddr, offset) = ZeroCopySource.NextUint255(data, offset);
        bool deactivated;
        bool isPubKey;
        //        bool isAuth;
        (deactivated, offset) = ZeroCopySource.NextBool(data, offset);
        (isPubKey, offset) = ZeroCopySource.NextBool(data, offset);
        //        (isAuth, offset) = ZeroCopySource.NextBool(data, offset);
        uint authIndex;
        (authIndex, offset) = ZeroCopySource.NextUint255(data, offset);
        return PublicKey(string(id), string(keyType), controller, pubKey,
            deactivated, isPubKey, authIndex);
    }

    /**
   * @dev query public key list
   * @param pubKeyList public key list
   */
    function getAllPubKey(string memory did, string memory typeOfDefaultKey, IterableMapping.itmap storage pubKeyList)
    public view returns (PublicKey[] memory) {
        // first loop to calculate dynamic array size
        uint validKeySize = 0;
        PublicKey[] memory allKey = new PublicKey[](pubKeyList.size);
        uint count = 0;
        for (
            uint i = pubKeyList.iterate_start();
            pubKeyList.iterate_valid(i);
            i = pubKeyList.iterate_next(i)
        ) {
            (, bytes memory pubKeyData) = pubKeyList.iterate_get(i);
            allKey[count] = deserializePubKey(pubKeyData);
            if (!allKey[count].deactivated && allKey[count].isPubKey) {
                validKeySize++;
            }
            count++;
        }
        // second loop to filter result
        PublicKey[] memory result = new PublicKey[](validKeySize + 1);
        result[0] = genPublicKeyFromDID(did, typeOfDefaultKey);
        count = 1;
        for (uint i = 0; i < allKey.length; i++) {
            if (!allKey[i].deactivated && allKey[i].isPubKey) {
                result[count] = allKey[i];
                count++;
            }
        }
        return result;
    }

    /**
   * @dev query authentication list
   * @param pubKeyList public key list
   */
    function getAllAuthKey(string memory did, string memory typeOfDefaultKey, IterableMapping.itmap storage pubKeyList)
    public view returns (PublicKey[] memory) {
        // first loop to calculate dynamic array size
        uint authKeySize = 0;
        PublicKey[] memory allKey = new PublicKey[](pubKeyList.size);
        uint count = 0;
        for (
            uint i = pubKeyList.iterate_start();
            pubKeyList.iterate_valid(i);
            i = pubKeyList.iterate_next(i)
        ) {
            (, bytes memory pubKeyData) = pubKeyList.iterate_get(i);
            allKey[count] = deserializePubKey(pubKeyData);
            if (!allKey[count].deactivated && allKey[count].authIndex > 0) {
                authKeySize++;
            }
            count++;
        }
        for (uint i = 0; i < allKey.length; i++) {
            for (uint j = i + 1; j < allKey.length; j++) {
                if (allKey[i].authIndex > allKey[j].authIndex) {
                    PublicKey memory temp = allKey[i];
                    allKey[i] = allKey[j];
                    allKey[j] = temp;
                }
            }
        }
        // copy allKey to result
        PublicKey[] memory result = new PublicKey[](authKeySize + 1);
        result[0] = genPublicKeyFromDID(did, typeOfDefaultKey);
        for (uint i = 0; i < authKeySize; i++) {
            result[i + 1] = allKey[count - authKeySize + i];
        }
        return result;
    }

    function insertNewPubKey(IterableMapping.itmap storage pubKeyList, PublicKey memory pub)
    public {
        bytes32 pubKeyListSecondKey = KeyUtils.genPubKeyListSecondKey(pub.pubKeyData);
        bytes memory encodedPubKey = serializePubKey(pub);
        bool replaced = pubKeyList.insert(pubKeyListSecondKey, encodedPubKey);
        require(!replaced, "key existed");
    }

    function authPubKey(IterableMapping.itmap storage pubKeyList, bytes memory pubKey, uint authIndex)
    public {
        bytes32 pubKeyListSecondKey = KeyUtils.genPubKeyListSecondKey(pubKey);
        bytes memory pubKeyData = pubKeyList.data[pubKeyListSecondKey].value;
        require(pubKeyData.length > 0, "key not exist");
        PublicKey memory key = deserializePubKey(pubKeyData);
        require(!key.deactivated, "key deactivated");
        require(key.authIndex == 0, "key authenticated");
        //        key.isAuth = true;
        key.authIndex = authIndex;
        bytes memory encodedPubKey = serializePubKey(key);
        pubKeyList.insert(pubKeyListSecondKey, encodedPubKey);
    }

    function deactivatePubKey(IterableMapping.itmap storage pubKeyList, bytes memory pubKey)
    public {
        bytes32 pubKeyListSecondKey = KeyUtils.genPubKeyListSecondKey(pubKey);
        bytes memory pubKeyData = pubKeyList.data[pubKeyListSecondKey].value;
        require(pubKeyData.length > 0, "key not exist");
        PublicKey memory key = deserializePubKey(pubKeyData);
        require(!key.deactivated, "key deactivated");
        key.isPubKey = false;
        key.deactivated = true;
        key.authIndex = 0;
        bytes memory encodedPubKey = serializePubKey(key);
        pubKeyList.insert(pubKeyListSecondKey, encodedPubKey);
    }

    function deAuthPubKey(IterableMapping.itmap storage pubKeyList, bytes memory pubKey)
    public {
        bytes32 pubKeyListSecondKey = KeyUtils.genPubKeyListSecondKey(pubKey);
        bytes memory pubKeyData = pubKeyList.data[pubKeyListSecondKey].value;
        require(pubKeyData.length > 0, "key not exist");
        PublicKey memory key = deserializePubKey(pubKeyData);
        require(!key.deactivated, "key deactivated");
        require(key.authIndex > 0, "key unauthenticated");
        key.authIndex = 0;
        bytes memory encodedPubKey = serializePubKey(key);
        pubKeyList.insert(pubKeyListSecondKey, encodedPubKey);
    }
    /**
   * @dev query context list
   * @param ctxList context list
   */
    function getContext(IterableMapping.itmap storage ctxList, string memory defaultCtx) public view returns (string[] memory) {
        string[] memory result = new string[](ctxList.size + 1);
        // add default context
        result[0] = defaultCtx;
        uint count = 1;
        for (
            uint i = ctxList.iterate_start();
            ctxList.iterate_valid(i);
            i = ctxList.iterate_next(i)
        ) {
            (, bytes memory ctx) = ctxList.iterate_get(i);
            result[count] = string(ctx);
            count++;
        }
        return result;
    }

    /**
    * @dev query controller list
    * @param controllerList controller list
    */
    function getAllController(IterableMapping.itmap storage controllerList)
    public view returns (string[] memory){
        string[] memory result = new string[](controllerList.size);
        uint count = 0;
        for (
            uint i = controllerList.iterate_start();
            controllerList.iterate_valid(i);
            i = controllerList.iterate_next(i)
        ) {
            (, bytes memory ctx) = controllerList.iterate_get(i);
            result[count] = string(ctx);
            count++;
        }
        return result;
    }

    /**
    * @dev query service list
    * @param serviceList service list
    */
    function getAllService(IterableMapping.itmap storage serviceList)
    public view returns (Service[] memory){
        Service[] memory result = new Service[](serviceList.size);
        uint count = 0;
        for (
            uint i = serviceList.iterate_start();
            serviceList.iterate_valid(i);
            i = serviceList.iterate_next(i)
        ) {
            (, bytes memory serviceData) = serviceList.iterate_get(i);
            result[count] = deserializeService(serviceData);
            count++;
        }
        return result;
    }

    struct Service {
        string serviceId;
        string serviceType;
        string serviceEndpoint;
    }

    function serializeService(Service memory service) public pure returns (bytes memory){
        bytes memory idBytes = ZeroCopySink.WriteVarBytes(bytes(service.serviceId));
        bytes memory typeBytes = ZeroCopySink.WriteVarBytes(bytes(service.serviceType));
        bytes memory endpointBytes = ZeroCopySink.WriteVarBytes(bytes(service.serviceEndpoint));
        bytes memory serviceBytes = abi.encodePacked(idBytes, typeBytes, endpointBytes);
        return serviceBytes;
    }

    function deserializeService(bytes memory serviceBytes) public pure returns (Service memory){
        (bytes memory id, uint offset) = ZeroCopySource.NextVarBytes(serviceBytes, 0);
        bytes memory serviceType = new bytes(0);
        (serviceType, offset) = ZeroCopySource.NextVarBytes(serviceBytes, offset);
        bytes memory endpoint = new bytes(0);
        (endpoint, offset) = ZeroCopySource.NextVarBytes(serviceBytes, offset);
        return Service(string(id), string(serviceType), string(endpoint));
    }

    struct DIDDocument {
        string[] context;
        string id;
        PublicKey[] publicKey;
        PublicKey[] authentication;
        string[] controller;
        Service[] service;
        uint updated;
    }
}
