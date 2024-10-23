# Cuta
The DIDContractV2 is an advanced implementation aimed at providing robust DID management on the blockchain, supporting features for decentralized identity, key management, and controller assignment, including management of public keys, authentication keys, and various related elements such as controllers, services, and contexts. Below is a breakdown of its functionality:

Core Features:
Deactivate DID:

The deactivateID function allows the deactivation of a DID by deleting all associated data while preventing the DID from being registered again in the future.
Key Management:

Add Keys: Functions like addKey, addAddr, addNewAuthKey, and addNewAuthAddr enable the addition of public keys or addresses to the DID, either in the public key list or the authentication list.
Set Auth Keys: setAuthKey, setAuthAddr, setAuthKeyByController, and setAuthAddrByController allow the assignment of existing keys or addresses in the public key list to the authentication list.
Deactivate Keys: Functions like deactivateKey, deactivateAddr, deactivateAuthKey, and deactivateAuthAddr facilitate the removal of keys or addresses from the public key list or authentication list.
Controller Management:

Add/Remove Controllers: The addController and removeController functions manage the addition or removal of controllers for a DID.
Service Management:

Add/Update/Remove Services: The addService, updateService, and removeService functions manage the services associated with a DID, including service ID, type, and endpoint.
Context Management:

Add/Remove Contexts: The addContext and removeContext functions allow the management of context data related to a DID.
Key Functions:
addNewPubKey: Adds a new public key or address to the DID's public key list or authentication list, based on parameters provided.
authPubKey & deAuthPubKey: Handle the authorization and deauthorization of public keys or addresses for a DID.
encodePubKeyAndAddr: Combines a public key and address into a single bytes array, used internally for key management.
updateTime: Updates the timestamp for the last operation on a DID, ensuring accurate record-keeping.
Events:
Various events such as Deactivate, AddKey, AddAddr, SetAuthKey, SetAuthAddr, AddController, AddService, etc., are emitted to notify about changes or operations performed on the DID.
Internal Validations:
Functions like checkWhenAddKey, checkWhenOperate, and checkWhenAddKeyByController validate the operations based on the signer, controller, and other parameters, ensuring that only authorized actions are performed.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat run scripts/deploy.js --network moonbase
```

git 
https://moonbase.moonscan.io/address/0xb0e472eAA8e7D2d88e5337c14d891BE8a52112Bd#code

