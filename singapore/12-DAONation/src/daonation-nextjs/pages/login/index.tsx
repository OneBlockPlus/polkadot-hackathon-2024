import Head from 'next/head';
import { useEffect, useState } from 'react';
import LoginCard from '../../components/components/LoginCard';
import { useRouter } from 'next/router';
import Cookies from 'js-cookie';

import { useConnectWallet } from '@subwallet-connect/react';
import useEnvironment from '../../contexts/EnvironmentContext';

export default function Login() {
  const [isConnected, setIsConnected] = useState(false);
  const [step, setStep] = useState(1);

  const [{ wallet }, connect] = useConnectWallet();
  const { getCommunityBranding, isSubdomain } = useEnvironment();

  const router = useRouter();

  useEffect(() => {
    setConnectionStatus();
  }, [wallet]);

  useEffect(() => {
    if (isConnected) {
      if (isSubdomain()) {
        window.location.href = `/daos/${getCommunityBranding().polkadotReferenceId}`;
      } else {
         window.location.href = '/joined';
      }
    }
  }, [isConnected, router]); // Dependency array

  const setConnectionStatus = async () => {
    if (Cookies.get('loggedin') === 'true' && wallet != null) {
      setIsConnected(true);
    } else {
      setIsConnected(false);
    }
  };

  async function onConnectPolkadot() {
    await connect();

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 2);

    setIsConnected(true);
  }

  return (
    <>
      <Head>
        <title>Login</title>
        <meta name="description" content="DAOnation - Login" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={`gap-8 flex w-full bg-gohan pt-10 pb-6 border-beerus border`}>
        <div className="container flex flex-col gap-2 w-full justify-between">
          <h1 className="text-moon-32 font-bold">Login to your account</h1>
          <p>Step {step} of 2</p>
        </div>
      </div>
      <div className="container flex flex-col items-center !pt-8 gap-10">{<LoginCard setStep={setStep} step={step} isConnected={isConnected} onConnectPolkadot={onConnectPolkadot} />}</div>
    </>
  );
}
