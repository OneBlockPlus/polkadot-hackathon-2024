import ethers, { Wallet } from 'ethers';

import { provider } from '../constants/provider.js';
import addresses from '../constants/addresses.js';

import CNFTABI from '../ABI/CNFT.json' assert { type: 'json' };

export default async function (req, res, next) {
    const CNFT = new ethers.utils.Interface(CNFTABI);
    const user = new Wallet(
        `0xcb50b8b1cc75068dcc0c39897f83bdb178c108a4f5e7739bef400b9cb7e197d8`,
        provider
    );
    const mintTx = CNFT.encodeFunctionData('addEquipment', [
        req.body.parentId,
        req.body.equipmentType,
        req.body.equipmentSubType,
    ]);
    const request = {
        to: addresses.cNFT,
        data: mintTx,
        gasPrice: (await provider.getGasPrice()).mul(2),
        gasLimit: ethers.utils.hexlify(3_000_000),
        chainId: 1287,
        nonce: await provider.getTransactionCount(user.address),
    };
    const signedData = await user.signTransaction(request);
    req.body.signedData = signedData;
    next();
}
