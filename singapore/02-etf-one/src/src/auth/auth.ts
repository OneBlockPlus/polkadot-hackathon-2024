import NextAuth, { NextAuthConfig } from 'next-auth'
import authConfig from '@/auth/auth.config'
import { AuthDB } from '@/lib/auth-db'
import { KyselyAdapter } from '@auth/kysely-adapter'
import { AuthConfig } from '@auth/core'
import { JWT } from '@auth/core/jwt'
import { NextRequest } from 'next/server'
import { type AdapterSession, AdapterUser } from '@auth/core/adapters'
import { Awaitable, type DefaultSession, type Session, User } from '@auth/core/types'


const config: ((request: NextRequest | undefined) => NextAuthConfig) = () => {
  return {
    debug: true,
    session: {
      strategy: 'jwt'
    },
    adapter: KyselyAdapter(AuthDB),
    callbacks,
    ...authConfig
  } satisfies NextAuthConfig
}


const jwt: (params: {
  token: JWT;
  user: User | AdapterUser;
}) => Awaitable<JWT | null> = (param) => {
  if(param.user){
    param.token.public_address = param.user.public_address
  }
  return {  ...param.token }
}

const session: (params: ({
  session: {
    user: AdapterUser;
  } & AdapterSession;
  user: AdapterUser;
} & {
  session: Session;
  token: JWT;
}) & {
  newSession: any;
  trigger?: 'update';
}) => Awaitable<Session | DefaultSession> = (params) => {
  const result = {...params.session, user:{...params.session.user, ...params.token}}
  return result

}


const callbacks: AuthConfig['callbacks'] = {
  jwt,
  session
}

export const { handlers, signIn, signOut, auth } = NextAuth(config)
