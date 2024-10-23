import Navbar from '@/components/Navbar'
import Section from '@/components/Section'
import Image from 'next/image'
import Link from 'next/link'

import { useState } from 'react';
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import dynamic from 'next/dynamic'
const web3Accounts = dynamic(() => import('@polkadot/extension-dapp'), { ssr: false });
const web3Enable = dynamic(() => import('@polkadot/extension-dapp'), { ssr: false });

const Home = () => {
    const [account, setAccount] = useState(InjectedAccountWithMeta);
    const [selectedAccount, setSelectedAccount] = useState(InjectedAccountWithMeta);

    async function connectWallet() {
        const { web3Enable, web3Accounts } = await import("@polkadot/extension-dapp");
        const extensions = web3Enable("Polki");

        if (!extensions) {
            throw Error("No Extension Found");
        }

        const allAccounts = await web3Accounts();

        console.log(allAccounts);

        if (allAccounts.length === 1) {
            setSelectedAccount(allAccounts[0]);
        }
    }

    return (
        <Section id="home">
            <div className="absolute top-0 left-0 h-full w-full z-[1]">
                <Image src="/image/bgweb.jpg" alt="background" fill className="object-cover" />
            </div>
            <Navbar />
            <div className="relative h-[70vh] z-[10] flex justify-center items-center">
                <div className="flex flex-col justify-center items-center text-center  text-white">
                    <h1 className="text-5xl">Get Your Coffe Card</h1>
                    <p className="text-2xl mt-2 mb-10 font-md tracking-wider">One platform select your favourable coffee</p>
                    <Link href="#menu" scroll={false} className="bg-gray-800 px-[2rem] py-[8px] rounded-xl scroll-smoth">
                        <p className="font-semibold tracking-wider">MENU</p>
                    </Link>
                        {
                            <Link href="#menu" scroll={false} className="bg-gray-800 px-[2rem] py-[8px] rounded-xl scroll-smoth mt-4">
                                <button onClick={connectWallet}>Connect Wallet</button>
                            </Link>
                        }
                        {
                            selectedAccount ? selectedAccount.address : null
                        }
                </div>
            </div>
        </Section>
    )
}

export default Home