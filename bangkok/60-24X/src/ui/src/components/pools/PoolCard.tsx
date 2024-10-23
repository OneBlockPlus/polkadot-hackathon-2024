"use client";
import type { UserPoolData } from '@/types/chain';
interface PoolCardProps {
  pool: UserPoolData;
}

import Image from 'next/image';
import Link from 'next/link';
import { formatNumber, hexToAscii } from '@/lib/utils';

export const PoolCard = ({ pool }: PoolCardProps) => {
  const synthetic_asset = pool.synthetic_asset;
  const utilization = pool.debt_amount === '0' 
    ? 0 
    : (Number(pool.debt_amount) / Number(pool.params.debt_ceiling)) * 100;

  const name = hexToAscii(synthetic_asset.name);
  const symbol = hexToAscii(synthetic_asset.symbol);
  if(!name || !symbol) return null;

  return (
    <Link 
      href={`/pools/${pool.id}`}
      className="block p-6 bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <div className="w-12 h-12 mr-4">
            <Image 
              src={`/assets/${name}.svg`}
              alt={name}
              width={48} 
              height={48} 
            />
          </div>
        <div>
          <h3 className="text-lg font-semibold">{symbol}</h3>
          <p className="text-sm text-gray-600">{name}</p>
        </div>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium">Price</p>
          <p className="text-lg">${formatNumber(Number(synthetic_asset.price) / 10**8)}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Total Debt</span>
          <span className="font-medium">${formatNumber(pool.debt_amount || '0')}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Debt Ceiling</span>
          <span className="font-medium">${pool.params.debt_ceiling.length < 20 ? formatNumber(pool.params.debt_ceiling) : '∞'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Utilization</span>
          <span className="font-medium">{utilization.toFixed(2)}%</span>
        </div>

        {/* Utilization Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-500 h-2 rounded-full"
            style={{ width: `${utilization}%` }}
          />
        </div>

        <div className="flex justify-between text-sm mt-4">
          <span className={pool.params.is_minting_allowed ? 'text-green-600' : 'text-red-600'}>
            {pool.params.is_minting_allowed ? 'Minting Enabled' : 'Minting Disabled'}
          </span>
          <span className={pool.params.is_burning_allowed ? 'text-green-600' : 'text-red-600'}>
            {pool.params.is_burning_allowed ? 'Burning Enabled' : 'Burning Disabled'}
          </span>
        </div>
      </div>
    </Link>
  );
};