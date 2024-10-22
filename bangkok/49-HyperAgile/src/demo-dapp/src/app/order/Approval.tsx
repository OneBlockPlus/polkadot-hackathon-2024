'use client';

import Image from 'next/image';
import Link from 'next/link';

import { useCallback, useEffect, useRef, useState } from 'react';

import { JsonRpcProvider } from 'ethers';
import { moonbaseAlpha } from 'viem/chains';

import './approval.css';

export default function Approval({ order }: { order: Order | undefined }) {
    const [approvals, setApprovals] = useState<string[]>(['', '', '']);
    const provider = useRef(new JsonRpcProvider(process.env.PROVIDER, moonbaseAlpha.id));

    useEffect(() => {
        updateApprovals([...approvals]).then((data) => setApprovals(data));
    }, [order?.hashes.length, order?.status]);

    const updateApprovals = async (copy: string[]) => {
        if (!order) return copy;
        if (order.hashes.length > 4 && !copy[0])
            copy[0] = await setApprovalAddress(order.hashes[3]);
        if (order.hashes.length > 6 && !copy[1])
            copy[1] = await setApprovalAddress(order.hashes[5]);
        if (order.status == 'completed' && !copy[2])
            copy[2] = await setApprovalAddress(order.hashes[7]);
        return copy;
    };

    const setApprovalAddress = useCallback(async (hash: string): Promise<string> => {
        const transaction = await provider.current.getTransactionReceipt(hash);
        return transaction ? transaction.logs[transaction.logs.length - 1].topics[1] : '';
    }, []);

    return (
        <section className='approval'>
            <div id='header'>
                <h4>Human Operator Approval</h4>
                <div id='order-prop'>
                    <Image src={'/images/svg/power.svg'} alt='power' height={9} width={9} />
                    <h6>Mutli-Signatures</h6>
                </div>
            </div>

            {approvals.map((approval, index) => {
                const hash =
                    order && order.hashes.length >= 4 + index * 2
                        ? order?.hashes[3 + index * 2]
                        : 'empty';

                return (
                    <div key={index} className='approval-card'>
                        <div className='status'>
                            <Image
                                src={'/images/svg/approval.svg'}
                                alt='approval'
                                width={32}
                                height={32}
                                style={{ opacity: `${!approval ? 30 : 100}%` }}
                            />
                            <h6>
                                {index == 0 ? 'Picking' : index == 1 ? 'Packing' : 'Delivery'} Task
                            </h6>
                            {approval ? (
                                <h6>{`Approved by 0x...${approval.slice(approval.length - 4)}`}</h6>
                            ) : (
                                <div id='spinner'></div>
                            )}
                        </div>
                        {hash != 'empty' && (
                            <h6>
                                Extrinsic Hash: {hash.slice(0, 5) + '...' + hash.slice(61)}
                                <Image
                                    src={'/images/svg/copy.svg'}
                                    alt='copy'
                                    width={18}
                                    height={18}
                                    onClick={() => navigator.clipboard.writeText(order ? hash : '')}
                                />
                            </h6>
                        )}
                        <Link href={`${process.env.NEXT_PUBLIC_EXPLORER}/${hash}`} target='_blank'>
                            <Image
                                src={'/images/svg/open-explorer.svg'}
                                alt='link'
                                width={48}
                                height={48}
                            />
                        </Link>
                    </div>
                );
            })}
        </section>
    );
}
