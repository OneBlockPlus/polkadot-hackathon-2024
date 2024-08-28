// eslint-disable-next-line unused-imports/no-unused-imports
import NextAuth, { type DefaultSession } from 'next-auth'
// eslint-disable-next-line unused-imports/no-unused-imports
import { JWT } from 'next-auth/jwt'
// eslint-disable-next-line unused-imports/no-unused-imports
import 'next-auth/adapters'
import { User } from '@auth/core/types'


declare module '@auth/core/types' {
  interface User {
    public_address?: string
    sub?: string
  }
}

declare module 'next-auth' {

  interface Session {

    user: {
      /** The user's postal address. */
      public_address?: string
      /**
       * By default, TypeScript merges new interface properties and overwrites existing ones.
       * In this case, the default session user properties will be overwritten,
       * with the new ones defined above. To keep the default session user properties,
       * you need to add them back into the newly declared interface.
       */
    } & User
  }

}

declare module 'next-auth/jwt' {
  /** Returned by the `jwt` callback and `auth`, when using JWT sessions */
  interface JWT {
    /** OpenID ID Token */
    public_address?: string
  }
}

