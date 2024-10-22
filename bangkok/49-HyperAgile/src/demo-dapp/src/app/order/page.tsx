'use client';

import Image from 'next/image';
import Link from 'next/link';
import Simulator from './Simulator';
import Approval from './Approval';
import Warning from './Warning';
import VRFToaster from '@/components/VRFToaser';

import { useSearchParams } from 'next/navigation';
import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import useOrders from '@/hooks/useOrders';
import useProcessOrder from '@/hooks/useProcessOrder';
import { useAccount } from 'wagmi';

import Contracts from '@/class/HyperAgileContracts';

import { generateRobotId } from '@/utils/generateRandomNumber';
import logs from '@/data/logs';

import './order-info.css';

function OrderInfo() {
    const router = useRouter();
    const { address } = useAccount();
    const { orders, getOrder } = useOrders();

    const searchParams = useSearchParams();
    const orderId = searchParams.get('id') as string;
    const simulationMethod = searchParams.get('method') as string;
    const ngrokUrl = searchParams.get('url');

    const { order, setOrder, simulationStatus } = useProcessOrder(ngrokUrl);

    const [design, setDesign] = useState(false);

    useEffect(() => {
        if (!orders.length || order) return;

        const loaded = getOrder(orderId);
        loaded ? setOrder(loaded) : router.push('/home/store');
    }, [orders]);

    const processOnline = useCallback(async () => {
        await Contracts.processOrder(orderId);
        await Contracts.deposit();
        await generateRobotId(orderId, 0);
        await new Promise((resolve) => setTimeout(resolve, 40_000));

        await Contracts.pickOrder(orderId);
        await Contracts.deposit();
        await generateRobotId(orderId, 1);
        await new Promise((resolve) => setTimeout(resolve, 35_000));

        await Contracts.packOrder(orderId);
        await Contracts.deposit();
        await generateRobotId(orderId, 2);
        await new Promise((resolve) => setTimeout(resolve, 40_000));

        await Contracts.deliverOrder(orderId);
    }, []);

    const processLocal = useCallback(async () => {
        await Contracts.processOrder(orderId);
        await Contracts.deposit();
        await generateRobotId(orderId, 0);
    }, []);

    const [isLoaded, setIsLoaded] = useState(false);
    useEffect(() => {
        if (!order || order.status == 'completed' || isLoaded || !address) return;
        setIsLoaded(true);
        ngrokUrl ? processLocal() : processOnline();
    }, [order, address]);

    return (
        <>
            <Warning order={order} />
            <main className='order-info'>
                <VRFToaster order={order} />
                <div className='order-id'>
                    <h1>{order ? order.orderId : '000000'}</h1>
                    <h5 id={order ? order.status : 'processing'}>
                        {order
                            ? order.status.charAt(0).toUpperCase() + order.status.slice(1)
                            : 'Loading'}
                    </h5>
                    {order && order.status == 'completed' && order.receiptId && (
                        <div className='receipt'>
                            <Image
                                src={'/images/svg/approval.svg'}
                                alt='approval'
                                width={20}
                                height={20}
                            />
                            <Link
                                href={`${process.env.DEOSS_GATEWAY}/open/${order.receiptId}.json`}
                                target='_blank'
                            >
                                Recorded on CESS DeOSS
                            </Link>
                        </div>
                    )}
                </div>
                <section className='order-details'>
                    <div className='product'>
                        <h4>Order</h4>
                        <Image
                            src={order ? order.productImage : '/'}
                            alt='product-image'
                            height={32}
                            width={32}
                        />
                        <h5>{order ? order.productName : 'Product'}</h5>
                    </div>
                    <div className='mailing-info'>
                        <h4>Mailing Info</h4>
                        <h5>{order ? order.mailingInfo.name : 'Loading'}</h5>
                        <h5>{order ? order.mailingInfo.phone : 'Loading'}</h5>
                        <h5>{order ? order.mailingInfo.address : 'Loading'}</h5>
                    </div>
                    <div className='dispatcher'>
                        <div>
                            <h4>Dispatched By:</h4>
                            <h5>
                                {process.env.OWNER_ADDRESS?.slice(0, 5) +
                                    '...' +
                                    process.env.OWNER_ADDRESS?.slice(37)}
                            </h5>
                            <Image
                                src={'/images/svg/copy.svg'}
                                alt='copy'
                                width={18}
                                height={18}
                                onClick={() =>
                                    navigator.clipboard.writeText(
                                        process.env.OWNER_ADDRESS as string
                                    )
                                }
                            />
                        </div>
                        <div id='order-prop'>
                            <Image src={'/images/svg/power.svg'} alt='power' height={9} width={9} />
                            <h6>Moonbeam Call Permit</h6>
                        </div>
                    </div>
                </section>
                <section className='load-assignment'>
                    <div id='header'>
                        <h4>Load Assignment</h4>
                        <div id='order-prop'>
                            <Image src={'/images/svg/power.svg'} alt='power' height={9} width={9} />
                            <h6>Moonbeam VRF</h6>
                        </div>
                    </div>

                    {order?.robots.map((robot, index) => {
                        const hash =
                            order.hashes.length > 3 + index * 2
                                ? order.hashes[2 + index * 2]
                                : 'empty';
                        return (
                            <div key={index} className='assignment-card'>
                                <Link
                                    href={`${process.env.NEXT_PUBLIC_EXPLORER}/${hash}`}
                                    target='_blank'
                                    className='open-full'
                                >
                                    <Image
                                        src={'/images/svg/open-full.svg'}
                                        alt='full'
                                        height={9}
                                        width={9}
                                    />
                                </Link>

                                <Image
                                    src={'/images/svg/crane.svg'}
                                    alt='crane'
                                    height={67}
                                    width={58}
                                />

                                <div className='data'>
                                    <h5>
                                        {index == 0
                                            ? 'Product Picking'
                                            : index == 1
                                            ? 'Order Packing'
                                            : 'Parcel Delivery'}
                                    </h5>
                                    <div>ROBOT ID</div>
                                    {robot != -1 ? <h4>{robot}</h4> : <div id='spinner'></div>}
                                </div>

                                {hash != 'empty' && (
                                    <h6 className='hash'>
                                        Extrinsic Hash: {hash.slice(0, 5) + '...' + hash.slice(61)}
                                        <Image
                                            src={'/images/svg/copy.svg'}
                                            alt='copy'
                                            width={18}
                                            height={18}
                                            onClick={() => navigator.clipboard.writeText(hash)}
                                        />
                                    </h6>
                                )}
                            </div>
                        );
                    })}
                </section>
                <Simulator
                    order={order}
                    simulationStatus={simulationStatus}
                    productName={order ? order.productName : ''}
                    simulationMethod={simulationMethod}
                    setDesign={setDesign}
                />
                {design && (
                    <section className='simulation-design'>
                        <h3>About the Webot simulation setup</h3>
                        <h5>
                            The robots simulated in the Webot scenes are programmed to perform
                            warehouse operations based on the activity on the Moonbase Alpha
                            blockchain, and will also report back to the Moonbase Alpha blockchain
                            once jobs are completed. Our team had built a simulated warehouse scene
                            to demonstrate how robots deal with product picking, parcel packing, and
                            parcel delivery:
                        </h5>
                        <div>
                            <Image
                                src={'/images/simulation-design.png'}
                                alt='design'
                                width={630}
                                height={413}
                            />
                            <Image src={'/images/arrow.png'} alt='arrow' width={16} height={16} />
                            <h6>Warehouse Simulation Design</h6>
                        </div>
                    </section>
                )}
                <section className='detail-log'>
                    <div id='header'>
                        <h4>Detail Log</h4>
                        <div id='order-prop'>
                            <Image
                                src={'/images/svg/important.svg'}
                                alt='important'
                                height={9}
                                width={9}
                            />
                            <h6>Click to view on Moonscan</h6>
                        </div>
                    </div>
                    <div className='logs'>
                        {order?.hashes
                            .map((hash, index) => (
                                <div key={index} className='log'>
                                    <div className='status'>
                                        {index < order.hashes.length - 1 ||
                                        order.status == 'completed' ? (
                                            <Image
                                                src={'/images/svg/marked.svg'}
                                                alt='completed'
                                                width={18}
                                                height={18}
                                            />
                                        ) : (
                                            <div id='spinner'></div>
                                        )}
                                        {logs[index]}
                                    </div>
                                    <h6 className='hash'>
                                        Extrinsic Hash:{' '}
                                        {hash == 'empty'
                                            ? '0x000...00000'
                                            : hash.slice(0, 5) + '...' + hash.slice(61)}
                                        <Image
                                            src={'/images/svg/copy.svg'}
                                            alt='copy'
                                            width={18}
                                            height={18}
                                            onClick={() => navigator.clipboard.writeText(hash)}
                                        />
                                    </h6>
                                    <Link
                                        href={`${process.env.NEXT_PUBLIC_EXPLORER}/${hash}`}
                                        target='_blank'
                                    >
                                        <Image
                                            src={'/images/svg/open-explorer.svg'}
                                            alt='link'
                                            width={48}
                                            height={48}
                                        />
                                    </Link>
                                </div>
                            ))
                            .reverse()}
                    </div>
                </section>
                <Approval order={order} />
            </main>
        </>
    );
}

export default function Page() {
    return (
        <Suspense>
            <OrderInfo />
        </Suspense>
    );
}
