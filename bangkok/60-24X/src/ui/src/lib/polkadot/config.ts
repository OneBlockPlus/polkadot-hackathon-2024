// src/lib/polkadot/config.ts
import { ApiPromise, WsProvider } from '@polkadot/api';

export const CHAIN_WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://127.0.0.1:9988';
export const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME || 'Development';

const definitions = {
  types: {
    PoolId: 'u64',
    AssetId: 'u64',
    Balance: 'String',
    Price: 'u128',
    CollateralParams: {
      is_enabled: 'bool',
      max_ceiling: 'Balance',
      base_ltv: 'u16',
      liquidation_threshold: 'u16',
      liquidation_penalty: 'u16',
      liquidation_fee: 'u16'
    },
    PoolParams: {
      is_enabled: 'bool',
      synthetic_asset: 'AssetId',
      debt_ceiling: 'Balance',
      is_minting_allowed: 'bool',
      is_burning_allowed: 'bool'
    },
    AssetMetadata: {
      id: 'AssetId',
      name: 'Vec<u8>',
      symbol: 'Vec<u8>',
      decimals: 'u8',
      price: 'Price'
    },
    UserCollateralData: {
      asset: 'AssetMetadata',
      balance: 'Balance',
      params: 'CollateralParams'
    },
    UserPoolData: {
      id: 'PoolId',
      debt_amount: 'Balance',
      synthetic_asset: 'AssetMetadata',
      params: 'PoolParams'
    }
  },

  // Define runtime APIs
  runtime: {
    PoolsApi: [
      {
        methods: {
          get_all_pools: {
            description: 'Get all pools for a given account',
            params: [{
              name: 'account',
              type: 'AccountId'
            }],
            type: 'Vec<UserPoolData>'
          }
        }
      }
    ]
  },

  // Define custom pallets
  pallets: {
    pools: {
      storage: {
        // Storage items from pools pallet
        poolsByAsset: {
          type: 'Map',
          key: 'AssetId',
          value: 'PoolId'
        },
        poolTotalDebt: {
          type: 'Map',
          key: 'PoolId',
          value: 'Balance'
        },
        userDebt: {
          type: 'Map',
          key: '(PoolId, AccountId)',
          value: 'Balance'
        },
        totalPools: {
          type: 'Value',
          value: 'PoolId'
        }
      },
      calls: {
        // Extrinsics from pools pallet
        mint: {
          description: 'Mint synthetic assets',
          params: [
            {
              name: 'pool_id',
              type: 'PoolId'
            },
            {
              name: 'amount',
              type: 'Balance'
            }
          ]
        },
        burn: {
          description: 'Burn synthetic assets',
          params: [
            {
              name: 'pool_id',
              type: 'PoolId'
            },
            {
              name: 'amount',
              type: 'Balance'
            }
          ]
        },
        faucet: {
          description: 'Faucet for testing',
          params: [
            {
              name: "asset_id",
              type: "AssetId"
            },
            {
              name: "amount",
              type: "Balance"
            }
          ]
        }
      }
    },
    reserve: {
      storage: {
        // Storage items from reserve pallet
        userCollateral: {
          type: 'Map',
          key: '(PoolId, AssetId, AccountId)',
          value: 'Balance'
        },
        poolCollateral: {
          type: 'Map',
          key: '(PoolId, u16)',
          value: 'AssetId'
        },
        totalCollaterals: {
          type: 'Map',
          key: 'PoolId',
          value: 'u16'
        },
        totalCollateralBalance: {
          type: 'Map',
          key: '(PoolId, AssetId)',
          value: 'Balance'
        }
      },
      calls: {
        // Extrinsics from reserve pallet
        depositCollateral: {
          description: 'Deposit collateral',
          params: [
            {
              name: 'pool_id',
              type: 'PoolId'
            },
            {
              name: 'asset_id',
              type: 'AssetId'
            },
            {
              name: 'amount',
              type: 'Balance'
            }
          ]
        },
        withdrawCollateral: {
          description: 'Withdraw collateral',
          params: [
            {
              name: 'pool_id',
              type: 'PoolId'
            },
            {
              name: 'asset_id',
              type: 'AssetId'
            },
            {
              name: 'amount',
              type: 'Balance'
            }
          ]
        }
      }
    },
    riskManager: {
      storage: {
        // Storage items from risk manager pallet
        poolParameters: {
          type: 'Map',
          key: 'PoolId',
          value: 'PoolParams'
        },
        collateralParameters: {
          type: 'Map',
          key: '(PoolId, AssetId)',
          value: 'CollateralParams'
        }
      }
    },
  }
};

export const initApi = async (): Promise<ApiPromise> => {
  const provider = new WsProvider(CHAIN_WS_URL);

  const api = await ApiPromise.create({
    provider,
    types: definitions.types,
    rpc: {
      pools: {
        getAllPools: {
          description: 'Get all pools',
          params: [
            {
              name: 'account',
              type: 'AccountId'
            }
          ],
          type: 'Vec<UserPoolData>'
        }
      },
      reserve: {
        getUserPosition: {
          description: 'Get user position',
          params: [
            {
              name: 'poolId',
              type: 'PoolId'
            },
            {
              name: 'account',
              type: 'AccountId'
            }
          ],
          type: 'Vec<UserCollateralData>'
        }
      }
    },
    typesBundle: {
      spec: {
        '24x': {
          types: [
            {
              minmax: [0, undefined],
              types: definitions.types
            }
          ]
        }
      }
    },
    // runtime: definitions.runtime
  });

  await api.isReady;
  return api;
};