'use client';

import Image from 'next/image';
import ProductCard from '@/components/ProductCard';
import SimulationMethods from './SimulationMethods';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useAccount } from 'wagmi';
import useOrders from '@/hooks/useOrders';

import Database from '@/services/Database';

import { generateOrderId, generateRandomValue } from '@/utils/generator';
import { encodeBatchSome, encodeCallPermit, encodePlaceOrder } from '@/utils/functionEncoder';

import addresses from '@/data/addresses';

import './order-form.css';
import { signPermitPrecompile } from '@/utils/permitPrecompile';
import { sendAsOwner } from '@/utils/owner';

interface Props {
    product: Product;
    setSelectedProduct: React.Dispatch<React.SetStateAction<Product | undefined>>;
}

export default function OrderForm({ product, setSelectedProduct }: Props) {
    const { addOrder } = useOrders();
    const { address } = useAccount();
    const [isProcessing, setIsProcessing] = useState(false);

    const [countdown, setCountdown] = useState(15);

    const name = useRef('');
    const phone = useRef('');
    const deliveryAddress = useRef('');
    const orderId = useRef('');

    const [isApproved, setIsApproved] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            const form = document.querySelector('div.order-background') as HTMLElement;
            form.style.animation = 'none';
        }, 800);
    }, []);

    useEffect(() => {
        if (countdown == 0) handleCloseForm();
        else
            setTimeout(() => {
                if (!isProcessing) setCountdown(countdown - 1);
            }, 1000);
    }, [countdown]);

    const handleCloseForm = useCallback(async () => {
        const form = document.querySelector('div.order-background') as HTMLElement;
        form.style.animation = 'form-appear 750ms ease-out reverse forwards';
        const db = new Database();
        await db.reduceOnHold(product.id, false);
        setTimeout(() => setSelectedProduct(undefined), 800);
    }, [setSelectedProduct]);

    const handleOrderCreation = useCallback(async () => {
        if (!name.current || !phone.current || !deliveryAddress.current) {
            alert('Fill the form');
            return;
        }

        setIsProcessing(true);

        orderId.current = generateOrderId(address as string);

        try {
            const productPrice = BigInt(0);

            const placeOrderEncoded = encodePlaceOrder(orderId.current, product.id);
            const encodedBatch = encodeBatchSome(productPrice, placeOrderEncoded);
            const callPermitArgs = await signPermitPrecompile(
                address as string,
                productPrice,
                encodedBatch
            );

            const encodedCallPermit = encodeCallPermit(callPermitArgs);
            const receipt = await sendAsOwner({
                to: addresses.callPermit,
                data: encodedCallPermit,
                value: productPrice,
            });

            if (!receipt || receipt.status == 0) throw new Error('Tx error');

            const newOrder: Order = {
                orderId: orderId.current,
                status: 'processing',

                productId: product.id,
                productName: product.name,
                productImage: product.image,

                hashes: [receipt.hash, 'empty'],
                robots: [-1, -1, -1],

                mailingInfo: {
                    name: name.current,
                    phone: phone.current,
                    address: deliveryAddress.current,
                },

                receiptId: '',

                timestamp: Math.floor(Date.now() / 1000),
            };

            const db = new Database();
            await db.addOrder(address as string, orderId.current, newOrder);
            await db.reduceOnHold(product.id, true);

            addOrder(newOrder);
            setIsApproved(true);
        } catch (error) {
            handleCloseForm();
            alert(error);
        }
    }, [setIsProcessing, setIsApproved]);

    return (
        <div className='order-background'>
            {isApproved ? (
                <SimulationMethods orderId={orderId.current} />
            ) : (
                <section className='order-form'>
                    <div className='header'>
                        <h1>Order Form</h1>
                        <div className='countdown'>
                            <Image
                                src={'/images/svg/calender.svg'}
                                alt='calender'
                                width={25}
                                height={25}
                            />
                            <h6>
                                Congrats! This product is currently on-hold for you. Please proceed{' '}
                                <br />
                                with the order in 00:{countdown < 10
                                    ? `0${countdown}`
                                    : countdown}{' '}
                                before it is release.
                            </h6>
                        </div>
                    </div>

                    <ProductCard product={product} withButon={false} />
                    <div className='form'>
                        <Input id='name' name='Name' valueRef={name} />
                        <Input id='phone' name='Phone Number' valueRef={phone} />
                        <Input id='address' name='Address' valueRef={deliveryAddress} />
                        <button id='black-button' onClick={handleOrderCreation}>
                            {isProcessing ? (
                                <div id='spinner' style={{ filter: 'invert(1)' }}></div>
                            ) : (
                                `Place Order with ${product.price} GLMR`
                            )}
                        </button>
                    </div>
                    <Image
                        src={'/images/svg/cross.svg'}
                        alt='cross'
                        width={18}
                        height={18}
                        onClick={handleCloseForm}
                    />
                </section>
            )}
        </div>
    );
}

interface InputProps {
    name: string;
    id: string;
    valueRef: React.MutableRefObject<string>;
}

function Input({ name, id, valueRef }: InputProps) {
    const handleRandomizeValue = useCallback(() => {
        valueRef.current = generateRandomValue(id);
        const element = document.querySelector(`.order-form #${id}`) as HTMLInputElement;
        element.value = valueRef.current;
    }, [id]);

    return (
        <div>
            <label htmlFor={id}>{name}</label>
            {id == 'address' ? (
                <textarea id={id} onChange={(event) => (valueRef.current = event.target.value)} />
            ) : (
                <input id={id} onChange={(event) => (valueRef.current = event.target.value)} />
            )}
            <Image
                src={'/images/svg/randomize.svg'}
                alt='dice'
                width={27}
                height={27}
                onClick={handleRandomizeValue}
            />
        </div>
    );
}
