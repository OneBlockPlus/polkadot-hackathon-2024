'use server'
import { db } from '@/lib/db'
import { v4 } from 'uuid'
import { TransactionId } from '@/generated/public/Transaction'
import { WalletId } from '@/generated/public/Wallet'
import { revalidatePath } from 'next/cache'
import { TxnStatus } from '@/app/transactions/status-cell'


export async function getTransactions() {
  return db
    .selectFrom('transaction')
    .selectAll()
    .orderBy('created_at', 'desc')
    .execute()
}

export async function createTxn(
  from: {
    id: WalletId
    created_at: Date
    user_id: string
    name: string | null
    address: string
    type: string
    balance: number
  },
  amount: number,
  to: string,
) {
  await db.insertInto('transaction')
    .values({
      id: <TransactionId>v4(),
      from: from.address,
      wallet_name: from.name!,
      to: to,
      amount: amount,
      status: TxnStatus.pending,
      created_by: 'test',
      created_at: new Date()
    })
    .execute()
  revalidatePath('/transactions')
}
