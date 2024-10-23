// src/providers/PolkadotProvider.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ApiPromise } from '@polkadot/api';
import { initApi, CHAIN_NAME } from '@/lib/polkadot/config';

interface PolkadotContextType {
  api: ApiPromise | null;
  isLoading: boolean;
  error: Error | null;
  chainName: string;
}

const PolkadotContext = createContext<PolkadotContextType | undefined>(undefined);

export function PolkadotProvider({ children }: { children: ReactNode }) {
  const [api, setApi] = useState<ApiPromise | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        const api = await initApi();
        setApi(api);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to connect to chain'));
      } finally {
        setIsLoading(false);
      }
    };

    init();

    return () => {
      if (api) {
        api.disconnect();
      }
    };
  }, []);

  return (
    <PolkadotContext.Provider
      value={{
        api,
        isLoading,
        error,
        chainName: CHAIN_NAME,
      }}
    >
      {children}
    </PolkadotContext.Provider>
  );
}

export const usePolkadot = () => {
  const context = useContext(PolkadotContext);
  if (context === undefined) {
    throw new Error('usePolkadot must be used within a PolkadotProvider');
  }
  return context;
};