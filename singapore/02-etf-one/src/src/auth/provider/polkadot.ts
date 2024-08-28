import Credentials from '@auth/core/providers/credentials'
import moment from 'moment'
import { db } from '@/lib/db'
import { VerifyResult } from '@/app/api/auth/verify/route'
import '@polkadot/wasm-crypto'
import { User } from '@auth/core/types'
import { v4 } from 'uuid'

import { WalletType } from '@/app/wallets/walletType'
import { WalletId } from '@/generated/public/Wallet'


export const PolkadotProvider = Credentials({
  id: 'polkadot',

  credentials: {
    publicAddress: { label: 'Public Address', type: 'text' },
    nonce: { label: 'Nonce', type: 'text' },
    signature: { label: 'signature', type: 'text' },
  },
  authorize: async (credentials) => {
    if (!credentials) return null

    const { publicAddress, nonce, signature } = credentials

    // Get user from database with their generated nonce
    const user = await getUserFromDb(publicAddress as string, nonce as string)

    if (user === undefined || user.login_nonce_expired_at == null)
      throw new Error('Invalid nonce')

    if (!moment(user.login_nonce_expired_at).isSameOrAfter(moment()))
      throw new Error('Nonce expired')

    const params = new URLSearchParams()
    params.append('publicAddress', publicAddress as string)
    params.append('nonce', nonce as string)
    params.append('signature', signature as string)
    const result = await fetch(
      process.env.NEXT_PUBLIC_FUNCTIONS_BASE_URL +
        '/api/auth/verify?' +
        params.toString(),
    )
    const { passed } = (await result.json()) as VerifyResult

    if (!passed) throw new Error('Invalid signature')

    // insert main wallet
    await insertMainWallet(user.id, publicAddress as string)

    return user as User
  },
})

const getUserFromDb = async (address: string, no: string) => {
  return db
    .selectFrom('users')
    .where('public_address', '=', address)
    .where('login_nonce', '=', no)
    .selectAll()
    .executeTakeFirst()
}

async function insertMainWallet(userId: string, publicAddress: string) {
  await db
    .insertInto('wallet')
    .values({
      id: <WalletId>v4(),
      user_id: userId,
      name: 'Main Wallet',
      type: WalletType.PolkaDot,
      address: publicAddress,
      balance: Math.random() * 1000,
    })
    .onConflict((oc) => {
      return oc
        .columns(['user_id','address'])
        .doNothing()
    })
    .execute()
}
