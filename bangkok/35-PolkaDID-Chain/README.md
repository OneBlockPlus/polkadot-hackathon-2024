# Polka-DID-Chain

## Overview
Polka-DID-Chain is a decentralized identity management system built on Substrate. It enables the creation, update, and deletion of decentralized identifiers (DIDs), as well as issuing and revoking verifiable credentials (VCs). This project provides an on-chain DID registry, facilitating a privacy-preserving, self-sovereign identity framework compatible with the Polkadot ecosystem.

## Key Features:
- **Decentralized Identifiers (DIDs)**: 
  - Users can create their own DIDs that are cryptographically verifiable, with public keys stored on-chain.
- **Verifiable Credentials (VCs)**: 
  - Issue, store, and revoke verifiable credentials (e.g., proof of academic degree, certifications) tied to DIDs.
- **Service Endpoints**:
  - DID holders can link service endpoints, such as off-chain identity verification services, making the DIDs versatile and usable across various platforms.
- **Modular Pallet**: 
  - The DID logic is modular and can be easily integrated into any Substrate-based chain.

## Architecture

### Pallet Components

1. **Storage**:
    - **DIDs**: A mapping of account IDs to their respective DID documents.
    - **Credentials**: Double-mapping for each account and credential ID to store verifiable credentials issued to the account.

2. **DID Document**:
    - **did**: The identifier of the user (account address).
    - **public_key**: The cryptographic public key associated with the DID for verification.
    - **service_endpoint**: The URL or endpoint where further services for the DID may be accessed.

3. **Verifiable Credential**:
    - **issuer**: The account that issued the credential.
    - **subject**: The account that received the credential.
    - **credential_type**: The type of credential (e.g., academic degree, license).
    - **credential_data**: Encrypted or raw data of the credential itself.

4. **Events**:
    - **DIDCreated**: When a DID is successfully created.
    - **DIDUpdated**: When a DID is updated with new data.
    - **DIDDeleted**: When a DID is removed from the chain.
    - **CredentialIssued**: When a verifiable credential is issued to a subject by an issuer.
    - **CredentialRevoked**: When a credential is revoked by its issuer.

5. **Error Handling**:
    - **DIDAlreadyExists**: When trying to create a DID that already exists.
    - **DIDNotFound**: When trying to access or modify a DID that does not exist.
    - **NotAuthorized**: When trying to revoke a credential not issued by the caller.
    - **CredentialNotFound**: When attempting to revoke a credential that doesn't exist.

### Main Dispatchable Functions

- **create_did**: 
    - Allows a user to create a new DID with an associated public key and service endpoint.
- **update_did**: 
    - Allows a user to update the public key or service endpoint of an existing DID.
- **delete_did**: 
    - Removes a DID from the registry.
- **issue_credential**: 
    - Allows an issuer to provide a verifiable credential to a subject.
- **revoke_credential**: 
    - Allows an issuer to revoke a previously issued credential.

## Usage

### Creating a DID

1. In **Polkadot.js Apps**, navigate to **Extrinsics** and select the DID pallet.
2. Use the `create_did` function, supplying your public key and an optional service endpoint.

### Issuing a Credential

1. Select the `issue_credential` function, specifying the subject’s account ID, a credential ID, the type of credential, and the credential data.
2. The credential will now be associated with the subject’s DID.

### Revoking a Credential

1. To revoke an issued credential, select the `revoke_credential` function, and input the credential ID and subject's account ID.
2. Once revoked, the credential is removed from the on-chain registry.

## Future Enhancements

- **Cross-Chain Identity**: Interoperability with other Polkadot parachains to allow cross-chain identity verification.
- **Off-Chain Data Storage**: Support for IPFS or other decentralized storage solutions to store large credential data off-chain.
- **DID Resolution Service**: Allow external applications to resolve DIDs through a web-based API.