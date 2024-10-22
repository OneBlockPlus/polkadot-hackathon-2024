'use client';

import Image from 'next/image';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAccount, useConnect } from 'wagmi';

import walletLinks from '@/data/walletLinks';

import './connection.css';

export default function Connection() {
    const router = useRouter();

    const { connectors, connect } = useConnect();
    const { isConnected } = useAccount();
    const [connecting, setConnecting] = useState(false);

    useEffect(() => {
        if (connecting)
            setTimeout(() => {
                const connectPopup = document.querySelector(
                    'main.connection > div.background'
                ) as HTMLElement;
                connectPopup.style.animation = 'none';
            }, 700);
    }, [connecting]);

    useEffect(() => {
        if (isConnected) router.push('/home/store');
    }, [isConnected]);

    return (
        <main className='connection'>
            {connecting && (
                <div className='background'>
                    <section className='connectors'>
                        <Image
                            src={'/images/svg/cross.svg'}
                            alt='cross'
                            width={18}
                            height={18}
                            onClick={() => {
                                const connectPopup = document.querySelector(
                                    'main.connection > div.background'
                                ) as HTMLElement;
                                connectPopup.style.animation =
                                    'form-appear 600ms ease-in reverse forwards';

                                setTimeout(() => setConnecting(false), 700);
                            }}
                        />
                        {Object.keys(walletLinks).map((wallet) => (
                            <div key={wallet}>
                                <Image
                                    src={`/images/wallets/${wallet}.svg`}
                                    alt='wallet'
                                    width={50}
                                    height={50}
                                />
                                <button
                                    onClick={() => {
                                        const connector = connectors.find(
                                            (cnt) => cnt.id == wallet
                                        );
                                        if (connector) connect({ connector });
                                        else window.open(walletLinks[wallet], '_blank');
                                    }}
                                >
                                    {wallet.split('.')[1][0].toUpperCase() +
                                        wallet.split('.')[1].slice(1)}
                                </button>
                            </div>
                        ))}
                    </section>
                </div>
            )}
            <Image src={'/images/svg/logo.svg'} alt='logo' width={73} height={60} />
            <h1>An Ecommerce Store on Moonbase Alpha Run By Robots.</h1>
            <div className='powered'>
                <Image src={'/images/svg/power.svg'} alt='power' width={26} height={26} />
                <h2>A demo powered by HyperAgile</h2>
            </div>
            <button id='black-button' onClick={() => setConnecting(true)}>
                Connect to HyperAgile Store
            </button>
            <Image src={'/images/svg/main-screen.svg'} alt='picture' width={500} height={500} />
        </main>
    );
}
