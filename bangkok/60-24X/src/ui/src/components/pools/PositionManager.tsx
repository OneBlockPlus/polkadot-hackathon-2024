import { useState } from 'react';
import { usePool } from '@/hooks/pools/usePool';
import { ArrowDownUp } from 'lucide-react';
import { formatNumber } from '@/lib/utils';
import type { UserPoolData, UserPosition } from '@/types/chain';

interface PositionManagerProps {
  poolId: string;
  position: UserPosition | null;
  pool: UserPoolData;
}

export const PositionManager = ({ poolId, position, pool }: PositionManagerProps) => {
  const [amount, setAmount] = useState('');
  const [operationType, setOperationType] = useState<'mint' | 'burn'>('mint');
  const { operations, isLoading } = usePool(poolId);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleOperation = async () => {
    if (!amount) return;
    
    try {
      setIsProcessing(true);
      if (operationType === 'mint') {
        await operations.mintSynth(amount);
      } else {
        await operations.burnSynth(amount);
      }
      setAmount('');
    } catch (err) {
      console.error('Operation failed:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-4">Position Manager</h2>
      
      <div className="mb-6">
        <p className="text-sm text-gray-600">Your Position</p>
        <p className="text-2xl font-bold">
          {position ? formatNumber(position.debt) : '0.00'} {pool.synthetic_asset.symbol}
        </p>
        <p className="text-sm text-gray-600">
          ≈ ${position ? formatNumber(Number(position.debt) * Number(pool.synthetic_asset.price)) : '0.00'}
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setOperationType('mint')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              operationType === 'mint'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Mint
          </button>
          <button
            onClick={() => setOperationType('burn')}
            className={`flex-1 py-2 px-4 rounded-lg transition-colors ${
              operationType === 'burn'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Burn
          </button>
        </div>

        <div className="space-y-2">
          <div className="relative">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Amount to ${operationType}`}
              className="w-full p-3 border rounded-lg pr-16"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
              {pool.synthetic_asset.symbol}
            </span>
          </div>
          {amount && (
            <p className="text-sm text-gray-600">
              ≈ ${formatNumber(Number(amount) * Number(pool.synthetic_asset.price))}
            </p>
          )}
        </div>

        <button
          onClick={handleOperation}
          disabled={isProcessing || !amount}
          className="w-full py-3 bg-blue-500 text-white rounded-lg disabled:bg-gray-300 
                   disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
        >
          {isProcessing ? (
            <span className="flex items-center justify-center gap-2">
              <ArrowDownUp className="animate-spin" />
              Processing...
            </span>
          ) : (
            `${operationType === 'mint' ? 'Mint' : 'Burn'} ${pool.synthetic_asset.symbol}`
          )}
        </button>
      </div>
    </div>
  );
};