import Credentials from '@auth/core/providers/credentials'
import { db } from '@/lib/db'
import '@polkadot/wasm-crypto'
import { User } from '@auth/core/types'
import { v4 } from 'uuid'

import { UsersId } from '@/generated/public/Users'


export const Ethereum = Credentials({
  id: 'ethereum',

  credentials: {
    publicAddress: { label: 'Public Address', type: 'text' }
  },
  authorize: async (credentials) => {
    if (!credentials) return null

    const { publicAddress } = credentials

    // Get user from database with their generated nonce
    const user = await getUserOrCreate(publicAddress as string)

    if (user === undefined  )
      throw new Error('User not found.')

    // insert main wallet

    return user as User
  },
})

const getUserOrCreate = async (address: string) => {
  const user = await db
    .selectFrom('users')
    .where('public_address', '=', address)
    .selectAll()
    .executeTakeFirst()
  if(user == null){
    return  db.insertInto('users')
      .values({
        id: <UsersId>v4(),
        name: 'Main Wallet',
        address: address,
      }).executeTakeFirst()
  }
  return user
}


