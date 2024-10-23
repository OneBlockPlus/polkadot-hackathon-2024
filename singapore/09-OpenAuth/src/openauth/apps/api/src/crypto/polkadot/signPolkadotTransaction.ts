import { ApiPromise, HttpProvider } from '@polkadot/api'

import { getPolkadotWallet } from './getPolkadotWallet'

export async function signPolkadotTransaction({
  serialized,
  userId,
  rpcUrl,
}: {
  serialized: `0x${string}`
  userId: string
  chainName: string
  rpcUrl: string
}) {
  const provider = new HttpProvider(rpcUrl)
  const api = new ApiPromise({ provider })
  await api.isReady
  const transaction = api.tx(serialized)

  const { keypair } = getPolkadotWallet(userId)
  const signedTx = await transaction.signAndSend(keypair)
  return signedTx.toHex()
}
