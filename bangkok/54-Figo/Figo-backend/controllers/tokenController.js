import ethers from 'ethers';
import NFTSchema from '../database/models/modelNFT.js';

import { provider } from '../constants/provider.js';

import { fetchIPFSMetadata, hash } from '../utils/ipfs.js';

import CNFTABI from '../ABI/CNFT.json' assert { type: 'json' };
const CNFT = new ethers.utils.Interface(CNFTABI);

export async function mintParent(req, res) {
    try {
        const { NFCUID, parentType, signedData } = req.body;
        if (!NFCUID) throw new Error('No NFCUID was provided');
        if (!parentType) throw new Error('No parent id was provided');
        if (!signedData) throw new Error('No signed data were provide');

        const tx = await provider.sendTransaction(signedData);
        const receipt = await provider.waitForTransaction(tx.hash);
        if (receipt.status == 0) throw new Error('Transaction Failed');
        const event = receipt.logs[receipt.logs.length - 1];

        const decoded = CNFT.decodeEventLog('MintParent', event.data);
        if (!decoded.tokenId) throw new Error('Failed to get token Id from tx receipt');

        const metadata = await fetchIPFSMetadata(parentType);
        const newNFT = new NFTSchema({
            TokenID: decoded.tokenId,
            AssetType: 'Parent',
            IPFS: hash,
            DateMinted: Date.now(),
            Name: metadata.name,
            Owner: NFCUID,
        });
        await newNFT.save();

        // ! Error is here
        // await NFTSchema.findByIdAndUpdate(NFCUID, { $push: { NFTCollection: newNFT._id } });

        res.status(200).json({ hash: tx.hash, tokenId: Number(decoded.tokenId) });
    } catch (error) {
        res.status(500).json({ error: `${error}` });
    }
}

export const mintChild = async (req, res) => {
    try {
        const { NFCUID, parentId, signedData } = req.body;
        if (!NFCUID) throw new Error('No NFCUID was provided');
        if (!parentId) throw new Error('No parent id was provided');
        if (!signedData) throw new Error('No signed data was provided');
        // ! Need to revert if this parent already has a child (get it via your db)

        const tx = await provider.sendTransaction(signedData);
        const receipt = await provider.waitForTransaction(tx.hash);
        if (receipt.status == 0) throw new Error('Transaction Failed');

        const event = receipt.logs[receipt.logs.length - 1];
        const decoded = CNFT.decodeEventLog('EquipChild', event.data);
        const childTokenId = Number(decoded.childTokenId);

        await NFTSchema.findOneAndUpdate({ TokenID: childTokenId }, { ParentTokenID: parentId });

        res.status(200).json({ hash: tx.hash, childTokenId });
    } catch (error) {
        res.status(500).json({ error: `${error}` });
    }
};

export const equipChild = async (req, res) => {
    try {
        const { NFCUID, parentId, equipmentType, signedData } = req.body;
        if (!NFCUID) throw new Error('No NFCUID was provided');
        if (!parentId) throw new Error('No parent id was provided');
        if (!equipmentType) throw new Error('No equipment type id was provided');
        if (!signedData) throw new Error('No signed data was provided');
        // ! Need to revert if this parent already has equipped child (get it via your db)

        const tx = await provider.sendTransaction(signedData);
        const receipt = await provider.waitForTransaction(tx.hash);
        if (receipt.status == 0) throw new Error('Transaction Failed');

        const event = receipt.logs[receipt.logs.length - 1];
        const decoded = CNFT.decodeEventLog('EquipChild', event.data);
        const childTokenId = Number(decoded.childTokenId);

        // await findOneAndUpdate({ TokenID: childTokenId }, { ParentTokenID: parentId });

        res.status(200).json({ hash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: `${error}` });
    }
};

export const unequipChild = async (req, res) => {
    try {
        const { NFCUID, parentId, equipmentType, signedData } = req.body;
        if (!NFCUID) throw new Error('No NFCUID was provided');
        if (!parentId) throw new Error('No parent id was provided');
        if (!equipmentType) throw new Error('No equipment type id was provided');
        if (!signedData) throw new Error('No signed data was provided');
        // ! Need to revert is equipment is not equipped

        const tx = await provider.sendTransaction(signedData);
        const receipt = await provider.waitForTransaction(tx.hash);
        if (receipt.status == 0) throw new Error('Transaction Failed');

        res.status(200).json({ hash: tx.hash });
    } catch (error) {
        res.status(500).json({ error: `${error}` });
    }
};
