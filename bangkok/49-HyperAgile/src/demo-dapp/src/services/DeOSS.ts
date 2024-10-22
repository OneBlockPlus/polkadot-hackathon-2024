// import '@polkadot/wasm-crypto/initWasmAsm';

// import { stringToU8a, u8aToHex } from '@polkadot/util';
// import { Keyring } from '@polkadot/keyring';

export async function uploadReceipt(
    order: Order,
    approvals: string[],
    stock: number
): Promise<string> {
    const receipt: Receipt = {
        orderId: order.orderId,
        dispatcher: process.env.OWNER_ADDRESS as string,
        detailLog: {
            warehouseProcessing: order.hashes[0],
            warehouseProcessed: order.hashes[1],
            productPicking: order.hashes[2],
            productPicked: order.hashes[3],
            productPacking: order.hashes[4],
            productPacked: order.hashes[5],
            orderDelivering: order.hashes[6],
            orderDelivered: order.hashes[7],
        },
        approval: {
            pickingTask: approvals[0],
            packingTask: approvals[1],
            deliveryTask: approvals[2],
        },
        onChainStock: stock,
        timestamp: Date.now(),
    };

    // const keyring = new Keyring({ type: 'sr25519', ss58Format: 2 });

    // const owner = keyring.addFromMnemonic(process.env.DEOSS_MNEMONIC as string);

    // const message = stringToU8a(order.orderId);
    // const signature = owner.sign(message);
    // const isValid = owner.verify(message, signature, owner.publicKey);
    // console.log(isValid, u8aToHex(signature));

    const result = await fetch(`${process.env.DEOSS_GATEWAY}/object`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            Account: process.env.DEOSS_ADDRESS as string,
            Message: 'hyperagile',
            Signature:
                'YOUR SIGNATURE HERE',
            Bucket: process.env.DEOSS_ADDRESS as string,
            Territory: 'hyperagile',
        },
        body: JSON.stringify(receipt),
    });

    const response = await result.json();

    return response.fid;
}
