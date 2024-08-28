import Credentials from '@auth/core/providers/credentials'
import { signInSchema } from '@/lib/zod'
import { saltAndHashPassword } from '@/lib/utils'
import { AuthError } from 'next-auth'
import { db } from '@/lib/db'
import { User } from '@auth/core/types'


export const Credential = Credentials({
  // You can specify which fields should be submitted, by adding keys to the `credentials` object.
  // e.g. domain, username, password, 2FA token, etc.
  id: 'credential',
  credentials: {
    email: {},
    password: {}
  },
  authorize: async (credentials: any) => {
    // logic to salt and hash password
    const { email, password } = await signInSchema.parseAsync(credentials)

    // logic to verify if user exists
    const pwHash = await saltAndHashPassword(password)
    const user = await getUserFromDb(email, pwHash)

    if (!user) {
      throw new AuthError('User not found.')
    }

    // return user object with the their profile data
    return user as User
  }
})

const getUserFromDb = async (email: string, password: string) => {
  // insert user

  const user = db.selectFrom('users')
    .where('email','=', email)
    .where('hashedPassword','=', password)
    .selectAll()
    .executeTakeFirst()


  return user
}
