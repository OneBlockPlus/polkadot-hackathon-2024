const Web3 = require('web3');
const crypto = require('crypto');
const ethUtil = require('ethereumjs-util');

// Connect to the Ethereum JSON-RPC endpoint
const web3 = new Web3('https://testnet.pixelschain.xyz');

async function sendTransaction() {
  try {
    // Check if the endpoint is available
    const isConnected = await web3.eth.net.isListening();
    if (!isConnected) {
      throw new Error('Unable to connect to the Ethereum JSON-RPC endpoint');
    }

    // Generate a random Ethereum address
    const privateKey = crypto.randomBytes(32);
    const publicKey = ethUtil.privateToPublic(privateKey);
    const address = ethUtil.publicToAddress(publicKey).toString('hex');

    // Check the current gas price
    const gasPrice = await web3.eth.getGasPrice();
    console.log(`Current gas price: ${gasPrice} wei`);

    // Sign and send the transaction using the private key
    const from = '0x2077BD7011DaCD7bc649Ae8cb543D21017f1815E';
    const to = address;
    const value = '1000000000000000000'; // Send 1 DIOR
    const gas = '41000'; // Standard transaction gas limit
    const nonce = await web3.eth.getTransactionCount(from);
    const txParams = { from, to, value, gasPrice, gas, nonce };
    const signedTx = await web3.eth.accounts.signTransaction(txParams, 'c9040c2ba75c9c04f9e7442d604bfdb634f8d616dd8c97bbe72783289a2f050d');
    console.log(`Signed transaction: ${signedTx.rawTransaction}`);
    const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log(`Transaction sent: ${txHash}`);
  } catch (error) {
    console.error(error);
  }
}

// Repeat the script every 30 seconds
setInterval(sendTransaction, 30000);
