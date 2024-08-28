import { createAssociatedTokenAccountIdempotentInstruction, createTransferInstruction, getAssociatedTokenAddress, getMint } from '@solana/spl-token'
import type { Connection } from '@solana/web3.js'
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from '@solana/web3.js'

import { getSolanaTokenBalance } from './getSolanaTokenBalance'
import { getSolanaWallet } from './getSolanaWallet'

export async function transferSolanaToken({
  connection,
  userId,
  address,
  amount,
  token,
}: {
  connection: Connection
  userId: string
  address: string
  amount: number
  token: string | 'SOL'
}) {
  const { keypair } = getSolanaWallet(userId)
  const fromPubkey = keypair.publicKey
  const toPubkey = new PublicKey(address)

  const balance = await getSolanaTokenBalance({ connection, tokenMint: token, walletAddress: fromPubkey.toBase58() })
  if (balance < amount) {
    throw new Error('Insufficient balance')
  }

  const transaction = new Transaction()
  if (token === 'SOL') {
    const lamports = amount * LAMPORTS_PER_SOL
    transaction.add(SystemProgram.transfer({ fromPubkey, toPubkey, lamports }))
  } else {
    const mint = new PublicKey(token)
    const mintInfo = await getMint(connection, mint)
    const lamports = amount * 10 ** mintInfo.decimals

    const fromTokenAccount = await getAssociatedTokenAddress(mint, fromPubkey, true)
    const toTokenAccount = await getAssociatedTokenAddress(mint, toPubkey, true)

    transaction.add(createAssociatedTokenAccountIdempotentInstruction(keypair.publicKey, toTokenAccount, toPubkey, mint))
    transaction.add(createTransferInstruction(fromTokenAccount, toTokenAccount, fromPubkey, lamports))
  }

  const { blockhash } = await connection.getLatestBlockhash()
  transaction.recentBlockhash = blockhash
  transaction.sign(keypair)

  const serialized = transaction.serialize()
  return await connection.sendRawTransaction(serialized)
}
