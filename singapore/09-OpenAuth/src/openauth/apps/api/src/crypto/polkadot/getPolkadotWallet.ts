import crypto from 'node:crypto'

import { Keyring } from '@polkadot/keyring'
import { u8aToHex } from '@polkadot/util'

import { WALLET_SEED_SALT } from '../../constants'

export function getPolkadotWallet(userId: string) {
  const seedStr = `${WALLET_SEED_SALT}_${userId}`
  const hash = crypto.createHash('sha256')
  hash.update(Buffer.from(seedStr))
  const seed = hash.digest()

  const keyring = new Keyring({ type: 'sr25519' })
  const keypair = keyring.createFromUri(u8aToHex(seed))

  return {
    keypair,
    walletAddress: keypair.address,
    keypairJson: keypair.toJson(),
  }
}
