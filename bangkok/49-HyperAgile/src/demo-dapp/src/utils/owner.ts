import { JsonRpcProvider, Wallet, SigningKey, Signature } from 'ethers';
import { TransactionReceipt, TransactionRequest } from 'ethers';
import { keccak256, toUtf8Bytes } from 'ethers';

import { moonbaseAlpha } from 'viem/chains';

export const provider = new JsonRpcProvider(process.env.PROVIDER, moonbaseAlpha.id);

const owner = new SigningKey(process.env.OWNER_PK as string);
const wallet = new Wallet(owner.privateKey, provider);

export function signMessage(message: string): Signature {
    const hashedMesage = keccak256(toUtf8Bytes(message));
    return owner.sign(hashedMesage);
}

export async function sendAsOwner(
    transaction: TransactionRequest,
    skipWait?: boolean
): Promise<TransactionReceipt | null> {
    const response = await wallet.sendTransaction(transaction);
    return skipWait ? null : await provider.waitForTransaction(response.hash);
}
