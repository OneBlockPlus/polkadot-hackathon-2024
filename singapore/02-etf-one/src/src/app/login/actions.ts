'use server'
import { signIn } from '@/auth/auth'
import { db } from '@/lib/db'
import { randomHex } from '@/lib/utils'
import { v4 } from 'uuid'
import moment from 'moment'
import { UsersId } from '@/generated/public/Users'


export async function signInUseServer(
  _?: { message: string },
  formData?: FormData,
) {
  try {
    await signIn('credentials', formData)
  } catch (error) {
    return {
      message: (error as Error).message,
    }
  }
}

export async function getNonce(address?: string) {
  if (!address) {
    return null
  }
  const nonce = `${randomHex(32)}`
  const expiredAt = moment().add(10, 'minutes').toISOString(true)
  await db
    .insertInto('users')
    .values({
      id: <UsersId>v4(),
      public_address: address,
      login_nonce: nonce,
      login_nonce_expired_at: expiredAt,
    })
    .onConflict((oc) => {
      return oc.column('public_address').doUpdateSet({
        login_nonce: nonce,
        login_nonce_expired_at: expiredAt,
      })
    })
    .returningAll()
    .execute()
  return nonce
}

export async function loginPolkadot(authRequest?: {
  publicAddress: string
  nonce: string
  signature: string
}) {
  await signIn('polkadot', { ...authRequest, redirectTo: '/dashboard' })
}

export async function loginEthereum({ address }: { address: string }) {
  await signIn('ethereum', {
    ...{
      address,
    },
    redirectTo: '/dashboard',
  })
}
