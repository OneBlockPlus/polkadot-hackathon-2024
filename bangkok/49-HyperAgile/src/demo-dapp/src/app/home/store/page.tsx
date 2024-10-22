'use client';

import ProductCard from '@/components/ProductCard';
import OrderForm from './OrderForm';

import { useEffect, useRef, useState } from 'react';
import useProducts from '@/hooks/useProducts';

import Database from '@/services/Database';

import './store.css';

export default function Store() {
    const [selectedProduct, setSelectedProduct] = useState<Product>();

    const database = useRef(new Database());

    const { products, refreshStocks } = useProducts();

    useEffect(() => {
        refreshStocks();
    }, [products.length]);

    useEffect(() => {
        if (selectedProduct) database.current.addOnHold(selectedProduct.id);
    }, [selectedProduct]);

    return (
        <section className='products'>
            {selectedProduct && (
                <OrderForm product={selectedProduct} setSelectedProduct={setSelectedProduct} />
            )}
            {(products.length ? products : new Array(3).fill(undefined)).map((item, index) => (
                <ProductCard
                    key={index}
                    product={item}
                    withButon={true}
                    setSelectedProduct={setSelectedProduct}
                />
            ))}
        </section>
    );
}
