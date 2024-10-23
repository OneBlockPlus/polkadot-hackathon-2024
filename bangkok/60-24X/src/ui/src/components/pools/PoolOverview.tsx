import { formatNumber } from '@/lib/utils';
import type { UserPoolData } from '@/types/chain';
import { ArrowUpDown, Info } from 'lucide-react';

export const PoolOverview = ({ pool }: { pool: UserPoolData }) => {
  const utilization = pool.debtAmount === '0' 
    ? 0 
    : (Number(pool.debtAmount) / Number(pool.params.debt_ceiling)) * 100;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold">{pool.synthetic_asset.symbol} Pool</h1>
            {pool.params.is_enabled ? (
              <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                Active
              </span>
            ) : (
              <span className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                Inactive
              </span>
            )}
          </div>
          <p className="text-gray-600 mt-1">{pool.synthetic_asset.name}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Current Price</p>
          <p className="text-2xl font-bold">${formatNumber(pool.synthetic_asset.price)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="Total Debt"
          value={`$${formatNumber(pool.debtAmount)}`}
          info="Total synthetic assets minted"
        />
        <StatsCard
          label="Debt Ceiling"
          value={`$${formatNumber(pool.params.debt_ceiling)}`}
          info="Maximum allowed debt"
        />
        <StatsCard
          label="Utilization"
          value={`${utilization.toFixed(2)}%`}
          info="Current utilization rate"
        />
      </div>

      {/* Utilization Progress Bar */}
      <div className="mt-4">
        <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
          <div 
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${utilization}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>0%</span>
          <span>{utilization.toFixed(1)}% Used</span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

const StatsCard = ({ label, value, info }: { label: string; value: string; info: string }) => (
  <div className="bg-gray-50 p-4 rounded-lg relative group">
    <p className="text-sm text-gray-600 flex items-center gap-2">
      {label}
      <Info size={14} className="text-gray-400 cursor-help" />
    </p>
    <p className="text-xl font-semibold">{value}</p>
    <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 w-48 p-2 bg-gray-800 text-white text-xs rounded mb-2">
      {info}
    </div>
  </div>
);