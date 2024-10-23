import { create } from 'ipfs-http-client';
import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';

const VITE_GELATO_API_KEY= "F_JmByQ1IJ9ANSkeZq69Z8sBvnNJ_eI4gK8N_fLPvu0_"

// Initialize IPFS client
const projectId = 'a7543292f10440c59c1e069483b05b30';
const projectSecret = 'UCo7JrMV5FmmWyzSUUUjiZcg9CKZuSin0XNs3M1obOSy4vSKoW4uYQ';

const ipfsClient = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
    authorization: 'Basic ' + Buffer.from(`${projectId}:${projectSecret}`).toString('base64'),
  },
});

const superSecret = "Long and buggy text but can help it"

const encryptData = (data, secret) => {
    return CryptoJS.AES.encrypt(JSON.stringify(data), secret).toString();
};

const decryptData = (encryptedData, secret) => {
    const bytes = CryptoJS.AES.decrypt(encryptedData, secret);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

export const toIpfs = async(data)=>{
    try {
        
        const encrypted =encryptData(data, superSecret)
        const { cid } = await ipfsClient.add(encrypted);
            const ipfsHash = cid.toString();
            return ipfsHash
    } catch (error) {
        throw "Could not save to IPFS"
    }
}

export const fromIpfs = async()=>{
    try {
        const stream = ipfsClient.cat(ipfsHash);
        let encryptedData = '';
        for await (const chunk of stream) {
            encryptedData += new TextDecoder().decode(chunk);
        }
        return decryptData(encryptedData, secret);
        
    } catch (error) {
        throw "Could not load from IPFS"
    }
}

export const addCandidate = async (candidateData, secret) => {
    try {
        const ipfsHash = toIpfs(candidateData)

        // Set up Ethereum provider and contract
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, abi, signer);

        // Store IPFS hash on-chain
        const data = await contract.addCandidate.populateTransaction(ipfsHash);
        const user = await signer.getAddress();
        const request = {
            chainId: (await provider.getNetwork()).chainId,
            target: contractAddress,
            data: data.data,
            user: user,
        };

        const relayResponse = await relay.sponsoredCallERC2771(
            request,
            provider,
            VITE_GELATO_API_KEY        );

        console.log("Candidate added with IPFS hash!", relayResponse);
        // fetchCandidates(); // Refresh the candidate list
    } catch (error) {
        console.error("Error adding candidate:", error);
    }
};

// Example for decrypting and fetching candidate data
export  const fetchCandidateData = async (ipfsHash, secret) => {
    try {
        fromIpfs(ipfsHash)
    } catch (error) {
        console.error("Error fetching candidate data:", error);
    }
};
