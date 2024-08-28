import crypto from 'node:crypto'

import { Keypair } from '@solana/web3.js'
import base58 from 'bs58'

import { WALLET_SEED_SALT } from '../../constants'

export function getSolanaWallet(userId: string) {
  const seedStr = `${WALLET_SEED_SALT}_${userId}`
  const hash = crypto.createHash('sha256')
  hash.update(Buffer.from(seedStr))
  const seed = hash.digest()

  const keypair = Keypair.fromSeed(seed)

  return {
    keypair,
    walletAddress: keypair.publicKey.toBase58(),
    privateKey: base58.encode(keypair.secretKey),
  }
}
