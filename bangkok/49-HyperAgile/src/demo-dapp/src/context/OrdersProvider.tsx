'use client';

import { createContext, Dispatch, ReactNode, SetStateAction, useState } from 'react';

export const OrdersContext = createContext<{
    orders: Order[];
    setOrders: Dispatch<SetStateAction<Order[]>>;
}>({
    orders: [],
    setOrders: () => {},
});

export function OrdersProvider({ children }: { children: ReactNode }) {
    const [orders, setOrders] = useState<Order[]>([]);
    return (
        <OrdersContext.Provider value={{ orders, setOrders }}>{children}</OrdersContext.Provider>
    );
}
