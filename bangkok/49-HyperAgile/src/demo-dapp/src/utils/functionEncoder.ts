import { Interface } from 'ethers';
import { signMessage } from './owner';

import addresses from '@/data/addresses';

import ShopABI from '@/contracts/ShopABI.json';
import BatchABI from '@/contracts/BatchABI.json';
import CallPermitABI from '@/contracts/CallPermitABI.json';

export function encodePlaceOrder(orderId: string, productId: number): string {
    const signature = signMessage(orderId);
    const shopInterface = new Interface(ShopABI);
    return shopInterface.encodeFunctionData('placeOrder', [
        orderId,
        productId,
        signature.v,
        signature.r,
        signature.s,
    ]);
}

export function encodeBatchSome(productPrice: bigint, placeOrderEncoded: string): string {
    const batchInterface = new Interface(BatchABI);
    return batchInterface.encodeFunctionData('batchSome', [
        [addresses.shop],
        [productPrice],
        [placeOrderEncoded],
        [0],
    ]);
}

export function encodeCallPermit(args: any[]): string {
    const callPermitInterface = new Interface(CallPermitABI);
    return callPermitInterface.encodeFunctionData('dispatch', args);
}
