// SPDX-License-Identifier: LGPL-3.0-or-later
pragma solidity >=0.6.0 <0.7.0;
pragma experimental ABIEncoderV2;

import "./IDid.sol";
import "./MixinDidStorage.sol";
import "./DidUtils.sol";
import "./KeyUtils.sol";
import "./BytesUtils.sol";
import "./ZeroCopySink.sol";
import "./ZeroCopySource.sol";
import "./StorageUtils.sol";

/**
 * @title DIDContract
 * @dev This contract is did logic implementation
 */
contract DIDContractV2 is MixinDidStorage, IDid {

    constructor() public {

    }

    /**
   * @dev deactivate did, delete all document data of this did, but record did has been registered,
   *    it means this did cannot been registered in the future
   * @param did did
   * @param singer tx signer, could be public key or address
   */
    function deactivateID(string memory did, bytes memory singer)
    override public {
        did = checkWhenOperate(did, singer);
        // delete context
        delete data[KeyUtils.genContextKey(did)];
        // delete public key list
        delete data[KeyUtils.genPubKeyListKey(did)];
        // delete controller
        delete data[KeyUtils.genControllerKey(did)];
        // delete service
        delete data[KeyUtils.genServiceKey(did)];
        // delete update time
        delete data[KeyUtils.genUpdateTimeKey(did)];
        // update status
        didStatus[did].deactivated = true;
        didStatus[did].authListLen = 0;
        emit Deactivate(did);
    }

    /**
   * @dev add a new public key to did public key list only, the key doesn't enter authentication list
   * @param did did
   * @param newPubKey new public key
   * @param controller controller of newPubKey, they are some did
   * @param singer tx signer, could be public key or address
   */
    function addKey(string memory did, bytes memory newPubKey, string[] memory controller,
        bytes memory singer)
    override public {
        did = checkWhenAddKey(did, singer, controller);
        addNewPubKey(did, newPubKey, address(0), "EcdsaSecp256k1VerificationKey2019", controller, true, false);
        emit AddKey(did, newPubKey, controller);
    }

    /**
    * @dev add a new address to did public key list only, the key doesn't enter authentication list
    * @param did did
    * @param addr new address
    * @param controller controller of newPubKey, they are some did
   * @param singer tx signer, could be public key or address
    */
    function addAddr(string memory did, address addr, string[] memory controller, bytes memory singer)
    override public {
        did = checkWhenAddKey(did, singer, controller);
        addNewPubKey(did, new bytes(0), addr, "EcdsaSecp256k1RecoveryMethod2020", controller, true, false);
        emit AddAddr(did, addr, controller);
    }

    /**
   * @dev add a new public key to authentication list only, doesn't enter public key list
   * @param did did
   * @param pubKey the new public key
   * @param controller controller of newPubKey, they are some did
   * @param singer tx signer, could be public key or address
   */
    function addNewAuthKey(string memory did, bytes memory pubKey, string[] memory controller,
        bytes memory singer)
    override public {
        did = checkWhenAddKey(did, singer, controller);
        addNewPubKey(did, pubKey, address(0), "EcdsaSecp256k1VerificationKey2019", controller,
            false, true);
        emit AddNewAuthKey(did, pubKey, controller);
    }

    /**
   * @dev add a new address to authentication list only, doesn't enter public key list
   * @param did did
   * @param addr the new address
   * @param controller controller of newPubKey, they are some did
   * @param singer tx signer, could be public key or address
   */
    function addNewAuthAddr(string memory did, address addr, string[] memory controller,
        bytes memory singer)
    override public {
        did = checkWhenAddKey(did, singer, controller);
        addNewPubKey(did, new bytes(0), addr, "EcdsaSecp256k1RecoveryMethod2020", controller, false, true);
        emit AddNewAuthAddr(did, addr, controller);
    }

    /**
   * @dev controller add a new public key to authentication list only, doesn't enter public key list
   * @param did did
   * @param pubKey the new public key
   * @param controller controller of newPubKey, they are some did
   * @param controllerSigner tx signer should be one of did controller
   * @param singer tx signer, could be public key or address
   */
    function addNewAuthKeyByController(string memory did, bytes memory pubKey, string[] memory controller,
        string memory controllerSigner, bytes memory singer)
    override public {
        did = checkWhenAddKeyByController(did, singer, controllerSigner, controller);
        addNewPubKey(did, pubKey, address(0), "EcdsaSecp256k1VerificationKey2019", controller,
            false, true);
        emit AddNewAuthKey(did, pubKey, controller);
    }

    /**
   * @dev controller add a new address to authentication list only, doesn't enter public key list
   * @param did did
   * @param addr the new address
   * @param controller controller of newPubKey, they are some did
   * @param controllerSigner tx signer should be one of did controller
   * @param singer tx signer, could be public key or address
   */
    function addNewAuthAddrByController(string memory did, address addr, string[] memory controller,
        string memory controllerSigner, bytes memory singer)
    override public {
        did = checkWhenAddKeyByController(did, singer, controllerSigner, controller);
        addNewPubKey(did, new bytes(0), addr, "EcdsaSecp256k1RecoveryMethod2020", controller, false, true);
        emit AddNewAuthAddr(did, addr, controller);
    }

    function addNewPubKey(string memory did, bytes memory pubKey, address addr, string memory keyType,
        string[] memory controller, bool isPub, bool isAuth)
    internal {
        require(controller.length >= 1, "controller empty");
        IterableMapping.itmap storage pubKeyList = data[KeyUtils.genPubKeyListKey(did)];
        uint keyIndex = pubKeyList.keys.length + 2;
        string memory pubKeyId = string(abi.encodePacked(did, "#keys-", BytesUtils.uint2str(keyIndex)));
        bytes memory pubKeyData = encodePubKeyAndAddr(pubKey, addr);
        StorageUtils.PublicKey memory pub = StorageUtils.PublicKey(pubKeyId, keyType, controller, pubKeyData,
            false, isPub, isAuth ? fetchAuthIndex(did) : 0);
        StorageUtils.insertNewPubKey(pubKeyList, pub);
        updateTime(did);
    }

    /**
   * @dev add one key existed in publicKey list to authentication list
   * @param did did
   * @param pubKey public key
   * @param singer tx signer, could be public key or address
   */
    function setAuthKey(string memory did, bytes memory pubKey, bytes memory singer)
    override public {
        did = checkWhenOperate(did, singer);
        authPubKey(did, pubKey, address(0));
        emit SetAuthKey(did, pubKey);
    }

    /**
   * @dev add one address existed in publicKey list to authentication list
   * @param did did
   * @param addr address
   * @param singer tx signer, could be public key or address
   */
    function setAuthAddr(string memory did, address addr, bytes memory singer)
    override public {
        did = checkWhenOperate(did, singer);
        authPubKey(did, new bytes(0), addr);
        emit SetAuthAddr(did, addr);
    }

    /**
   * @dev controller add one key existed in publicKey list to authentication list
   * @param did did
   * @param pubKey public key
   * @param controller one of did controller
   * @param singer tx signer, could be public key or address
   */
    function setAuthKeyByController(string memory did, bytes memory pubKey, string memory controller,
        bytes memory singer)
    override public {
        did = checkWhenOperateByController(did, controller, singer);
        authPubKey(did, pubKey, address(0));
        emit SetAuthKey(did, pubKey);
    }

    /**
   * @dev controller add one address existed in publicKey list to authentication list
   * @param did did
   * @param addr address
   * @param controller one of did controller
   * @param singer tx signer, could be public key or address
   */
    function setAuthAddrByController(string memory did, address addr, string memory controller,
        bytes memory singer)
    override public {
        did = checkWhenOperateByController(did, controller, singer);
        authPubKey(did, new bytes(0), addr);
        emit SetAuthAddr(did, addr);
    }

    function authPubKey(string memory did, bytes memory pubKey, address addr) internal {
        string memory pubKeyListKey = KeyUtils.genPubKeyListKey(did);
        StorageUtils.authPubKey(data[pubKeyListKey], encodePubKeyAndAddr(pubKey, addr), fetchAuthIndex(did));
        updateTime(did);
    }

    function fetchAuthIndex(string memory did) internal returns (uint){
        uint authIndex = didStatus[did].authListLen + 2;
        // this means each auth key index increased 2 every time
        didStatus[did].authListLen = authIndex;
        return authIndex;
    }

    /**
   * @dev deactivate one key that existed in public key list
   * @param did did
   * @param pubKey public key
   * @param singer tx signer, could be public key or address
   */
    function deactivateKey(string memory did, bytes memory pubKey, bytes memory singer)
    override public {
        did = checkWhenOperate(did, singer);
        deactivatePubKey(did, pubKey, address(0));
        emit DeactivateKey(did, pubKey);
    }

    /**
   * @dev deactivate one addr that existed in public key list
   * @param did did
   * @param addr address
   * @param singer tx signer, could be public key or address
   */
    function deactivateAddr(string memory did, address addr, bytes memory singer)
    override public {
        did = checkWhenOperate(did, singer);
        deactivatePubKey(did, new bytes(0), addr);
        emit DeactivateAddr(did, addr);
    }

    function deactivatePubKey(string memory did, bytes memory pubKey, address addr)
    internal {
        string memory pubKeyListKey = KeyUtils.genPubKeyListKey(did);
        StorageUtils.deactivatePubKey(data[pubKeyListKey], encodePubKeyAndAddr(pubKey, addr));
        updateTime(did);
    }

    /**
   * @dev remove one key from authentication list
   * @param did did
   * @param pubKey public key
   * @param singer tx signer, could be public key or address
   */
    function deactivateAuthKey(string memory did, bytes memory pubKey, bytes memory singer)
    override public {
        did = checkWhenOperate(did, singer);
        deAuthPubKey(did, pubKey, address(0));
        emit DeactivateAuthKey(did, pubKey);
    }

    /**
   * @dev remove one address from authentication list
   * @param did did
   * @param addr address
   * @param singer tx signer, could be public key or address
   */
    function deactivateAuthAddr(string memory did, address addr, bytes memory singer)
    override public {
        did = checkWhenOperate(did, singer);
        deAuthPubKey(did, new bytes(0), addr);
        emit DeactivateAuthAddr(did, addr);
    }

    /**
   * @dev controller remove one key from authentication list
   * @param did did
   * @param pubKey public key
   * @param controller one of did controller
   * @param singer tx signer, could be public key or address
   */
    function deactivateAuthKeyByController(string memory did, bytes memory pubKey, string memory controller,
        bytes memory singer)
    override public {
        did = checkWhenOperateByController(did, controller, singer);
        deAuthPubKey(did, pubKey, address(0));
        emit DeactivateAuthKey(did, pubKey);
    }

    /**
   * @dev controller remove one address from authentication list
   * @param did did
   * @param addr address
   * @param controller one of did controller
   * @param singer tx signer, could be public key or address
   */
    function deactivateAuthAddrByController(string memory did, address addr, string memory controller,
        bytes memory singer)
    override public {
        did = checkWhenOperateByController(did, controller, singer);
        deAuthPubKey(did, new bytes(0), addr);
        emit DeactivateAuthAddr(did, addr);
    }

    function deAuthPubKey(string memory did, bytes memory pubKey, address addr) internal {
        string memory pubKeyListKey = KeyUtils.genPubKeyListKey(did);
        StorageUtils.deAuthPubKey(data[pubKeyListKey], encodePubKeyAndAddr(pubKey, addr));
        updateTime(did);
    }

    function encodePubKeyAndAddr(bytes memory pubKey, address addr) internal pure returns (bytes memory){
        // pubKey may be empty, but pack it has no matter
        bytes memory pubKeyData = abi.encodePacked(pubKey);
        if (addr != address(0)) {
            pubKeyData = abi.encodePacked(pubKeyData, addr);
        }
        return pubKeyData;
    }

    /**
   * @dev add context to did document
   * @param did did
   * @param contexts contexts
   * @param singer tx signer, could be public key or address
   */
    function addContext(string memory did, string[] memory contexts, bytes memory singer)
    override public {
        did = checkWhenOperate(did, singer);
        string memory ctxKey = KeyUtils.genContextKey(did);
        for (uint i = 0; i < contexts.length; i++) {
            string memory ctx = contexts[i];
            bytes32 key = KeyUtils.genContextSecondKey(ctx);
            bool replaced = data[ctxKey].insert(key, bytes(ctx));
            if (!replaced) {
                emit AddContext(did, ctx);
            }
        }
        updateTime(did);
    }

    /**
   * @dev remove context from did document
   * @param did did
   * @param contexts contexts
   * @param singer tx signer, could be public key or address
   */
    function removeContext(string memory did, string[] memory contexts, bytes memory singer)
    override public {
        did = checkWhenOperate(did, singer);
        string memory ctxKey = KeyUtils.genContextKey(did);
        for (uint i = 0; i < contexts.length; i++) {
            string memory ctx = contexts[i];
            bytes32 key = KeyUtils.genContextSecondKey(ctx);
            bool success = data[ctxKey].remove(key);
            if (success) {
                emit RemoveContext(did, ctx);
            }
        }
        updateTime(did);
    }

    /**
   * @dev add one controller to did controller list
   * @param did did
   * @param controller one of did controller
   * @param singer tx signer, could be public key or address
   */
    function addController(string memory did, string memory controller, bytes memory singer)
    override public {
        did = checkWhenOperate(did, singer);
        string memory controllerKey = KeyUtils.genControllerKey(did);
        bytes32 key = KeyUtils.genControllerSecondKey(controller);
        bool replaced = data[controllerKey].insert(key, bytes(controller));
        require(!replaced, "controller existed");
        updateTime(did);
        emit AddController(did, controller);
    }

    /**
   * @dev remove controller from controller list
   * @param did did
   * @param controller one of did controller
   * @param singer tx signer, could be public key or address
   */
    function removeController(string memory did, string memory controller, bytes memory singer)
    override public {
        did = checkWhenOperate(did, singer);
        string memory controllerKey = KeyUtils.genControllerKey(did);
        bytes32 key = KeyUtils.genControllerSecondKey(controller);
        bool success = data[controllerKey].remove(key);
        require(success, "controller not exist");
        updateTime(did);
        emit RemoveController(did, controller);
    }

    /**
   * @dev add service to did service list
   * @param did did
   * @param serviceId service id
   * @param serviceType service type
   * @param serviceEndpoint service endpoint
   * @param singer tx signer, could be public key or address
   */
    function addService(string memory did, string memory serviceId, string memory serviceType,
        string memory serviceEndpoint, bytes memory singer)
    override public {
        did = checkWhenOperate(did, singer);
        string memory serviceKey = KeyUtils.genServiceKey(did);
        bytes32 key = KeyUtils.genServiceSecondKey(serviceId);
        StorageUtils.Service memory service = StorageUtils.Service(serviceId, serviceType, serviceEndpoint);
        bytes memory serviceBytes = StorageUtils.serializeService(service);
        bool replaced = data[serviceKey].insert(key, serviceBytes);
        require(!replaced, "service existed");
        updateTime(did);
        emit AddService(did, serviceId, serviceType, serviceEndpoint);
    }

    /**
   * @dev update service
   * @param did did
   * @param serviceId service id
   * @param serviceType service type
   * @param serviceEndpoint service endpoint
   * @param singer tx signer, could be public key or address
   */
    function updateService(string memory did, string memory serviceId, string memory serviceType,
        string memory serviceEndpoint, bytes memory singer)
    override public {
        did = checkWhenOperate(did, singer);
        string memory serviceKey = KeyUtils.genServiceKey(did);
        bytes32 key = KeyUtils.genServiceSecondKey(serviceId);
        StorageUtils.Service memory service = StorageUtils.Service(serviceId, serviceType, serviceEndpoint);
        bytes memory serviceBytes = StorageUtils.serializeService(service);
        bool replaced = data[serviceKey].insert(key, serviceBytes);
        require(replaced, "service not exist");
        updateTime(did);
        emit UpdateService(did, serviceId, serviceType, serviceEndpoint);
    }

    /**
   * @dev remove service
   * @param did did
   * @param serviceId service id
   * @param singer tx signer, could be public key or address
   */
    function removeService(string memory did, string memory serviceId, bytes memory singer)
    override public {
        did = checkWhenOperate(did, singer);
        string memory serviceKey = KeyUtils.genServiceKey(did);
        bytes32 key = KeyUtils.genServiceSecondKey(serviceId);
        bool success = data[serviceKey].remove(key);
        require(success, "service not exist");
        updateTime(did);
        emit RemoveService(did, serviceId);
    }

    function updateTime(string memory did) internal {
        string memory updateTimeKey = KeyUtils.genUpdateTimeKey(did);
        bytes32 key = KeyUtils.genUpdateTimeSecondKey();
        data[updateTimeKey].insert(key, ZeroCopySink.WriteUint255(now));
    }

    function checkWhenAddKey(string memory did, bytes memory singer, string[] memory keyController)
    internal view returns (string memory){
        for (uint i = 0; i < keyController.length; i++) {
            require(DidUtils.verifyDIDFormat(keyController[i]), "illegal controller");
        }
        return checkWhenOperate(did, singer);
    }

    function checkWhenAddKeyByController(string memory did, bytes memory singer,
        string memory sigController, string[] memory keyController)
    internal view returns (string memory){
        for (uint i = 0; i < keyController.length; i++) {
            require(DidUtils.verifyDIDFormat(keyController[i]), "illegal controller");
        }
        return checkWhenOperateByController(did, sigController, singer);
    }

    function checkWhenOperate(string memory did, bytes memory singer)
    internal view returns (string memory){
        (bool verified, string memory lowerDid) = verifyDIDSignature(did, singer);
        require(verified, "check sig failed");
        return lowerDid;
    }

    function checkWhenOperateByController(string memory did, string memory controller, bytes memory singer)
    internal view returns (string memory){
        (bool verified, string memory lowerDid) = verifyDIDController(did, controller, singer);
        require(verified, "check controller failed");
        return lowerDid;
    }

    /**
   * @dev verify tx has signed by did
   * @param did did
   * @param singer tx signer, could be public key or address
   */
    function verifySignature(string memory did, bytes memory singer)
    public view returns (bool)
    {
        (bool verified,) = verifyDIDSignature(did, singer);
        return verified;
    }

    function verifyDIDSignature(string memory did, bytes memory singer)
    internal view returns (bool, string memory)
    {
        did = BytesUtils.toLower(did);
        if (!DidUtils.verifyDIDFormat(did)) {
            return (false, did);
        }
        if (didStatus[did].deactivated) {
            return (false, did);
        }
        // if singer.length > 0, verify singer is listed in self public key list and authenticated
        // else verify msg.sender is did
        address didAddr = DidUtils.parseAddrFromDID(bytes(did));
        if (singer.length == 0) {
            return (didAddr == msg.sender || didAddr == tx.origin, did);
        } else {
            address signer;
            bytes32 pubKeyListSecondKey;
            if (singer.length == 20) {
                signer = BytesUtils.bytesToAddress(singer);
                pubKeyListSecondKey = KeyUtils.genPubKeyListSecondKey(encodePubKeyAndAddr(new bytes(0), signer));
            } else {
                signer = DidUtils.pubKeyToAddr(singer);
                pubKeyListSecondKey = KeyUtils.genPubKeyListSecondKey(encodePubKeyAndAddr(singer, address(0)));
            }
            if (signer != msg.sender && signer != tx.origin) {
                return (false, did);
            }
            // self sign
            if (signer == didAddr) {
                return (true, did);
            }
            string memory pubKeyListKey = KeyUtils.genPubKeyListKey(did);
            if (!data[pubKeyListKey].contains(pubKeyListSecondKey)) {
                return (false, did);
            }
            StorageUtils.PublicKey memory pub =
            StorageUtils.deserializePubKey(data[pubKeyListKey].data[pubKeyListSecondKey].value);
            if (pub.deactivated || pub.authIndex == 0) {
                return (false, did);
            }
            return (true, did);
        }
    }

    /**
   * @dev verify tx has signed by did controller
   * @param did did
   * @param controller one of did controller
   * @param singer tx signer, could be public key or address
   */
    function verifyController(string memory did, string memory controller, bytes memory singer)
    public view returns (bool){
        (bool verified,) = verifyDIDController(did, controller, singer);
        return verified;
    }

    function verifyDIDController(string memory did, string memory controller, bytes memory singer)
    internal view returns (bool, string memory){
        did = BytesUtils.toLower(did);
        if (!DidUtils.verifyDIDFormat(did)) {
            return (false, did);
        }
        if (didStatus[did].deactivated) {
            return (false, did);
        }
        string memory controllerKey = KeyUtils.genControllerKey(did);
        bytes32 key = KeyUtils.genControllerSecondKey(controller);
        if (!data[controllerKey].contains(key)) {
            return (false, did);
        }
        (bool verified,) = verifyDIDSignature(controller, singer);
        return (verified, did);
    }

    /**
   * @dev query public key list
   * @param did did
   */
    function getAllPubKey(string memory did)
    public view returns (StorageUtils.PublicKey[] memory) {
        did = BytesUtils.toLower(did);
        require(!didStatus[did].deactivated, "did deactivated");
        string memory pubKeyListKey = KeyUtils.genPubKeyListKey(did);
        IterableMapping.itmap storage pubKeyList = data[pubKeyListKey];
        return StorageUtils.getAllPubKey(did, "EcdsaSecp256k1RecoveryMethod2020", pubKeyList);
    }

    /**
   * @dev query authentication list
   * @param did did
   */
    function getAllAuthKey(string memory did)
    public view returns (StorageUtils.PublicKey[] memory) {
        did = BytesUtils.toLower(did);
        require(!didStatus[did].deactivated, "did deactivated");
        IterableMapping.itmap storage pubKeyList = data[KeyUtils.genPubKeyListKey(did)];
        return StorageUtils.getAllAuthKey(did, "EcdsaSecp256k1RecoveryMethod2020", pubKeyList);
    }

    /**
   * @dev query context list
   * @param did did
   */
    function getContext(string memory did)
    public view returns (string[] memory) {
        did = BytesUtils.toLower(did);
        require(!didStatus[did].deactivated, "did deactivated");
        string memory ctxListKey = KeyUtils.genContextKey(did);
        IterableMapping.itmap storage ctxList = data[ctxListKey];
        return StorageUtils.getContext(ctxList, "https://www.w3.org/ns/did/v1");
    }

    /**
   * @dev query controller list
   * @param did did
   */
    function getAllController(string memory did)
    public view returns (string[] memory){
        string memory controllerListKey = KeyUtils.genControllerKey(did);
        IterableMapping.itmap storage controllerList = data[controllerListKey];
        return StorageUtils.getAllController(controllerList);
    }

    /**
   * @dev query service list
   * @param did did
   */
    function getAllService(string memory did)
    public view returns (StorageUtils.Service[] memory){
        string memory serviceKey = KeyUtils.genServiceKey(did);
        IterableMapping.itmap storage serviceList = data[serviceKey];
        return StorageUtils.getAllService(serviceList);
    }

    /**
   * @dev query did updated time
   * @param did did
   */
    function getUpdatedTime(string memory did)
    public view returns (uint){
        string memory updateTimeKey = KeyUtils.genUpdateTimeKey(did);
        bytes32 key = KeyUtils.genUpdateTimeSecondKey();
        bytes memory time = data[updateTimeKey].data[key].value;
        if (time.length == 0) {
            return 0;
        }
        (uint256 result,) = ZeroCopySource.NextUint255(time, 0);
        return result;
    }

    /**
   * @dev query document
   * @param did did
   */
    function getDocument(string memory did)
    public view returns (StorageUtils.DIDDocument memory) {
        string[] memory context = getContext(did);
        StorageUtils.PublicKey[] memory publicKey = getAllPubKey(did);
        StorageUtils.PublicKey[] memory authentication = getAllAuthKey(did);
        string[] memory controller = getAllController(did);
        StorageUtils.Service[] memory service = getAllService(did);
        uint updated = getUpdatedTime(did);
        // always set created time as 0
        return StorageUtils.DIDDocument(context, did, publicKey, authentication, controller, service, updated);
    }
}