import { useMemo } from 'react';
import { usePolkadot } from '@/providers/PolkadotProvider';
import { createPalletQueries } from '@/lib/polkadot/queries';
import { createPalletTransactions } from '@/lib/polkadot/transactions';

export const useApi = () => {
  const { api } = usePolkadot();

  const pallets = useMemo(() => {
    if (!api) return null;

    return {
      queries: createPalletQueries(api),
      tx: createPalletTransactions(api)
    };
  }, [api]);

  return {
    api,
    pallets,
    isReady: !!api
  };
};