// src/hooks/usePoolDetail.ts
import { useCallback, useEffect, useState } from 'react';
import { useApi } from './useApi';
import { useWallet } from '@/providers/WalletProvider';
import type { UserPoolData, UserCollateralData } from '@/types/chain';

export const usePoolDetail = () => {
  const { pallets } = useApi();
  const { account } = useWallet();
  const [pools, setPools] = useState<any[] | null>(null);
  const [position, setPosition] = useState<any[] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchPoolData = useCallback(async () => {
    if (!pallets) return;
    
    try {
      setIsLoading(true);
      const DUMMY = "5CY7psennQRJm9PFg59r8Dd6DSwr7D8LgzBX3mwRKP3uy6ee";
      const pools = await pallets.queries.pools.getAllPools(DUMMY);
      
      const data = await Promise.all(pools.map(async (pool) => {
        // Fetch and update pool collaterals data
        const collaterals = await pallets.queries.reserve.getUserPosition(pool.id, DUMMY);
        return {
          ...pool,
          collaterals
        }
      }));

      if (!data) throw new Error('Pool not found');
      
      setPools(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch pool data'));
    } finally {
      setIsLoading(false);
    }
  }, [pallets]);

  // Data about the user's position in the pool
  const fetchPosition = useCallback(async () => {
    if (!pallets || !account) return;
    
    try {
      setIsLoading(true);
      
      console.log("fetching position", account, pallets);
      // const data = {}await pallets.queries.reserve.getUserPosition(poolId, account.address);

      // // Calculate total collateral value
      // const total_collateral_value = data.reduce(
      //   (sum, col) => sum + (Number(col.balance) * Number(col.asset.price)),
      //   0
      // ).toString();

      setPosition({
        debt: '0',
        health_factor: '0',
        collateral: [],
        total_collateral_value: '0'
      });
    } catch (err) {
      console.log("Error fetching position", err);
      setError(err instanceof Error ? err : new Error('Failed to fetch position'));
    } finally {
      setIsLoading(false);
    }
  }, [pallets, account]);

  const mint = useCallback(async (amount: string, poolId: string) => {
    if (!pallets || !account) throw new Error('Not connected');
    
    const tx = pallets.tx.pools.mint(poolId, amount);
    return tx;
  }, [pallets, account]);

  const burn = useCallback(async (amount: string, poolId: string) => {
    if (!pallets || !account) throw new Error('Not connected');
    
    const tx = pallets.tx.pools.burn(poolId, amount);
    return tx;
  }, [pallets, account]);

  useEffect(() => {
    fetchPoolData();
    if (account) fetchPosition();
  }, [fetchPoolData, fetchPosition, account]);

  return {
    pools,
    position,
    isLoading,
    error,
    operations: {
      mint,
      burn
    },
    refetch: {
      pool: fetchPoolData,
      position: fetchPosition
    }
  };
};