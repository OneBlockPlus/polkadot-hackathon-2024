# Veles
The Veles pallet is a plug and play carbon credit marketplace solution for Substrate based blockchain networks. Veles enables its user to freely and seamlessly monitor, mint, transact and retire carbon credits. Apart from the main marketplace features, Veles also provides a solution to regulate malicious behaviors within the marketplace and to mitigate the impacts of such behaviors.

The Veles parachain pallet is a solution that incorporates the Veles pallet as a parachain solution on a preexisting FRAME based network. This example was build upon the [Polkadot SDK parachain template](https://github.com/paritytech/polkadot-sdk-parachain-template?tab=readme-ov-file).
<br />

## Veles documentation
If you would like to find out more on how the pallet works and what features does it have please look at our official [Gitbook](https://app.gitbook.com/o/WABjLs5AlKX6VnOwtcI4/s/bTNhSGh61JAMglLLtG8x/get-started/what-is-the-veles-pallet) for the project or the official project [website](https://veles.technology/).
<br />

## Pallet structure
If you would like to find out what data structures exist on the pallet and how they are connected please have a look at the [provided diagrams](https://drive.google.com/file/d/1Iq0n3RrZHUGftbolThfKSwm4ME6Qs5fP/view?usp=sharing).
<br />

## Deployment
### Prerequirments
#### Substrate
Before we can deploy the pallet onto a local blockchain for testing please make sure that you have all of the required resources set up on your machine. Follow the [official Substrate documentation](https://docs.substrate.io/install/) to confirm that you have everything up and running.

#### Zombienet
You will also need zombienet in order to run a local instance of a parachain on your machine. You can look at the [official zombienet documentation](https://github.com/paritytech/zombienet) on how to do this. We recommend using the <b>npm</b> version of the project. Once you have zombienet installed on your local machine, please run the ```zombienet setup polkadot``` command in order to install of the required dependacies for this project.
After finish with the base installation you will need to create the <b>zombienet-config.json</b> file in which you will specify the parameters of the network, here is a example for said file:

```json
{
    "settings": {
        "provider": "native"
    },
    "relaychain": {
        "default_command": "./polkadot",
        "chain": "rococo-local",
        "async_backing_params": {
            "max_candidate_depth": 3,
            "allowed_ancestry_len": 2
        },
        "scheduling_lookahead": 2,

        "nodes": [
            {
                "name": "alice",
                "command": "./polkadot",
                "args": ["--pruning=archive"],
                "ws_port": 9944,
                "invulnerable": true
            },
            {
                "name": "bob",
                "ws_port": 9955,
                "invulnerable": true
            }
        ]
    },
    "types": {},
    "hrmp_channels": [],
    "parachains": [
        {
            "id": 1000,
            "cumulus_based": true,
            "chain": "local",
            "collators": [
                {
                    "name": "alice",
                    "command": "./target/release/veles-parachain-node",
                    "args": ["--pruning=archive", "--log=info"],
                    "ws_port": 9988,
                    "rpc_port": 9999
                },
                {
                    "name": "bob",
                    "command": "./target/release/veles-parachain-node",
                    "ws_port": 9989
                }
            ]
        }
    ]
}
```
<br />

### Pallet configuration
After you have cloned the repository to you local machine, please make sure that you have configured the pallet to your desired specifications. You can do so by editing the ```parameter_types!``` for the pallet (i.e. the IPFSLength and BlockFinalizationTime values). Make sure that you have also set up your blockchain to run offchain workers (the OffchainWorkerTxPriority and OffchainWorkerTxLongevity values). If you would like to add an authority account or any other account to the pallet, please feel free to do so in the pallets ```lib.rs``` file.
<br />

### Setup and deployment
In order to properly setup a local parachain enabled network, firstly run the ```cargo build --package veles-parachain-node --release``` command in order to build the binaries of the Veles Parachain project. Once that is done run the ```zombienet -p native spawn ./zombienet-config.json``` command in order to start a local instance of a parachain network.

Once the network is up and running you can look at the activities of the [relay chain](https://polkadot.js.org/apps/#/explorer?rpc=ws://localhost:9944) and [parachain](https://polkadot.js.org/apps/#/explorer?rpc=ws://localhost:9988) (Veles parachain) on the Polkadot portal website.
