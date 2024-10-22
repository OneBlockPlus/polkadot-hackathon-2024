import { useCallback, useEffect, useRef, useState } from 'react';

import Database from '@/services/Database';

import { readContract } from 'wagmi/actions';

import wagmi from '@/config/wagmi';

import productsData from '@/data/productsData';
import addresses from '@/data/addresses';

import ProductsABI from '@/contracts/ProductsABI.json';

const useProducts = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const database = useRef(new Database());

    const handleProductsLoad = useCallback(async () => {
        const prods: Product[] = [];
        const stocks = await database.current.getAllOffChainStocks();
        for (let prod of productsData) {
            prod.stock = stocks[prod.id].stock;
            prods.push(prod);
        }
        setProducts(prods);
    }, [products]);

    useEffect(() => {
        if (!products.length) handleProductsLoad();
        else setTimeout(() => handleProductsLoad(), 10_000);
    }, [products]);

    const updateProductStock = useCallback(
        (id: number, stock: number) => {
            const copy = products.map((prod) => {
                if (prod.id == id) prod.stock += stock;
                return prod;
            });
            setProducts(copy);
        },
        [products]
    );

    const refreshStocks = useCallback(async () => {
        if (!products.length) return;

        const stocks: number[] = [];
        for (let i = 0; i < products.length; i++) {
            const stock = await readContract(wagmi, {
                abi: ProductsABI,
                address: addresses.products,
                functionName: 'stock',
                args: [products[i].id],
            });
            stocks.push(Number(stock));
        }
        const copy = [...products].map((prod, id) => {
            prod.stock = stocks[id];
            return prod;
        });
        setProducts(copy);
        const db = new Database();
        copy.map(async (prod) => await db.fetchStock(prod.id, prod.stock));
    }, [products]);

    return { products, updateProductStock, refreshStocks };
};

export default useProducts;
