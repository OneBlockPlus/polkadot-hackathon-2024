import {
    Interface,
    TransactionRequest,
    keccak256,
    toUtf8Bytes,
    parseEther,
    SigningKey,
    HDNodeWallet,
    Mnemonic,
    formatUnits,
} from 'ethers';

import { sendAsOwner, provider } from '@/utils/owner';

import addreses from '@/data/addresses';

import WarehouseABI from '@/contracts/WarehouseABI.json';
import PickingRobotABI from '@/contracts/PickingRobotABI.json';
import PackingRobotABI from '@/contracts/PackingRobotABI.json';
import DeliveryRobotABI from '@/contracts/DeliveryRobotABI.json';
import addresses from '@/data/addresses';

export default class Contracts {
    static async processOrder(orderId: string): Promise<string> {
        const encoded = new Interface(WarehouseABI).encodeFunctionData('processOrder', [orderId]);

        const tx: TransactionRequest = {
            to: addreses.warehouse,
            data: encoded,
        };

        const response = await sendAsOwner(tx);
        if (!response) throw new Error('Tx error');
        return response.hash;
    }

    static async deposit() {
        const balance = await provider.getBalance(addresses.warehouse);
        if (Number(formatUnits(balance, 'ether')) > 1) return;

        const warehouse = new Interface(WarehouseABI);
        const data = warehouse.encodeFunctionData('deposit', []);
        const tx: TransactionRequest = {
            to: addreses.warehouse,
            data,
            value: parseEther('1'),
        };
        await sendAsOwner(tx);
    }

    static async sendRequest(orderId: string, robotId: 0 | 1 | 2): Promise<bigint> {
        const warehouse = new Interface(WarehouseABI);
        const encodedRequest = warehouse.encodeFunctionData('generateRobotId', [orderId, robotId]);
        const requestTx: TransactionRequest = {
            to: addreses.warehouse,
            data: encodedRequest,
            value: parseEther('0.015'),
        };
        const requestResponse = await sendAsOwner(requestTx);
        if (!requestResponse) throw new Error('Tx error');

        const requestId = warehouse.decodeEventLog(
            'RequestRobotId',
            requestResponse.logs[0].data
        )[1];
        console.log(`RequestId - ${requestId}`);

        return requestId;
    }

    static async fulfillRequest(requestId: bigint) {
        await new Promise((resolve) => setTimeout(resolve, 25_000));

        const warehouse = new Interface(WarehouseABI);

        const fulfillTx: TransactionRequest = {
            to: addreses.warehouse,
            data: warehouse.encodeFunctionData('fulfillRequest', [requestId]),
        };
        await sendAsOwner(fulfillTx, true);
    }

    static async pickOrder(orderId: string): Promise<string> {
        const mnemonicInstance = Mnemonic.fromPhrase(process.env.MNEMONIC as any);
        const wallet = HDNodeWallet.fromMnemonic(mnemonicInstance, "m/44'/63'/0'/0/0");
        console.log(wallet.address);
        const key = new SigningKey(wallet.privateKey);
        const signature = key.sign(keccak256(toUtf8Bytes(orderId)));

        const encoded = new Interface(PickingRobotABI).encodeFunctionData('pickOrder', [
            orderId,
            wallet.address,
            signature.v,
            signature.r,
            signature.s,
        ]);

        const tx: TransactionRequest = {
            to: addreses.picker,
            data: encoded,
        };

        const response = await sendAsOwner(tx);
        if (!response) throw new Error('Tx error');
        return response.hash;
    }

    static async packOrder(orderId: string): Promise<string> {
        const mnemonicInstance = Mnemonic.fromPhrase(process.env.MNEMONIC as any);
        const wallet = HDNodeWallet.fromMnemonic(mnemonicInstance, "m/44'/64'/0'/0/0");
        console.log(wallet.address);
        const key = new SigningKey(wallet.privateKey);
        const signature = key.sign(keccak256(toUtf8Bytes(orderId)));

        const encoded = new Interface(PackingRobotABI).encodeFunctionData('packOrder', [
            orderId,
            wallet.address,
            signature.v,
            signature.r,
            signature.s,
        ]);

        const tx: TransactionRequest = {
            to: addreses.packer,
            data: encoded,
        };

        const response = await sendAsOwner(tx);
        if (!response) throw new Error('Tx error');
        return response.hash;
    }

    static async deliverOrder(orderId: string): Promise<string> {
        const mnemonicInstance = Mnemonic.fromPhrase(process.env.MNEMONIC as any);
        const wallet = HDNodeWallet.fromMnemonic(mnemonicInstance, "m/44'/65'/0'/0/0");
        console.log(wallet.address);
        const key = new SigningKey(wallet.privateKey);
        const signature = key.sign(keccak256(toUtf8Bytes(orderId)));

        const encoded = new Interface(DeliveryRobotABI).encodeFunctionData('deliverOrder', [
            orderId,
            wallet.address,
            signature.v,
            signature.r,
            signature.s,
        ]);

        const tx: TransactionRequest = {
            to: addreses.deliverer,
            data: encoded,
        };

        const response = await sendAsOwner(tx);
        if (!response) throw new Error('Tx error');
        return response.hash;
    }
}
