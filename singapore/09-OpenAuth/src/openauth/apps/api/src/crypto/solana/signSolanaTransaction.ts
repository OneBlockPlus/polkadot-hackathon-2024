import type { Connection } from '@solana/web3.js'
import { Transaction } from '@solana/web3.js'

import { getSolanaWallet } from './getSolanaWallet'

export async function signSolanaTransaction({
  connection,
  userId,
  encodedTransaction,
}: {
  connection: Connection
  userId: string
  encodedTransaction: string
}) {
  const { keypair } = getSolanaWallet(userId)
  const buffer = Buffer.from(encodedTransaction, 'base64')

  const transaction = Transaction.from(buffer)
  transaction.partialSign(keypair)

  return await connection.sendRawTransaction(transaction.serialize())
}
