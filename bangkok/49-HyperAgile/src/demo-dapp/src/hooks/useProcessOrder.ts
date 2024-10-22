import { Log } from 'viem';
import { JsonRpcProvider } from 'ethers';

import { useCallback, useEffect, useState } from 'react';
import useOrders from './useOrders';
import { useAccount, useWatchContractEvent } from 'wagmi';
import { readContract } from 'wagmi/actions';

import Database from '@/services/Database';
import { uploadReceipt } from '@/services/DeOSS';

import WarehouseABI from '@/contracts/WarehouseABI.json';
import ProductsABI from '@/contracts/ProductsABI.json';

import addresses from '@/data/addresses';
import { moonbaseAlpha } from 'viem/chains';

import wagmi from '@/config/wagmi';
import Contracts from '@/class/HyperAgileContracts';
import { generateRobotId } from '@/utils/generateRandomNumber';

const useProcessOrder = (ngrokUrl: string | null) => {
    const { address } = useAccount();
    const { updateOrderInList } = useOrders();

    const [order, setOrder] = useState<Order>();
    const [simulationStatus, setSimulationStatus] = useState<SimulatorStatus>('processing');

    const handleOrderLogs = useCallback(
        (logs: Log[]) => {
            if (!order) return;
            const hashes = order.hashes;
            const robots = order.robots;

            for (let baseLog of logs) {
                const log = baseLog as any;
                if (log.args.orderId != order.orderId) continue;
                if (hashes.includes(log.transactionHash)) continue;
                if (log.eventName == 'ActivityVerifier' || log.eventName == 'RequestRobotId')
                    continue;
                if (log.eventName == 'AssingRobot') {
                    robots[log.args.activity] = Number(log.args.robotId);
                }
                hashes[hashes.length - 1] = log.transactionHash;
                if (hashes.length < 8) hashes.push('empty');
            }

            setOrder({ ...order, hashes, robots });
        },
        [order]
    );

    useWatchContractEvent({
        address: addresses.warehouse,
        abi: WarehouseABI,
        onLogs(logs) {
            handleOrderLogs(logs);
        },
        pollingInterval: 1000,
    });

    const handleOrderCompleting = useCallback(async (order: Order, address: string) => {
        const stock = await readContract(wagmi, {
            abi: ProductsABI,
            address: addresses.products,
            functionName: 'stock',
            args: [order.productId],
        });

        const provider = new JsonRpcProvider(process.env.PROVIDER, moonbaseAlpha.id);

        const approvals: string[] = [];
        let transaction: any = await provider.getTransactionReceipt(order.hashes[3]);
        approvals.push(transaction.logs[transaction.logs.length - 1].topics[1]);
        transaction = await provider.getTransactionReceipt(order.hashes[5]);
        approvals.push(transaction.logs[transaction.logs.length - 1].topics[1]);
        transaction = await provider.getTransactionReceipt(order.hashes[7]);
        approvals.push(transaction.logs[transaction.logs.length - 1].topics[1]);

        const receiptId = await uploadReceipt(order, approvals, Number(stock));

        const copy = { ...order };
        copy.status = 'completed';
        if (receiptId) copy.receiptId = receiptId;

        const database = new Database();
        await database.completeOrder(address, copy);

        setOrder(copy);
        updateOrderInList(order.orderId, order);
    }, []);

    useEffect(() => {
        if (!order || !address) return;

        if (order.status != 'completed' && order.hashes.length == 8 && order.hashes[7] != 'empty')
            handleOrderCompleting(order, address);
    }, [order?.hashes.length, order?.hashes[7]]);

    useEffect(() => {
        if (!order) return;
        const length = order.hashes.length;

        if (order.status == 'completed') setSimulationStatus('completed');
        else
            setSimulationStatus(
                length == 4
                    ? 'picking'
                    : length == 6
                    ? 'packing'
                    : length == 8
                    ? 'delivery'
                    : 'processing'
            );
    }, [order]);

    useEffect(() => {
        if (!order || order.status == 'completed' || !ngrokUrl) return;

        const length = order.hashes.length;

        if (length == 5 || length == 7)
            Contracts.deposit().then(
                async () => await generateRobotId(order.orderId, length == 5 ? 1 : 2)
            );

        if (length != 4 && length != 6 && length != 8) return;
        fetch('/api/order/local', {
            method: 'POST',
            body: JSON.stringify({
                orderId: order.orderId,
                stage: length == 4 ? 1 : length == 6 ? 2 : 3,
                productNameId: order.productName[order.productName.length - 1],
                url: ngrokUrl,
            }),
        });
    }, [order?.hashes.length]);

    return { order, setOrder, simulationStatus };
};

export default useProcessOrder;
