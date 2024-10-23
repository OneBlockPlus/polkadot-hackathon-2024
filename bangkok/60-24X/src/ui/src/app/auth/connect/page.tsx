'use client';

import { usePolkadot } from '@/providers/PolkadotProvider';
import { useWallet } from '@/providers/WalletProvider';

export default function TestConnection() {
  const { api, isLoading } = usePolkadot();
  const { connect, account } = useWallet();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Connection Test</h1>
      <p>Chain connected: {api ? 'Yes' : 'No'}</p>
      <p>Account: {account ? account.address : 'Not connected'}</p>
      <button onClick={connect}>Connect Wallet</button>
    </div>
  );
}