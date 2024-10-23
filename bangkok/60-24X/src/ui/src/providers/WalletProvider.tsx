// src/providers/WalletProvider.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { web3Enable, web3Accounts } from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

interface WalletContextType {
  account: InjectedAccountWithMeta | null;
  accounts: InjectedAccountWithMeta[];
  isConnecting: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  selectAccount: (account: InjectedAccountWithMeta) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export function WalletProvider({ children }: { children: ReactNode }) {
  const [account, setAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const connect = async () => {
    try {
      setIsConnecting(true);
      setError(null);
      
      const extensions = await web3Enable('DeFi App');
      if (extensions.length === 0) {
        throw new Error('No extension found');
      }

      const accounts = await web3Accounts();
      setAccounts(accounts);

      if (accounts.length > 0) {
        setAccount(accounts[0]); // Select first account by default
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to connect'));
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = () => {
    setAccount(null);
    setAccounts([]);
  };

  const selectAccount = (selectedAccount: InjectedAccountWithMeta) => {
    setAccount(selectedAccount);
  };

  return (
    <WalletContext.Provider
      value={{
        account,
        accounts,
        isConnecting,
        error,
        connect,
        disconnect,
        selectAccount,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};