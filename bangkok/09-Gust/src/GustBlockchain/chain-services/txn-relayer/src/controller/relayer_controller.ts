import {Request, Response} from 'express';
import { createSmoldotClient } from '../services/smoldot_service';
import { sendTransaction } from '../services/transaction_service';
import { deploySmartContract } from '../services/deploy_service';
import { mockSendTransaction, mockDeploySmartContract } from '../services/dummy_blockchain/mock_blkchain';

export const signingAndSending = async (req:Request, res:Response) => {
    // const { chainSpec, recipientAddress, amount } = req.body;
  const { recipientAddress, amount } = req.body;
  console.log('Received request at /relay-transaction:', req.body);


  try {
    // Simulate adding a transaction to the mock blockchain
    const txHash = mockSendTransaction(recipientAddress, amount);
    // const client = await createSmoldotClient(chainSpec);

    // const txHash = await sendTransaction(client, recipientAddress, amount);

    // res.json({ message: 'Transaction relayed successfully', txHash });
    const deploymentLogs = [
      'Contract compiled successfully...',
      'Connecting to blockchain...',
      `Transaction hash: ${txHash}`,
      'Smart contract deployed successfully!'
    ];

    res.json({
      message: 'Deployment started successfully.',
      logs: deploymentLogs
    });
  } catch (error) {
    console.error('Error relaying transaction:', error);
    res.status(500).json({ message: 'Transaction failed', error });
  }
}

export const deployingSmartContract = async (req:Request, res:Response) => {
  // const { chainSpec, codeHash, args } = req.body;
  const { codeHash, args } = req.body;
  console.log('Received request at /deploy:', req.body);


  try {
    const txHash = mockDeploySmartContract(codeHash, args);
    // const client = await createSmoldotClient(chainSpec);
    // const txHash = await deploySmartContract(client, codeHash, args);
    // res.json({ message: 'Smart contract deployed successfully', txHash });
    const deploymentLogs = [
      'Contract compiled successfully...',
      'Connecting to blockchain...',
      `Transaction hash: ${txHash}`,
      'Smart contract deployed successfully!'
    ];

    res.json({
      message: 'Deployment started successfully.',
      logs: deploymentLogs
    });
  } catch (error) {
    console.error('Error deploying contract:', error);
    res.status(500).json({ message: 'Contract deployment failed', error });
  }
};