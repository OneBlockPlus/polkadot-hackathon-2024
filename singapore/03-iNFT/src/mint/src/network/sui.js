//import * as Sui from "@mysten/sui.js";
import { getFullnodeUrl, SuiClient } from "@mysten/sui.js/client";
import { TransactionBlock } from "@mysten/sui.js/transactions";
import { Ed25519Keypair } from "@mysten/sui.js/keypairs/ed25519";
import { getFaucetHost, requestSuiFromFaucetV0 } from "@mysten/sui.js/faucet";
//import * as Sui_utils from "@mysten/sui.js/utils";


import tools from "../lib/tools";

let checker = null;
const config = {
    interval: 800,
    defaultNode: "http://127.0.0.1:8899",
}

const funs = {

}

let client = null;
const self = {
    init: (network, ck) => {
        if (client !== null) return ck && ck(client);
        client = new SuiClient({
            url: getFullnodeUrl(network),
        });
        return ck && ck(client);
    },

    //connect to Phantom wallet
    wallet: (ck) => {

    },
    balance: (addr, ck, net) => {     //get balance from base58 account
        const network = net !== undefined ? net : "testnet";
        const client = new SuiClient({
            url: getFullnodeUrl(network),
        });
        client.getBalance({ owner: addr }).then((res) => {
            return ck && ck(res);
        }).catch((error) => {
            return ck && ck(error);
        });
    },
    generate: (ck, seed) => {
        const pair = new Ed25519Keypair();
        const account = {
            address: pair.getPublicKey().toSuiAddress(),
            privateKey: pair.getSecretKey(),
            raw: {
                public: pair.keypair.publicKey,
                private: pair.keypair.secretKey,
                keypair: pair,
            },
        }
        return ck && ck(account);
    },
    divide: () => {

    },
    recover: (u8arr, ck) => {
        const pair = Ed25519Keypair.fromSecretKey(u8arr);
        const account = {
            address: pair.getPublicKey().toSuiAddress(),
            privateKey: pair.getSecretKey(),
            raw: {
                public: pair.keypair.publicKey,
                private: pair.keypair.secretKey,
                keypair: pair,
            },
        }
        return ck && ck(account);
    },
    transfer: (amount, to, ck, network) => {

    },

    //https://sdk.mystenlabs.com/typescript/sui-client#signandexecutetransactionblock
    run: async (sui_contract, args, keypair, ck, network) => {
        self.init(network, async (client) => {
            const txb = new TransactionBlock();
            const nargs = []
            for (let i = 0; i < args.length; i++) {
                nargs.push(txb.pure(args[i]));
            }

            txb.moveCall({
                target: sui_contract,
                arguments: nargs,
            });
            const result = await client.signAndExecuteTransactionBlock({
                transactionBlock: txb,
                signer: keypair,
                requestType: "WaitForLocalExecution",
                options: {
                    showEffects: true,
                },
            });
            return ck && ck(result);
        })
    },
    write: (pair, obj, ck) => {

    },

    //0xc61afbaf7240f61007c6a2ea5d23924a4efc509aed9e49641d59254adf72a72d
    airdrop: async (suiAddr, amount, ck, network) => {
        const res = await requestSuiFromFaucetV0({
            host: getFaucetHost(network),
            recipient: suiAddr,
        });
        //console.log(res);
        return ck && ck(res);
    },
    view: (value, type, ck, network) => {
        self.init(network, async (client) => {
            switch (type) {
                case "account":

                    break;
                case "transaction":

                    break;

                case "digest":
                    console.log(client);
                    client.getTransactionBlock({ digest: value }).then((res) => {
                        return ck && ck(res);
                    }).catch((error) => {
                        return ck && ck(error);
                    });
                    break;
                case "object":
                    console.log(client);
                    client.getObject({ id: value }).then((res) => {
                        return ck && ck(res);
                    }).catch((error) => {
                        return ck && ck(error);
                    });
                    break;

                default:
                    break;
            }
        });
    },
    subscribe: (ck, network) => {

    },
    state:(ck,network)=>{
        self.init(network, async (client) => {
            client.getLatestSuiSystemState().then((res) => {
                return ck && ck(res);
            }).catch((error) => {
                return ck && ck(error);
            });
        });
    },
    test: () => {
        test.auto();
    }
};

const test = {
    auto: () => {
        //test.test_mint_contract();
        //test.test_view_digest();
        //test.test_view_object();
        test.test_state();
    },
    test_state:()=>{
        const Sui = self;
        const network = "testnet";
        Sui.state((data)=>{
            console.log(data);
        },network);
    },
    test_view_object: () => {
        const Sui = self;
        const network = "testnet";
        //0x8236426eee92ab2857b73e9d4754fd12af77810371a1ade0c80884fb9fb8382d::infts::INFT_NFT
        //0x2::coin::Coin<0x2::sui::SUI>
        const di = "0xcdd09cb38c8dcf934dc518e6be7664cec2fad78e8272c8cbce7814ffba458838";
        Sui.view(di, "object", (data) => {
            console.log(data);
        }, network);
    },
    test_view_digest: () => {
        const Sui = self;
        const network = "testnet";
        const di = "9ZFQTaD6pbWwpoqmeb7JKuCXGvZpJ3z3P11E8TEwysFn";
        Sui.view(di, "digest", (data) => {
            console.log(data);
        }, network);
    },
    test_mint_contract: () => {
        const Sui = self;
        const network = "testnet";
        const signer_private = "eb8d786f420b3d7e4849abcca1d340f7a855a78030b37e8ae2b9dc7a923dffbd";
        //const signer_address = "0x49d80ed919e21bea6377e5d6e3c3823ee817657be4b82762cfcab78e3b15f2cd";
        //"9ZFQTaD6pbWwpoqmeb7JKuCXGvZpJ3z3P11E8TEwysFn"
        Sui.recover(tools.hexToU8(signer_private), (acc) => {
            const contract = "0x8236426eee92ab2857b73e9d4754fd12af77810371a1ade0c80884fb9fb8382d";
            const act = "infts::mint_to_sender";
            const ipfs = "bafkreiddy2rqwebw5gm5hdqqqrbsqzkrubjk3ldzr2bia5jk4w5o2w5w4i";
            const clock = "0x6";
            const offset = JSON.stringify([]);
            // const contract = "0xd0e626176c05ae3aff2e06719de40367b5bfa37821f5db5b8ea0921ec0260422::bird_nft::mint_to_sender";
            const args = [ipfs, clock, offset];
            Sui.run(`${contract}::${act}`, args, acc.raw.keypair, (res) => {
                console.log(res);
            }, network);
        });
    },
    test_airdrop: () => {
        const Sui = self;
        const network = "testnet";
        Sui.airdrop("0x90d37594861698c9e9e2a6726d1fd7f24945093cc9864cf47752908f0c9f15a9", 0, (res) => {
            console.log(res);
        }, network);
    },
    test_balance: () => {
        const Sui = self;
        const network = "testnet";
        //const signer_private = "eb8d786f420b3d7e4849abcca1d340f7a855a78030b37e8ae2b9dc7a923dffbd";
        const signer_address = "0x49d80ed919e21bea6377e5d6e3c3823ee817657be4b82762cfcab78e3b15f2cd";
        Sui.balance(signer_address, (res) => {
            console.log(res);
        }, network);
    },
}

export default self;