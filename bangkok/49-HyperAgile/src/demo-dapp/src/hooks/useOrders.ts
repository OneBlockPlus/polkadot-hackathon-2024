import { OrdersContext } from '@/context/OrdersProvider';

import { useContext, useEffect } from 'react';
import { useAccount } from 'wagmi';

import Database from '@/services/Database';

const useOrders = () => {
    const { address } = useAccount();
    const { orders, setOrders } = useContext(OrdersContext);

    useEffect(() => {
        if (address) loadOrders(address);
    }, [address]);

    const addOrder = (order: Order) => {
        const copy = [...orders];
        copy.unshift(order);
        setOrders(copy);
    };

    const getOrder = (orderId: string): Order | undefined => {
        return orders.find((item) => item.orderId == orderId);
    };

    const updateOrderInList = (orderId: string, updated: Order) => {
        const copy = [...orders];
        for (let i = 0; i < copy.length; i++) {
            if (copy[i].orderId == orderId) {
                copy[i] = updated;
                break;
            }
        }
        setOrders(copy);
    };

    const loadOrders = async (address: string) => {
        const db = new Database();
        await db.authDatabase();
        const loaded = await db.getAllOrders(address);
        setOrders(
            loaded
                .sort((a, b) => b.timestamp - a.timestamp)
                .map((order) => {
                    order.status =
                        Date.now() - order.timestamp > 100_000 && order.status == 'processing'
                            ? 'failed'
                            : order.status;
                    return order;
                })
        );
    };

    return { orders, getOrder, addOrder, updateOrderInList };
};

export default useOrders;
