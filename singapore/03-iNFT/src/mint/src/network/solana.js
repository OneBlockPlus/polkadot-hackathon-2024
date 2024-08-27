import * as SOL from "@solana/web3.js";

let checker = null;
let link = null;
const config = {
    interval: 800,
    defaultNode: "http://127.0.0.1:8899",
}

const funs = {
    toBuffer: (str) => {
        return Uint8Array.from(Array.from(str).map(letter => letter.charCodeAt(0)));
    },

    //TODO, heret to check the input type
    check: (value, type) => {
        switch (type) {
            case "account":

                break;

            default:
                break;
        }

        //mock true result
        return true;
    },
    uint8ArrayToBase58: (uint8Array) => {
        const BASE58_CHARS = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
        let base58String = "";
        let value = 0n;
        let base = 1n;

        // Convert Uint8Array to BigInt
        for (let i = uint8Array.length - 1; i >= 0; i--) {
            value += window.BigInt(uint8Array[i]) * base;
            base *= 256n;
        }

        // Convert BigInt to Base58 string
        while (value > 0n) {
            const remainder = value % 58n;
            value = value / 58n;
            base58String = BASE58_CHARS[Number(remainder)] + base58String;
        }

        // Prefix leading zero bytes in Uint8Array with "1" in Base58 string
        for (let i = 0; i < uint8Array.length && uint8Array[i] === 0; i++) {
            base58String = "1" + base58String;
        }

        return base58String;
    },
    encode: (string) => {
        const encoder = new TextEncoder();
        const stringBytes = encoder.encode(string);

        const stringLengthBytes = new Uint8Array(4);
        stringLengthBytes[0] = stringBytes.length & 0xff;
        stringLengthBytes[1] = (stringBytes.length >> 8) & 0xff;
        stringLengthBytes[2] = (stringBytes.length >> 16) & 0xff;
        stringLengthBytes[3] = (stringBytes.length >> 24) & 0xff;

        // Concatenate length bytes with string bytes
        const instructionData = new Uint8Array(stringBytes.length + 4);
        instructionData.set(stringLengthBytes, 0);
        instructionData.set(stringBytes, 4);

        return instructionData;
    },
}

