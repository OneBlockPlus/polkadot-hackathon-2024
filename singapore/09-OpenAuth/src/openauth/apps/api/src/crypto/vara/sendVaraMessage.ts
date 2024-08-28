import { GearApi } from '@gear-js/api'

import { getPolkadotWallet } from '../polkadot/getPolkadotWallet'

export async function sendVaraMessage({
  userId,
  payload,
  destination,
}: {
  userId: string
  payload: string
  destination: `0x${string}`
}) {
  const { keypair } = await getPolkadotWallet(userId)

  const api = await GearApi.create()
  const extrinsic = api.message.send({
    destination,
    payload,
    gasLimit: 10000000,
    value: 1000,
  })
  const result = await extrinsic.signAndSend(keypair)
  return result.toHex()
}
