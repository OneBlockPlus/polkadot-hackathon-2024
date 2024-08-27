import crypto from 'node:crypto'

import { u8aToHex } from '@polkadot/util'
import { HDKey, hdKeyToAccount } from 'viem/accounts'

import { WALLET_SEED_SALT } from '../../constants'

export function getEthereumWallet(userId: string) {
  const seedStr = `${WALLET_SEED_SALT}_${userId}`
  const hash = crypto.createHash('sha256')
  hash.update(Buffer.from(seedStr))
  const seed = hash.digest()

  const hdKey = HDKey.fromMasterSeed(seed)
  const account = hdKeyToAccount(hdKey)

  return {
    account,
    walletAddress: account.address,
    privateKey: u8aToHex(hdKey.privateKey),
  }
}
