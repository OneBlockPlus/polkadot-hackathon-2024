'use client';

import Image from 'next/image';

import { useRouter } from 'next/navigation';
import useOrders from '@/hooks/useOrders';

import './track.css';

export default function Track() {
    const router = useRouter();
    const { orders } = useOrders();

    return (
        <section className='orders'>
            <h2>
                Total Order(s) <span>{orders.length}</span>
            </h2>
            <section className='order-list'>
                {orders.map((order, index) => (
                    <div
                        key={index}
                        className='order-card'
                        onClick={() => {
                            if (order.status == 'completed')
                                router.push(`/order?id=${order.orderId}`);
                        }}
                    >
                        <Image
                            src={'/images/svg/package.svg'}
                            alt='package'
                            width={34}
                            height={34}
                        />
                        <div className='status' id={order.status}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </div>
                        <h2>{order.orderId}</h2>
                    </div>
                ))}
            </section>
        </section>
    );
}
