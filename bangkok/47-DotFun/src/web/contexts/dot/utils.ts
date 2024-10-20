import { ApiPromise, WsProvider } from '@polkadot/api'

import { CHAIN_URL } from './config'

export async function getApi() {
  const provider = new WsProvider(CHAIN_URL)
  const unsub = provider.on('error', () => {
    provider.disconnect().catch(console.error)
    unsub()
  })

  return ApiPromise.create({ provider })
}

export enum LocalStorageKeys {
  ActiveWallet = 'monte:ActiveWallet',
  ActiveAccount = 'monte:ActiveAccount',
  CreatedByMe = 'monte:CreatedByMe',
  SeedE2E = 'monte:SeedE2E',
}
