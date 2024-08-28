// // import Web3 from "web3";
// import abi from "../../assets/Blockpass.json";

// const web3 = new Web3(window.ethereum);
// // Contract ABI and address
// const contractABI = abi.abi;
// const contractAddress = '0xD05E461F5CE3D721d614aD881FcB73cCA74D61D4';  // Your contract address

// // Create contract instance
// const myContract = new web3.eth.Contract(contractABI, contractAddress);
// console.log(myContract);

// // Call a method
// export async function getAllEvents() {
//     try {
//         const result = await myContract.methods.allBlockPassList().call();
//         console.log('Result from myMethod:', result[0]);
//     } catch (error) {
//         console.error('Error calling myMethod:', error);
//     }
// }
// export async function createEvent(max_pass_count, startTime, salesEndTime, initialPassPrice, metadata, category) {
//     const accountAddress = await web3.eth.getAccounts();
//     console.log(accountAddress);
//     console.log(max_pass_count, startTime, salesEndTime, initialPassPrice, metadata, category);
//     try {
//         const tx = myContract.methods.createNewPass(max_pass_count, startTime, salesEndTime, initialPassPrice, metadata, category);
//         const gasPrice = await web3.eth.getGasPrice();
//         const result = await tx.send({from: accountAddress[0], gasPrice: gasPrice, gas: 1000000});
//         console.log('Result from myMethod:', result);
//     } catch (error) {
//         console.error('Error calling myMethod:', error);
//     }
// }