'use client';

import Image from 'next/image';

import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAccount, useDisconnect } from 'wagmi';

import { moonbaseAlpha } from 'viem/chains';

import './home-layout.css';

export default function HomeLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const router = useRouter();
    const pathname = usePathname();

    const { isConnected, address, chainId, connector } = useAccount();
    const { disconnect } = useDisconnect();

    useEffect(() => {
        if (!isConnected) router.push('/');
    }, [isConnected]);

    useEffect(() => {
        if (chainId != undefined && chainId != moonbaseAlpha.id && !connector?.switchChain)
            alert(`Wrong chain, change the chain`);
        else if (chainId != moonbaseAlpha.id)
            connector?.switchChain?.({ chainId: moonbaseAlpha.id });
    }, [chainId]);

    return (
        <>
            <nav>
                <Image
                    className='logo'
                    src={'/images/svg/logo.svg'}
                    alt='logo'
                    width={66}
                    height={54}
                />
                <div className='wallet'>
                    <Image src={'/images/wallet.png'} alt='wallet-logo' width={36} height={36} />
                    <h4>{address ? `0x...${address?.slice(38, 42)}` : 'Loading...'}</h4>
                    <h6 onClick={() => setTimeout(() => disconnect(), 100)}>Disconnect Wallet</h6>
                </div>
            </nav>
            <main className='home-layout'>
                <div className='selector'>
                    {[['Store'], ['Track', 'package'], ['Inventory']].map((section, index) => (
                        <button
                            key={index}
                            id={
                                pathname.includes(section[0].toLowerCase())
                                    ? 'black-button'
                                    : 'white-button'
                            }
                            onClick={() => router.push(`/home/${section[0].toLowerCase()}`)}
                        >
                            <Image
                                src={`/images/svg/${(section.length == 2
                                    ? section[1]
                                    : section[0]
                                ).toLowerCase()}.svg`}
                                alt='store'
                                width={21}
                                height={21}
                            />
                            {section[0]}
                        </button>
                    ))}
                </div>
                {children}
            </main>
        </>
    );
}
