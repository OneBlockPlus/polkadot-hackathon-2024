export {};

declare global {
    type OffChainStock = {
        onHold: number;
        stock: number;
    };

    type CallPermitMessage = {
        from: string;
        to: string;
        value: BigInt;
        data: string;
        gaslimit: BigInt;
        nonce: BigInt;
        deadline: number;
    };

    interface Product {
        id: number;
        name: string;
        image: string;
        uri: string;
        price: number;
        stock: number;
    }

    interface Order {
        orderId: string;
        status: 'processing' | 'completed' | 'failed';

        productName: string;
        productId: id;
        productImage: string;

        mailingInfo: {
            name: string;
            phone: string;
            address: string;
        };

        hashes: string[];
        robots: number[];

        receiptId?: string;

        timestamp: number;
    }

    interface Receipt {
        orderId: string;
        dispatcher: string;
        detailLog: {
            warehouseProcessing: string;
            warehouseProcessed: string;
            productPicking: string;
            productPicked: string;
            productPacking: string;
            productPacked: string;
            orderDelivering: string;
            orderDelivered: string;
        };
        approval: {
            pickingTask: string;
            packingTask: string;
            deliveryTask: string;
        };
        onChainStock: number;
        timestamp: number;
    }

    interface Toaster {
        open: boolean;
        description: boolean;
    }

    type SimulatorStatus = 'processing' | 'picking' | 'packing' | 'delivery' | 'completed';

    type ConnectionMethod = undefined | 'petra' | 'google';

    type BoxColor = 'purple' | 'green' | 'blue';
}
