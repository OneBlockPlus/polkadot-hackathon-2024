import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { get, Database, getDatabase, ref, update } from 'firebase/database';

import config from '@/config/firebase.json';

export default class Firebase {
    private database: Database;
    private isAuthed = false;

    constructor() {
        const app = initializeApp(config);
        this.database = getDatabase(app);
    }

    async authDatabase() {
        const auth = getAuth(initializeApp(config));
        await signInWithEmailAndPassword(
            auth,
            process.env.FIREBASE_MAIL as string,
            process.env.FIREBASE_PASSWORD as string
        );
        this.database = getDatabase(auth.app);
    }

    async getAllOrders(address: string): Promise<Order[]> {
        const snapshot = await get(ref(this.database, `/orders/${address}`));
        if (!snapshot.exists()) return [];

        const orders: any[] = Object.values(snapshot.val());
        const corrected = orders.map((order) => {
            return {
                ...order,
                hashes: order.hashes ? Object.values(order.hashes) : [],
                robots: order.hashes ? Object.values(order.robots) : [],
            };
        });

        return corrected;
    }

    async getOrder(address: string, orderId: string): Promise<Order> {
        if (!this.isAuthed) await this.authDatabase();
        const snapshot = await get(ref(this.database, `/orders/${address}/${orderId}`));
        return snapshot.val();
    }

    async addOrder(address: string, orderId: string, data: Order) {
        if (!this.isAuthed) await this.authDatabase();
        const updates: any = {};
        updates[`/orders/${address}/${orderId}`] = data;
        await update(ref(this.database), updates);
    }

    async completeOrder(address: string, uncompletedOrder: Order) {
        if (!this.isAuthed) await this.authDatabase();
        const updates: any = {};
        uncompletedOrder.status = 'completed';
        updates[`/orders/${address}/${uncompletedOrder.orderId}`] = uncompletedOrder;
        await update(ref(this.database), updates);
    }

    // Off chain stocks

    async getOffChainStock(productId: number): Promise<OffChainStock> {
        const snapshot = await get(ref(this.database, `/stocks/${productId}`));
        return snapshot.val();
    }

    async getAllOffChainStocks(): Promise<OffChainStock[]> {
        const snapshot = await get(ref(this.database, `/stocks`));
        const stocks: OffChainStock[] = Object.values(snapshot.val());
        return stocks;
    }

    async replenish(productId: number, amount: number) {
        if (!this.isAuthed) await this.authDatabase();
        const snapshot = await get(ref(this.database, `/stocks/${productId}/stock`));
        const updates: any = {};
        updates[`/stocks/${productId}/stock`] = snapshot.val() + amount;
        await update(ref(this.database), updates);
    }

    async addOnHold(productId: number) {
        if (!this.isAuthed) await this.authDatabase();
        const updates: any = {};

        const data = await this.getOffChainStock(productId);
        data.onHold++;
        data.stock--;

        updates[`/stocks/${productId}`] = data;
        await update(ref(this.database), updates);
    }

    async reduceOnHold(productId: number, isSuccess: boolean) {
        if (!this.isAuthed) await this.authDatabase();
        const updates: any = {};

        const data = await this.getOffChainStock(productId);
        data.onHold--;
        if (!isSuccess) data.stock++;

        updates[`/stocks/${productId}`] = data;
        await update(ref(this.database), updates);
    }

    async fetchStock(productId: number, stock: number) {
        if (!this.isAuthed) await this.authDatabase();
        const updates: any = {};
        updates[`/stocks/${productId}/stock`] = stock;
        await update(ref(this.database), updates);
    }
}
