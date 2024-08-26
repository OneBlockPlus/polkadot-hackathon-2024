import { useWallet } from "@solana/wallet-adapter-react";
import { verifySignIn } from "@solana/wallet-standard-util";

//import tools from "../lib/tools";
import SOL from "../network/solana";

const solana = window.solanaWeb3;

const self = {
    test_1: () => {    //测试连接到Solana的节点
        const uri = "http://127.0.0.1:8899";
        const connection = new solana.Connection(uri, "confirmed");
        console.log(connection.getBalance);

        //a.获取区块高度
        connection.getBlockHeight().then((data) => {
            console.log(data);
        });

        //b.账号相关的操作
        const pair = solana.Keypair.fromSeed("1234567812345678123456781234567812345678123456781234567812345678");
        const addr = pair.publicKey;
        connection.getBalance(addr).then((amount) => {
            console.log(addr.toString(), amount);
        });

        connection.getAccountInfo(addr).then((info) => {
            console.log(addr, info);
        });
    },
    test_2: () => {    //Account创建账号
        //console.log(solana.Account);
        //const addr="EmEY2LbCJT5Povwo96bP88A1e6mAaADKhZ4P1xY7zHWJ";
        //const seed="12345678123456781234567812345678";
        const seed = "";
        const pair = new solana.Account(seed);
        console.log(pair.publicKey.toBase58());

        //方法一
        const { Keypair } = solana;
        let pair_1 = Keypair.generate();

        //方法二
        let secretKey = Uint8Array.from([
            202, 171, 192, 129, 150, 189, 204, 241, 142, 71, 205, 2, 81, 97, 2, 176, 48,
            81, 45, 1, 96, 138, 220, 132, 231, 131, 120, 77, 66, 40, 97, 172, 91, 245, 84,
            221, 157, 190, 9, 145, 176, 130, 25, 43, 72, 107, 190, 229, 75, 88, 191, 136,
            7, 167, 109, 91, 170, 164, 186, 15, 142, 36, 12, 23,
        ]);
        let pair_2 = Keypair.fromSecretKey(secretKey);
    },
    test_3: () => {    //拉起Phantom的钱包

        const secret = [246, 102, 161, 30, 149, 80, 90, 24, 193, 39, 201, 74, 111, 214, 72, 243, 1, 35, 102, 157, 226, 221, 243, 197, 107, 161, 11, 9, 48, 181, 38, 31, 25, 123, 35, 223, 233, 51, 157, 29, 182, 193, 194, 247, 76, 17, 238, 67, 239, 7, 123, 132, 168, 146, 199, 23, 95, 104, 21, 37, 49, 193, 220, 206];
        const SIGNER_WALLET = solana.Keypair.fromSecretKey(new Uint8Array(secret));
        console.log(secret.length);
        console.log(SIGNER_WALLET);
        //const payer = solana.Keypair.generate();
        //console.log(payer);
    },
    test_4: () => {    //call一个部署的合约
        const { Connection, PublicKey, Transaction, TransactionInstruction, Account } = solana;
        const connection = new Connection("http://api.devnet.solana.com");
        const programId = new PublicKey("9AzXSN81r45BAqs6EpRfa3qHSsz5ZjfJHXzeVA4tMNuL");
        const instruction = new TransactionInstruction({
            keys: [
                // Add keys here as needed by the smart contract method
            ],
            programId,
            //data: Buffer.from("<instruction_data>") // Replace with instruction data
            //data:new Uint8Array([0x48, 0x65, 0x6c, 0x6c, 0x6f]),
        });

        // Create a new transaction
        const transaction = new Transaction().add(instruction);
        //console.log(transaction);

        // Sign transaction
        const signer = new Account(); // Replace with signer account

        // const txHash = await web3.sendAndConfirmTransaction(
        //     pg.connection,
        //     transaction,
        //     [pg.wallet.keypair],
        //   );
        // connection.getRecentBlockhash().then((res)=>{
        //     //console.log(res);
        //     transaction.recentBlockhash =res.blockhash;
        //     transaction.sign(signer);
        //     connection.sendTransaction(transaction).then((res)=>{
        //         console.log(res);
        //     });

        // });
        solana.sendAndConfirmTransaction(connection, transaction, [signer]).then((res) => {
            console.log(res);
        })
    },
    test_5: () => {    //Mint测试，获取到交易hash

    },
    test_6: () => {    //部署数据到Accounts（template的模拟）

    },
    test_basic: () => {
        //1.check block details
        // const num=276469318;
        // SOL.view(num,"block",(res)=>{
        //     console.log(res);
        // },"devnet");

        //2.check transaction details
        // const hash="2iHGfS6XJKr6AA8TkzWe4zhDX7PxxGuzi6mhrqEEGuxxAXV8vUv48otSCf3ERS1byV822gZNr8zwnV3strQTq28M";
        // SOL.view(hash,"transaction",(res)=>{
        //     console.log(res,hash);
        // },"devnet");

        //3.get program details
        const program_id = "k6cgN7HWWcZwAXAuguSZu6SWTiVxPM6hsXNzjQtuFPF";
        SOL.view(program_id, "program", (res) => {
            console.log(res, program_id);
        }, "devnet");

    },
    test_convert: () => {
        const acc = "HcoN1wBrQBciVcK3f5G1NU2ZAiXyZFAh9M3qAXg98pWK";
        const hex = SOL.accountToHex(acc);
        console.log(hex);

        const hh = SOL.ss58ToHex(acc);
        console.log(hh);
    },
    test_subscribe: () => {
        //No subscribe will effect the request limitation of network.

        // SOL.subscribe("devnet",(res)=>{
        //     console.log(res);
        // });

        // SOL.subscribe("",(res)=>{
        //     console.log(res);
        // });
    },
    test_contract: () => {
        const appkey = "k6cgN7HWWcZwAXAuguSZu6SWTiVxPM6hsXNzjQtuFPF";
        const owner = "EmEY2LbCJT5Povwo96bP88A1e6mAaADKhZ4P1xY7zHWJ";
        SOL.run(appkey, owner, { hello: "word" }, (res) => {
            console.log(res);
        }, "devnet");
    }
}

const Solana_test = {
    auto: () => {
        //self.test_1();
        //self.test_2();
        //self.test_3();
        //self.test_4();
        //self.test_5();
        //self.test_6();
        //self.test_basic();
        //self.test_convert();
        self.test_subscribe();
    },

}
export default Solana_test;