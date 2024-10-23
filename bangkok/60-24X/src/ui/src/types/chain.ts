// src/types/chain.ts
export type AssetId = string;
export type PoolId = string;
export type Balance = string;
export type Price = string;

export interface CollateralParams {
  is_enabled: boolean;
  max_ceiling: string;
  base_ltv: number;
  liquidation_threshold: number;
  liquidation_penalty: number;
  liquidation_fee: number;
}

export interface PoolParams {
  is_enabled: boolean;
  synthetic_asset: AssetId;
  debt_ceiling: Balance;
  is_minting_allowed: boolean;
  is_burning_allowed: boolean;
}

export interface AssetMetadata {
  id: AssetId;
  name: string;
  symbol: string;
  decimals: number;
  price: Price;
}

export interface CollateralAsset {
  asset: AssetMetadata;
  params: CollateralParams;
  balance?: Balance;
}

export interface UserCollateralData {
  asset: AssetMetadata;
  balance: Balance;
  params: CollateralParams;
}

export interface UserPoolData {
  id: PoolId;
  debt_amount: Balance;
  synthetic_asset: AssetMetadata;
  params: PoolParams;
}

export interface UserPosition {
  debt: Balance;
  collateral: Balance;
  collateral_base: Balance;
  collateral_liquidation: Balance;
  health_factor?: Balance;
}

// API response types
export interface ChainApiResponse<T> {
  data: T;
  error?: string;
}