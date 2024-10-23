import { ethers } from "ethers";
import { useContext } from "react";
import { fulfillTransaction } from "../apis/DataTransactions";
import { WalletContext } from "../context/WalletContext";

export const Moonbeam_setup = () => {
    const { provider, walletAddress } = useContext(WalletContext); // Use provider and walletAddress from context

    let contract = null;
    let tokenContract = null;

    const contractAddress = "0x7aE15C79b2c9dbb5cF779280ABf89301b582dB77";  // Replace with your contract address
    const tokenAddress = "0xb75ad8E35c0a031817bAb43ffD4816657B2F4001";   // Replace with your ERC20 token address
    const tokenAbi = require("./abi/CGDXToken.json").abi;  // Load ERC20 token ABI
    const contractAbi = require("./abi/DecentralizedDataMarketplace.json").abi;  // Load main contract ABI

    // Initialize contracts using the signer, not just the provider
    const initializeContracts = async () => {
        try {
            if (!provider) {
                console.error("Provider is not initialized. Please connect your wallet.");
                return;
            }

            const signer = await provider.getSigner(); // Get the signer from the provider

            // Initialize contract instances with signer (needed for sending transactions)
            contract = new ethers.Contract(contractAddress, contractAbi, signer);
            tokenContract = new ethers.Contract(tokenAddress, tokenAbi, signer);

            console.log("Contracts initialized with signer");
        } catch (error) {
            console.error("Error initializing contracts:", error);
            throw error;
        }
    };

    const decodeBase64 = (base64) => {
        const binaryString = atob(base64); // Decode Base64 into binary string
        const byteArray = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            byteArray[i] = binaryString.charCodeAt(i);
        }
        return byteArray;
    };

    // Function to convert Uint8Array to bytes32
    const toBytes32 = (byteArray) => {
        if (byteArray.length !== 32) {
            throw new Error("Invalid length: byte array must be 32 bytes long.");
        }
        return ethers.hexlify(byteArray); // Convert to hex format
    };

    const approveTokens = async (amount) => {
        try {
            if (tokenContract && walletAddress) {
                const amountToApprove = ethers.parseUnits(amount.toString(), 18);

                console.log("Approving tokens for contract to spend: ", amountToApprove.toString());

                // Call the approve function using the signer and let the user sign the transaction
                const approveTx = await tokenContract.approve(contractAddress, amountToApprove);

                console.log("Approval Transaction Sent: ", approveTx.hash);

                const receipt = await approveTx.wait();
                console.log("Transaction confirmed in block: ", receipt.blockNumber);
            } else {
                console.log("Token contract is not initialized. Please initialize the contracts first.");
            }
        } catch (error) {
            console.error("Error approving tokens: ", error);
            throw error;
        }
    };

    const purchaseUploads = async (uploads, amount) => {
        try {
            if (contract && walletAddress) {
                // Prepare the data for the uploads
                let uploadHashArray = [];
                let dataQualityArray = [];
                let datapoolId = uploads[0].dataPoolId; // For simplicity, assuming all uploads are for the same datapool

                uploads.forEach((upload) => {
                    // Decode the Base64 uploadHash into a Uint8Array
                    const byteArray = decodeBase64(upload.uploadHash);

                    // Convert the byte array to a bytes32 hex string
                    const bytes32Hash = toBytes32(byteArray);

                    // Push the bytes32 hash into the uploadHashArray
                    uploadHashArray.push(bytes32Hash);

                    // Push the data quality score
                    dataQualityArray.push(upload.dataQualityScore);
                });

                // Estimate gas and send transaction via signer
                const gasLimit = await contract.purchaseUploads.estimateGas(
                    datapoolId,
                    uploadHashArray,
                    dataQualityArray
                );

                const purchaseTx = await contract.purchaseUploads(
                    datapoolId,
                    uploadHashArray,
                    dataQualityArray,
                    {
                        from: walletAddress, // User's account
                        gasLimit: gasLimit, // Dynamically estimated gas limit
                        gasPrice: ethers.parseUnits("10", "gwei"), // Gas price can be adjusted
                    }
                );

                console.log(`PurchaseUploads Transaction Sent: ${purchaseTx.hash}`);

                // Wait for the transaction to be mined and confirmed
                const receipt = await purchaseTx.wait();
                console.log("Transaction confirmed in block: ", receipt.blockNumber);

                console.log("Transaction receipt: ", receipt);

                await fulfillTransaction(purchaseTx.hash, walletAddress, amount)
            } else {
                console.log("Contract is not initialized. Please initialize the contracts first.");
                throw new Error("Contract is not initialized.");
            }
        } catch (error) {
            console.error("Error sending purchaseUploads transaction: ", error);
            throw error;
        }
    };

    return {
        initializeContracts,  // Initializes the contract instances with the provider and wallet
        approveTokens,        // Approves tokens for the contract to spend
        purchaseUploads       // Purchases uploads
    };
};
