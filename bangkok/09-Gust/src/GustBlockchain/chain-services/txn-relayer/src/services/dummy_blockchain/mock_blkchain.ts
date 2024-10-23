// interface Block {
//     index: number;
//     transactions: Transaction[];
//     previousHash: string;
//     timestamp: number;
// }

// interface Transaction {
//     sender: string;
//     recipient: string;
//     amount: number;
// }

// class MockBlockchain {
//     private chain: Block[];
//     private currentTransactions: Transaction[];
//     private static instance: MockBlockchain;

//     private constructor() {
//         this.chain = [];
//         this.currentTransactions = [];
//         this.createBlock(1, "0"); // Genesis block
//     }

//     static getInstance() {
//         if (!MockBlockchain.instance) {
//             MockBlockchain.instance = new MockBlockchain();
//         }
//         return MockBlockchain.instance;
//     }

//     createBlock(nonce: number, previousHash: string): Block {
//         const block: Block = {
//             index: this.chain.length + 1,
//             transactions: this.currentTransactions,
//             previousHash,
//             timestamp: Date.now(),
//         };
//         this.chain.push(block);
//         this.currentTransactions = []; // Clear current transactions
//         return block;
//     }

//     createTransaction(sender: string, recipient: string, amount: number) {
//         const transaction: Transaction = { sender, recipient, amount };
//         this.currentTransactions.push(transaction);
//         return this.getLastBlock().index + 1; // Return the index of the block that will hold this transaction
//     }

//     getLastBlock(): Block {
//         return this.chain[this.chain.length - 1];
//     }

//     getChain(): Block[] {
//         return this.chain;
//     }
// }

// export const mockBlockchain = MockBlockchain.getInstance();
export const mockSendTransaction = (recipientAddress: string, amount: string) => {
    console.log(`Mock transaction sent to ${recipientAddress} for ${amount}`);
    return `MockHash_${Math.random().toString(36).substr(2, 9)}`; // return a mock hash
};

export const mockDeploySmartContract = (codeHash: string, args: any[]) => {
    console.log(`Mock contract deployed with code hash ${codeHash} and args ${args}`);
    return `MockContractHash_${Math.random().toString(36).substr(2, 9)}`; // return a mock contract hash
};