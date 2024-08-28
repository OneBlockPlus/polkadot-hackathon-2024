import { Abi } from '@polkadot/api-contract'
import { AccountId } from '@polkadot/types/interfaces'

export interface SubstrateDeployment {
  contractId: string
  networkId: string
  abi: string | Record<string, unknown> | Abi
  address: string | AccountId
}

export interface SubstrateChain {
  network: string
  name: string
  rpcUrls: [string, ...string[]]
  ss58Prefix?: number
  explorerUrls?: Partial<Record<SubstrateExplorer, string>>
  testnet?: boolean
  faucetUrls?: string[]
}

export enum SubstrateExplorer {
  Subscan = 'subscan',
  PolkadotJs = 'polkadotjs',
  Other = 'other',
}
