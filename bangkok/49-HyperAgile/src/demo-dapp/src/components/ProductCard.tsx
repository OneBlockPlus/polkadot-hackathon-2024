'use client';

import Image from 'next/image';
import Link from 'next/link';
import React from 'react';
import SkeletonCard from '@/utils/SkeletonCard';

import addresses from '@/data/addresses';

import './product-card.css';

interface Props {
    product: Product | undefined;
    withButon: boolean;
    setSelectedProduct?: React.Dispatch<React.SetStateAction<Product | undefined>>;
}

export default function ProductCard({ product, withButon, setSelectedProduct }: Props) {
    return !product ? (
        <SkeletonCard />
    ) : (
        <section className='product-card'>
            <>
                <section
                    className='info'
                    style={withButon ? {} : { boxShadow: '-10px 10px var(--text)' }}
                >
                    <h2>{product.name}</h2>
                    <Image src={product.image} alt='product-image' width={160} height={160} />
                    <section className='details'>
                        <div className='stock'>
                            <h3>{product.stock}</h3>
                            <h5>Stock</h5>
                        </div>
                        <div className='price'>
                            <h3>{product.price}</h3>
                            <h5>GLMR</h5>
                        </div>
                    </section>
                    {withButon ? (
                        <button
                            id='black-button'
                            onClick={() => (setSelectedProduct ? setSelectedProduct(product) : {})}
                        >
                            Order
                        </button>
                    ) : (
                        <></>
                    )}
                </section>
                <Link
                    href={`https://moonbase.moonscan.io/address/${addresses.products}`}
                    target='_blank'
                >
                    Product Contract on Moonscan
                </Link>
                <Link href={product.uri} target='_blank'>
                    Inventory File on Pinata
                </Link>
            </>
        </section>
    );
}