const self = {
    bs58ToHex: (ss58) => {
        const {
            PublicKey,
        } = SOL;
        const pub = new PublicKey(ss58);
        const u8arr = pub.toBytes();
        return "0x" + Array.from(u8arr)
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    },
    init: (network, ck) => {
        if (link !== null) return ck && ck(link);
        const { Connection, clusterApiUrl } = SOL;
        //console.log(SOL);
        switch (network) {
            case "devnet":
                link = new Connection(clusterApiUrl("devnet"));
                break;

            default:
                link = new Connection(config.defaultNode, "confirmed");
                break;
        }

        //console.log(link);
        return ck && ck(link);
    },

    //connect to Phantom wallet
    wallet: (ck) => {
        if (typeof window.solana !== "undefined") {
            try {
                window.solana.connect().then((res) => {
                    return ck && ck(res);
                });

            } catch (error) {
                return ck && ck(error);
            }
        } else {
            return ck && ck({ error: "No Phantom wallet found." });
        }
    },
    balance: (ss58, ck,network) => {     //get balance from base58 account
        //console.log(ss58);
        const {
            PublicKey,
        } = SOL;
        const acc = new PublicKey(ss58);
        self.init(network, (connection) => {
            connection.getBalance(acc).then((info) => {
                return ck && ck(info);
            }).catch((error) => {
                return ck && ck(error);
            });
        });
    },
    generate: (ck, seed) => {
        const {
            Keypair,
        } = SOL;
        const acc = Keypair.generate();
        return ck && ck(acc);
    },
    divide:()=>{
        const {
            LAMPORTS_PER_SOL,
        } = SOL;
        return LAMPORTS_PER_SOL;
    },
    recover: (bs58Private, ck) => {
        const {
            Keypair,
        } = SOL;
        const u8arr=window.bs58.decode(bs58Private);
        const account = Keypair.fromSecretKey(u8arr);
        return ck && ck(account);
    },
    storage: (json, ck, network) => {
        self.init(network, (connection) => {

        });
    },
    transfer: (amount, to, ck, network) => {
        const {
            Transaction,
            SystemProgram,
            sendAndConfirmTransaction,
            PublicKey,
            LAMPORTS_PER_SOL
        } = SOL;
        self.init(network, (connection) => {
            connection.getRecentBlockhash().then(({ blockhash }) => {
                if (typeof window.solana !== "undefined") {
                    const wallet = window.solana;
                    wallet.connect().then(async (from) => {
                        const toAccount = new PublicKey(to);
                        const transaction = new Transaction().add(
                            SystemProgram.transfer({
                                fromPubkey: from.publicKey,
                                toPubkey: toAccount,
                                lamports: amount * LAMPORTS_PER_SOL,
                            }),
                        );

                        const signature = await sendAndConfirmTransaction(
                            connection,
                            transaction,
                            [from],
                        );
                        return ck && ck(signature);
                    });
                }
            });
        });
    },
    run: (program_bs58, param,signer ,ck, network) => {
        const {
            PublicKey,
            Transaction,
            sendAndConfirmTransaction,
        } = SOL;
        self.init(network, async (connection) => {
            const programId = new PublicKey(program_bs58);

            const root_id = "11111111111111111111111111111111";
            const rootPublicKey = new PublicKey(root_id);

            const keys = [
                { pubkey: signer.publicKey, isSigner: true, isWritable: true },
                { pubkey: programId, isSigner: false, isWritable: true },
                { pubkey: rootPublicKey, isSigner: false, isWritable: false },
            ];

            const transaction = new Transaction();
            transaction.add(
                new SOL.TransactionInstruction({
                    keys: keys,
                    programId: program_bs58,
                })
            );
            const txid = await sendAndConfirmTransaction(connection, transaction, [signer]);
            return ck && ck(txid);
            // self.view(txid,"transaction",(tx)=>{
            //     return ck && ck(tx);
            // },network);
        });
    },
    airdrop: (ss58, amount, ck, network) => {
        const {
            PublicKey,
        } = SOL;
        const target = new PublicKey(ss58);
        self.init(network, async (connection) => {
            const {
                LAMPORTS_PER_SOL,
            } = SOL;

            let airdropSignature = await connection.requestAirdrop(
                target,
                amount * LAMPORTS_PER_SOL,
            );
            connection.confirmTransaction({ signature: airdropSignature }).then((res) => {
                return ck && ck(res);
            }).catch((error) => {
                return ck && ck(error);
            });
        });
    },
    view: (value, type, ck, network) => {
        self.init(network, (connection) => {
            const {
                PublicKey,
            } = SOL;
            switch (type) {
                case "block":
                    const cfg = { "maxSupportedTransactionVersion": 0 };
                    connection.getBlock(value, cfg).then((res) => {
                        return ck && ck(res);
                    }).catch((error) => {
                        return ck && ck(error);
                    });
                    break;

                case "account":
                    const publicKey = new PublicKey(value);
                    connection.getAccountInfo(publicKey).then((info) => {
                        return ck && ck(info);
                    }).catch((error) => {
                        return ck && ck(error);
                    });
                    break;

                case "transaction":
                    connection.getTransaction(value).then((info) => {
                        return ck && ck(info);
                    }).catch((error) => {
                        return ck && ck(error);
                    });
                    break;

                case "program":
                    const program_id = new PublicKey(value);
                    //console.log(program_id.toString(),value);
                    connection.getProgramAccounts(program_id).then((info) => {
                        return ck && ck(info);
                    }).catch((error) => {
                        return ck && ck(error);
                    });
                    break;

                case "balance":
                    connection.getBalance(value).then((info) => {
                        return ck && ck(info);
                    }).catch((error) => {
                        return ck && ck(error);
                    });
                    break;

                case "token":

                    break;

                default:
                    break;
            }
        });
    },
    subscribe: (ck,network) => {
        self.init(network, (connection) => {
            if (checker === null) {
                checker = setInterval(() => {
                    connection.getSlot().then((block) => {
                        self.view(block, "block", (info) => {
                            info.hash=self.bs58ToHex(info.blockhash);
                            return ck && ck(info);
                        }, network);
                    })
                }, config.interval);
            }
        });
    },
    test: (program_id, data_id, owner_id, ck, network) => {
        self.init(network, async (connection) => {
            const {
                PublicKey,
                TransactionInstruction,
                Transaction
            } = SOL;
            connection.getRecentBlockhash().then(({ blockhash }) => {
                if (window.phantom !== undefined && window.phantom.solana !== undefined) {
                    const wallet = window.phantom.solana;
                    wallet.connect().then(async (signerAccount) => {

                        const programId = new PublicKey(program_id);
                        const dataId = new PublicKey(data_id);
                        const ownerId = new PublicKey(owner_id);

                        const instruction = new TransactionInstruction({
                            keys: [
                                { pubkey: programId, isSigner: false, isWritable: true },
                                { pubkey: dataId, isSigner: false, isWritable: true },
                                { pubkey: ownerId, isSigner: false, isWritable: false },
                                { pubkey: signerAccount.publicKey, isSigner: true, isWritable: false },
                            ],
                            programId,
                        });

                        // transaction data structure
                        const transaction = new Transaction();
                        transaction.feePayer = signerAccount.publicKey;
                        transaction.recentBlockhash = blockhash;
                        transaction.add(instruction);

                        // sign the transactions and get the ABI
                        wallet.signTransaction(transaction).then(async (trans) => {
                            const txHash = await connection.sendRawTransaction(trans.serialize(), {});
                            console.log(txHash);
                            self.view(txHash, "transaction", (res) => {
                                console.log(res);
                                return ck && ck(res);
                            }, network);
                        });
                    }, network);
                }
            });
        });
    },
};

export default self;