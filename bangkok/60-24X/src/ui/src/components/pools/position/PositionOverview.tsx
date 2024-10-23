// src/components/position/PositionOverview.tsx
import { formatNumber } from '@/lib/utils';
import { HealthIndicator } from './HealthIndicator';
import type { UserPosition, UserCollateralData } from '@/types/chain';
import { Coins, TrendingUp, ArrowUpDown } from 'lucide-react';

interface PositionOverviewProps {
  poolId: string;
  position: UserPosition;
  collateral: UserCollateralData[];
  syntheticPrice: string;
}

export const PositionOverview = ({ 
  poolId, 
  position, 
  collateral, 
  syntheticPrice 
}: PositionOverviewProps) => {
  const totalCollateralValue = collateral.reduce(
    (sum, col) => sum + (Number(col.balance) * Number(col.asset.price)),
    0
  );
  
  const totalDebtValue = Number(position.debt) * Number(syntheticPrice);
  
  const utilizationRate = totalCollateralValue > 0 
    ? (totalDebtValue / totalCollateralValue) * 100 
    : 0;

  return (
    <div className="space-y-6">
      {/* Health Factor */}
      <HealthIndicator poolId={poolId} />

      {/* Position Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-blue-600 mb-2">
            <Coins className="h-5 w-5" />
            <h3 className="font-medium">Total Collateral</h3>
          </div>
          <p className="text-2xl font-bold">${formatNumber(totalCollateralValue)}</p>
          <p className="text-sm text-gray-500 mt-1">
            {collateral.length} asset{collateral.length !== 1 ? 's' : ''}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-purple-600 mb-2">
            <TrendingUp className="h-5 w-5" />
            <h3 className="font-medium">Total Debt</h3>
          </div>
          <p className="text-2xl font-bold">${formatNumber(totalDebtValue)}</p>
          <p className="text-sm text-gray-500 mt-1">
            Current Rate: ${formatNumber(syntheticPrice)}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-2 text-green-600 mb-2">
            <ArrowUpDown className="h-5 w-5" />
            <h3 className="font-medium">Utilization</h3>
          </div>
          <p className="text-2xl font-bold">{formatNumber(utilizationRate)}%</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
            <div 
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${Math.min(utilizationRate, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Collateral Breakdown */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Collateral Breakdown</h3>
        <div className="space-y-3">
          {collateral.map((col) => {
            const value = Number(col.balance) * Number(col.asset.price);
            const percentage = (value / totalCollateralValue) * 100;
            
            return (
              <div key={col.asset.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="font-medium">{col.asset.symbol}</span>
                    <span>${formatNumber(value)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-gray-500">
                    <span>{formatNumber(col.balance)} tokens</span>
                    <span>{formatNumber(percentage)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-blue-500 h-1.5 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};