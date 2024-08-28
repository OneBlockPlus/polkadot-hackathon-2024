import { NextAuthConfig } from 'next-auth'
import { Credential } from '@/auth/provider/credential'
import { PolkadotProvider } from '@/auth/provider/polkadot'
import { Ethereum } from '@/auth/provider/ethereum'


// Notice this is only an object, not a full Auth.js instance
export default {
  providers: [Credential, PolkadotProvider, Ethereum]

} satisfies NextAuthConfig

