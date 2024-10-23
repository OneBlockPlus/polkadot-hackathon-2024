import { ApiPromise } from '@polkadot/api';
import type { PalletQueries } from '../types/queries';
import { formatChainData } from '../config';

export const createPalletQueries = (api: ApiPromise): PalletQueries => ({
  pools: {
    // Storage queries
    async poolsByAsset(assetId: string) {
      const result = await api.query.pools.poolsByAsset(assetId);
      return result.toString();
    },

    async poolTotalDebt(poolId: string) {
      const result = await api.query.pools.poolTotalDebt(poolId);
      return result.toString();
    },

    async userDebt(poolId: string, account: string) {
      const result = await api.query.pools.userDebt([poolId, account]);
      return result.toString();
    },

    async getTotalPools() {
      const result = await api.query.pools.totalPools();
      return result.toString();
    },

    // RPC queries
    async getAllPools(account: string) {
      try {
        // Try RPC method first
        const result = await api.rpc.pools.getAllPools(account);
        return result.toJSON();
      } catch {
        // Fallback to custom query implementation
        const totalPools = await api.query.pools.totalPools();
        const pools = [];
        
        for (let i = 1; i <= totalPools.toNumber(); i++) {
          const poolId = api.createType('PoolId', i);
          const params = await api.query.riskManager.poolParameters(poolId);
          const debt = await api.query.pools.poolTotalDebt(poolId);
          pools.push({
            id: poolId,
            debt_amount: debt,
            params: params.toJSON()
          });
        }
        
        return pools;
      }
    },

    async getUserPools(account: string) {
      return api.rpc.pools.getUserPools(account);
    }
  },

  reserve: {
    async userCollateral(poolId: string, assetId: string, account: string) {
      const result = await api.query.reserve.userCollateral([poolId, assetId, account]);
      return result.toString();
    },

    async poolCollateral(poolId: string, index: number) {
      const result = await api.query.reserve.poolCollateral([poolId, index]);
      return result.toString();
    },

    async totalCollaterals(poolId: string) {
      const result = await api.query.reserve.totalCollaterals(poolId);
      return result.toNumber();
    },

    async totalCollateralBalance(poolId: string, assetId: string) {
      const result = await api.query.reserve.totalCollateralBalance([poolId, assetId]);
      return result.toString();
    },

    async getUserPosition(poolId: string, account: string) {
      try {
        const result = await api.rpc.reserve.getUserPosition(poolId, account);
        return result.toJSON();
      } catch {
        const totalCollaterals = await api.query.reserve.totalCollaterals(poolId);
        const positions = [];
        
        for (let i = 1; i <= totalCollaterals.toNumber(); i++) {
          const assetId = await api.query.reserve.poolCollateral([poolId, i]);
          const balance = await api.query.reserve.userCollateral([poolId, assetId, account]);
          const params = await api.query.riskManager.collateralParameters([poolId, assetId]);
          
          if (!balance.isZero()) {
            positions.push({
              asset_id: assetId,
              balance: balance,
              params: params.toJSON()
            });
          }
        }
        
        return positions;
      }
    }
  },

  riskManager: {
    async poolParameters(poolId: string) {
      const result = await api.query.riskManager.poolParameters(poolId);
      return result.toJSON();
    },

    async collateralParameters(poolId: string, assetId: string) {
      const result = await api.query.riskManager.collateralParameters([poolId, assetId]);
      return result.toJSON();
    },

    async globalRiskState() {
      const result = await api.query.riskManager.globalRiskState();
      return result.toJSON();
    },

    async getHealthFactor(poolId: string, account: string) {
      const result = await api.query.riskManager.getHealthFactor(poolId, account);
      return result.toString();
    },

    async isLiquidatable(poolId: string, account: string) {
      const result = await api.query.riskManager.isLiquidatable(poolId, account);
      return result.isTrue;
    },

    async isPositionHealthy(poolId: string, account: string) {
      const result = await api.query.riskManager.isPositionHealthy(poolId, account);
      return result.isTrue;
    },

    async canMint(account: string, poolId: string, amount: string) {
      const result = await api.query.riskManager.canMint([account, poolId, amount]);
      return result.isTrue;
    }
  },

  oracle: {
    async prices(assetId: string) {
      const result = await api.query.oracle.prices(assetId);
      return result.isNone ? null : [result.unwrap()[0].toString(), result.unwrap()[1].toNumber()];
    }
  }
});