'use server'

import { auth } from '@/auth/auth'
import { db } from '@/lib/db'
import { v4 } from 'uuid'
import { revalidatePath } from 'next/cache'
import { Wallet, WalletId } from '@/generated/public/Wallet'


export async function addWallet(param: {
  name: string
  address: string
  type: string
}) {
  const session = await auth()
  if (!session?.user.sub) {
    return undefined
  }

  const wallet = await db
    .insertInto('wallet')
    .values({
      id: v4() as WalletId,
      user_id: session?.user.sub,
      name: param.name,
      address: param.address,
      type: param.type,
      balance: Math.random() * 10000,
    })
    .returningAll()
    .executeTakeFirst()

  revalidatePath('/wallets')

  return wallet
}

export async function getWallets(): Promise<Wallet[]> {
  const session = await auth()
  console.log('session', JSON.stringify(session))
  if (!session?.user.sub) {
    return []
  }
  return await db
    .selectFrom('wallet')
    .selectAll()
    .where('user_id', '=', session?.user.sub)
    .orderBy('created_at', 'desc')
    .execute() as Wallet[]
}