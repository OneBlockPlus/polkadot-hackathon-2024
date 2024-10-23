# Omniverse bitcoin taproot script proof chain

Omniverse sender are responsible to submit block information onto chains

## Prerequisites

- node >= v18.12
- npm >= 8.19.2

## Install

### Clone the repository
```

```

### Install dependencies
```
npm install
```

## Usage

### Dependencies

- Bitcoind: Bitcoin full node, local test node is working.
    - Backend: Indexer()


### Configuration

- scanInterval: The interval to update blocks
- logLevel: Log level 
- secret: Where the file of the secret key of porter is stored
- database: Database information
    - host: Host URL
    - user: User name
    - password: Password of the user
- networks:

### Launch

```
npm run start
```
