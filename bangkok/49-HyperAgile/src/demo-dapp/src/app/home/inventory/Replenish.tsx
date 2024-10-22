'use client';

import Link from 'next/link';
import Image from 'next/image';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Interface, TransactionRequest } from 'ethers';

import Database from '@/services/Database';

import ProductsABI from '@/contracts/ProductsABI.json';

import addresses from '@/data/addresses';
import { sendAsOwner } from '@/utils/owner';

import './replenish.css';

interface Props {
    product: Product;
    setProduct: React.Dispatch<React.SetStateAction<Product | undefined>>;
    updateProductStock: (id: number, stock: number) => void;
}

export default function Replenish({ product, setProduct, updateProductStock }: Props) {
    const [hash, setHash] = useState('');

    const amount = useRef(0);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            const form = document.querySelector('div.replenish-background') as HTMLElement;
            form.style.animation = 'none';
        }, 800);
    }, []);

    const handleReplenish = useCallback(async () => {
        try {
            setIsProcessing(true);

            const warehouse = new Interface(ProductsABI);
            const data = warehouse.encodeFunctionData('replenish', [product.id, amount.current]);
            const tx: TransactionRequest = {
                to: addresses.products,
                data,
            };
            const receipt = await sendAsOwner(tx);

            setIsProcessing(false);

            if (!receipt || receipt.status != 1) throw new Error('Transaction Error');

            const db = new Database();
            await db.replenish(product.id, amount.current);

            setHash(receipt.hash);
            updateProductStock(product.id, amount.current);

            setIsSuccess(receipt.status == 1);
        } catch (error: any) {
            alert(error.message);
            setIsProcessing(false);
            setIsSuccess(false);
        }
    }, [setIsSuccess, setIsProcessing]);

    const handleCloseReplenish = useCallback(() => {
        const form = document.querySelector('div.replenish-background') as HTMLElement;
        form.style.animation = 'form-appear 750ms ease-out reverse forwards';
        setTimeout(() => setProduct(undefined), 800);
    }, []);

    return (
        <div className='replenish-background'>
            <section className='replenish'>
                <h1>Replenish Stock</h1>
                <div className='product'>
                    <Image src={product.image} alt='product' width={128} height={128} />
                    <h4>{product.name}</h4>
                </div>
                {isSuccess ? (
                    <div className='stock'>
                        <h5>Current On-Chain Stock Level</h5>
                        <h1>{product.stock}</h1>
                    </div>
                ) : (
                    <div className='adding'>
                        <div className='stock'>
                            <h5>Current On-Chain Stock Level</h5>
                            <h1>{product.stock}</h1>
                        </div>
                        <Image src='/images/svg/plus.svg' alt='plus' width={32} height={32} />
                        <input
                            type='number'
                            placeholder='Amount'
                            onChange={(event) => (amount.current = Number(event.target.value))}
                        />
                    </div>
                )}
                <button
                    id='black-button'
                    onClick={() => (isSuccess ? handleCloseReplenish() : handleReplenish())}
                >
                    {isSuccess ? (
                        'Back to Inventory'
                    ) : isProcessing ? (
                        <div id='spinner' style={{ filter: 'invert(1)' }}></div>
                    ) : (
                        'Replenish'
                    )}
                </button>
                {hash && (
                    <Link href={`${process.env.NEXT_PUBLIC_EXPLORER}${hash}`} target='_blank'>
                        View on Subscan
                    </Link>
                )}
                <Image
                    src={'/images/svg/cross.svg'}
                    alt='cross'
                    width={18}
                    height={18}
                    onClick={handleCloseReplenish}
                />
            </section>
        </div>
    );
}
