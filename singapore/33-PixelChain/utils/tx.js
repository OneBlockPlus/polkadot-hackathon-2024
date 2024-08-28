const Web3 = require('web3');
const csv = require('csv-parser');
const fs = require('fs');

// Connect to the Ethereum JSON-RPC endpoint
const web3 = new Web3('https://testnet.pixelschain.xyz');

async function signAndSendTransactions() {
  try {
    // Check if the endpoint is available
    const isConnected = await web3.eth.net.isListening();
    if (!isConnected) {
      throw new Error('Unable to connect to the Ethereum JSON-RPC endpoint');
    }

    // Read the recipients from the CSV file
    const recipients = [];
    fs.createReadStream('recipients.csv')
      .pipe(csv())
      .on('data', (data) => recipients.push(data))
      .on('end', async () => {
        console.log(`Read ${recipients.length} recipients from the CSV file`);

          // Check the current gas price
          const gasPrice = await web3.eth.getGasPrice();
          console.log(`Current gas price: ${gasPrice} wei`);

          // Sign and send the transaction using the private key
          const privateKey = 'c9040c2ba75c9c04f9e7442d604bfdb634f8d616dd8c97bbe72783289a2f050d';
          const from = '0x2077BD7011DaCD7bc649Ae8cb543D21017f1815E';
          const to = recipients.address;
          const value = recipients.amount;
          const gas = '53000'; // Standard transaction gas limit
          const nonce = await web3.eth.getTransactionCount(from);
          const txParams = { from, to, value, gasPrice, gas, nonce };
          const signedTx = await web3.eth.accounts.signTransaction(txParams, privateKey);
          console.log(`Signed transaction: ${signedTx.rawTransaction}`);
          const txHash = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
          console.log(`Transaction sent: ${txHash}`);
        });
 
    } catch (error) {
      console.error(error);
    }
  }
  
  signAndSendTransactions();
  
