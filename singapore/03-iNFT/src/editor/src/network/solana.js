const SOL = window.solanaWeb3;

let checker=null;
let link = null;
const config={
    interval:400,
    defaultNode:"http://127.0.0.1:8899",
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
    }
}

const self = {
    ss58ToHex: (base58String) => {
        const bs58 = require("bs58");
        const uint8Array = bs58.decode(base58String);

        // Convert the Uint8Array to a hexadecimal string
        const hexString = Array.from(uint8Array)
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");

        return "0x"+hexString;
    },

    accountToHex: (ss58) => {
        const {
            PublicKey,
        } = SOL;
        const pub = new PublicKey(ss58);
        const u8arr=pub.toBytes();
        return "0x" + Array.from(u8arr)
            .map(byte => byte.toString(16).padStart(2, "0"))
            .join("");
    },
    //create connection to Solana node
    init: (network, ck) => {
        if (link !== null) return ck && ck(link);
        const { Connection, clusterApiUrl } = SOL;
        switch (network) {
            case "devnet":
                link = new Connection(clusterApiUrl("devnet"));
                break;

            default:
                link = new Connection(config.defaultNode, "confirmed");
                break;
        }
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
    balance:(pub,ck)=>{     //get balance from base58 account

    },

    //TODO,support generating account from seed;
    generate:(ck,seed)=>{
        const {
            Keypair,
        } = SOL;
        const acc = Keypair.generate();
        return ck && ck(acc);
    },

    storage: (data, ck, signer, network) => {
        //console.log(JSON.stringify(funs.toBuffer("你好")));
        self.init(network, (connection) => {
            const {
                Transaction,
                TransactionInstruction,
                SystemProgram,
                Keypair,
                PublicKey,
                LAMPORTS_PER_SOL,
            } = SOL;

            const storageAccount = Keypair.generate();

            const fromPublicKey = signer.publicKey;
            const accountPublicKey = storageAccount.publicKey;
            const dt = funs.toBuffer(JSON.stringify(data));

            //系统的ID，必须要的部分
            const program_id = new PublicKey("11111111111111111111111111111111");

            //1.创建账号的交易指令，再转2个SOL进去
            const createAccountInstruction = SystemProgram.createAccount({
                fromPubkey: fromPublicKey,
                newAccountPubkey: accountPublicKey,
                lamports: 3 * LAMPORTS_PER_SOL, // Amount of lamports to allocate (1 SOL)
                space: dt.length, // Amount of space to allocate
                programId: program_id,
            });

            //2.写入数据的交易指令
            const writeDataInstruction = new TransactionInstruction({
                keys: [
                    { pubkey: fromPublicKey, isSigner: true, isWritable: true },
                    { pubkey: accountPublicKey, isSigner: false, isWritable: true },
                ],
                programId: program_id,
                data: dt,
            });

            //const trans = new Transaction().add(createAccountInstruction, writeDataInstruction);
            connection.getRecentBlockhash().then(({ blockhash }) => {
                const param = {
                    recentBlockhash: blockhash,
                    feePayer: signer.publicKey,
                }
                const trans = new Transaction(param).add(createAccountInstruction, writeDataInstruction);
                //console.log(trans);
                if (typeof window.solana !== "undefined") {
                    const wallet = window.solana;
                    wallet.connect().then(async (pair) => {
                        const signedTransaction = await wallet.signTransaction(trans);
                        console.log(signedTransaction);
                        //const signedTransaction= await wallet.signAllTransactions(trans);
                        //signAllTransactions
                        //const signature=connection.sendRawTransaction(signedTransaction.serialize())
                        //console.log(signature);
                        // wallet.signAndSendTransaction(trans).then(({signature}) => {

                        // }).catch(error => {
                        //     console.error("Failed signAndSendTransaction: ", error);
                        // });
                        //2.之前的版本
                        //wallet.signTransaction(trans)
                        // wallet.signTransaction(trans).then((signedTransaction) => {
                        //     //console.log(signedTransaction.serialize());
                        //     connection.sendRawTransaction(signedTransaction.serialize()).then((signature) => {
                        //         console.log("Transaction signature:", signature);
                        //         connection.confirmTransaction(signature).then(()=>{
                        //             console.log("Account Public Key:", accountPublicKey.toBase58());
                        //         });
                        //     }).catch(error => {
                        //         console.error("Failed to send raw transaction: ", error);
                        //     });
                        // }).catch(error => {
                        //     console.error("Failed to sign transaction: ", error);
                        // });
                    }).catch((error) => {
                        console.error("Failed to connect to Phantom:", error);
                    });
                }
            });
        });
    },
    run: (program_id, param, ck, network) => {
        self.init(network, (connection) => {
            const {
                Transaction,
                TransactionInstruction,
                PublicKey,
            } = SOL;

            connection.getRecentBlockhash().then(({ blockhash }) => {
                if (typeof window.solana !== "undefined") {
                    const wallet = window.solana;
                    wallet.connect().then(async (signer) => {
                        const accountPublicKey = signer.publicKey;
                        const cfg = {
                            recentBlockhash: blockhash,
                            feePayer: accountPublicKey,
                        }

                        const dt = funs.toBuffer(JSON.stringify(param));
                        const programAccount = new PublicKey(program_id);
                        const ix = new TransactionInstruction({
                            keys: [
                                { pubkey: accountPublicKey, isSigner: false, isWritable: true },
                            ],
                            programId: programAccount,
                            data: dt,
                        });
                        const trans = new Transaction(cfg).add(ix);

                        wallet.signTransaction(trans).then((signedTransaction) => {
                            console.log(signedTransaction);
                            connection.sendRawTransaction(signedTransaction.serialize()).then((signature) => {
                                console.log("Transaction signature:", signature);
                                connection.confirmTransaction(signature).then(() => {
                                    console.log("Account Public Key:", accountPublicKey.toBase58());
                                });

                            }).catch(error => {
                                console.error("Failed to send raw transaction: ", error);
                            });

                        }).catch((error) => {
                            console.error("Failed to signed transaction:", error);
                        });

                    }).catch((error) => {
                        console.error("Failed to connect to Phantom:", error);
                    });
                }

            });
        });
    },

    airdrop: (target, amount, ck, network) => {
        self.init(network, async (connection) => {
            //console.log(connection);
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
                    connection.getAccountInfo(value).then((info) => {
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
                    connection.getProgramAccounts(program_id).then((info) => {
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
    subscribe:(network,ck)=>{
        self.init(network, (connection) => {
            if(checker===null){
                checker=setInterval(()=>{
                    connection.getSlot().then((block)=>{
                        //console.log("New block received:", block);
                        self.view(block,"block",(block)=>{
                            //console.log(block.blockhash);
                            return ck && ck(self.ss58ToHex(block.blockhash));
                        },network);
                    })
                },config.interval);
            }
        });
    },
};

export default self;