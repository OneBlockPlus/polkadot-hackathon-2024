import { Balance, UserCollateralData, UserPoolData } from "@/types/chain";

export interface PalletQueries {
	pools: {
		// Storage queries
		poolsByAsset(assetId: string): Promise<string>; // returns PoolId
		poolTotalDebt(poolId: string): Promise<string>; // returns Balance
		userDebt(poolId: string, account: string): Promise<string>; // returns Balance
		getTotalPools(): Promise<string>; // returns PoolId

		// RPC queries
		getAllPools(account: string): Promise<UserPoolData[]>;
		getUserDebt(poolId: string, account: string): Promise<Balance>;
	};

	reserve: {
		// Storage queries
		userCollateral(
			poolId: string,
			assetId: string,
			account: string
		): Promise<string>; // returns Balance
		poolCollateral(poolId: string, index: number): Promise<string>; // returns AssetId
		totalCollaterals(poolId: string): Promise<number>; // returns u16
		totalCollateralBalance(
			poolId: string,
			assetId: string
		): Promise<string>; // returns Balance

		// RPC queries
		getUserPosition(poolId: string, account: string): Promise<UserCollateralData[]>;
	};

	riskManager: {
		// Storage queries
		poolParameters(poolId: string): Promise<any>; // returns PoolParams
		collateralParameters(poolId: string, assetId: string): Promise<any>; // returns CollateralParams
		globalRiskState(): Promise<any>; // returns GlobalRiskParams

		// Function queries
		getHealthFactor(poolId: string, account: string): Promise<string>;
		isLiquidatable(poolId: string, account: string): Promise<boolean>;
		isPositionHealthy(poolId: string, account: string): Promise<boolean>;
		canMint(
			account: string,
			poolId: string,
			amount: string
		): Promise<boolean>;
	};

	oracle: {
		// Storage queries
		prices(assetId: string): Promise<[string, number]>; // returns [Price, BlockNumber]
	};
}
