// src/hooks/useCollateralOperations.ts
import { useState } from 'react';
import { useApi } from './useApi';
import { useWallet } from '@/providers/WalletProvider';
import { useToast } from '@chakra-ui/react';

export function useCollateralOperations(pool_id: string) {
  const { pallets } = useApi();
  const { account } = useWallet();
  const [is_processing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const toast = useToast();

  const handleTransaction = async (
    operation: 'deposit' | 'withdraw',
    asset_id: string,
    amount: string
  ) => {
    if (!pallets || !account) throw new Error('Not connected');
    setError(null);

    try {
      setIsProcessing(true);
      const tx = operation === 'deposit'
        ? await pallets.tx.reserve.depositCollateral(pool_id, asset_id, amount)
        : await pallets.tx.reserve.withdrawCollateral(pool_id, asset_id, amount);

      await new Promise((resolve, reject) => {
        tx.signAndSend(
          account.address,
          { signer: account.signer },
          ({ status, dispatchError }) => {
            if (status.isInBlock) {
              toast({
                title: 'Transaction Successful',
                description: `Successfully ${operation}ed ${amount} collateral`,
                status: 'success',
                duration: 5000,
                isClosable: true,
              });
              resolve(status.asInBlock);
            } else if (dispatchError) {
              const errorMessage = dispatchError.toString();
              setError(errorMessage);
              reject(new Error(errorMessage));
            }
          }
        ).catch(reject);
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Transaction failed';
      setError(message);
      toast({
        title: 'Transaction Failed',
        description: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const deposit_collateral = async (asset_id: string, amount: string) => {
    return handleTransaction('deposit', asset_id, amount);
  };

  const withdraw_collateral = async (asset_id: string, amount: string) => {
    return handleTransaction('withdraw', asset_id, amount);
  };

  return {
    deposit_collateral,
    withdraw_collateral,
    is_processing,
    error
  };
}