import { ApiPromise } from '@polkadot/api';

export const createPalletTransactions = (api: ApiPromise) => ({
  pools: {
    mint(poolId: string, amount: string) {
      return api.tx.pools.mint(poolId, amount);
    },

    burn(poolId: string, amount: string) {
      return api.tx.pools.burn(poolId, amount);
    },

    faucet(assetId: string, amount: string) {
      return api.tx.pools.faucet(assetId, amount);
    }
  },

  reserve: {
    depositCollateral(poolId: string, assetId: string, amount: string) {
      return api.tx.reserve.depositCollateral(poolId, assetId, amount);
    },

    withdrawCollateral(poolId: string, assetId: string, amount: string) {
      return api.tx.reserve.withdrawCollateral(poolId, assetId, amount);
    },

    liquidate(liquidator: string, account: string, poolId: string, assetId: string, maxAmount: string) {
      return api.tx.reserve.liquidate(liquidator, account, poolId, assetId, maxAmount);
    }
  },

  riskManager: {
    updatePoolParameters(poolId: string, params: any) {
      return api.tx.riskManager.updatePoolParameters(poolId, params);
    },

    updateCollateralParameters(poolId: string, assetId: string, params: any) {
      return api.tx.riskManager.updateCollateralParameters(poolId, assetId, params);
    },

    updateGlobalRiskParameters(params: any) {
      return api.tx.riskManager.updateGlobalRiskParameters(params);
    }
  }
});