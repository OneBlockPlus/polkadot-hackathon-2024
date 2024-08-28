import type { Static } from '@fastify/type-provider-typebox'
import { Type } from '@fastify/type-provider-typebox'

import { Nullable } from '../common'

export const TypeUser = Type.Object({
  id: Type.String(),
  email: Nullable(Type.String()),
  google: Nullable(Type.String()),
  discord: Nullable(Type.String()),
  tiktok: Nullable(Type.String()),
  github: Nullable(Type.String()),
  huggingface: Nullable(Type.String()),
  twitter: Nullable(Type.String()),
  apple: Nullable(Type.String()),
  telegram: Nullable(Type.String()),
  ethAddress: Nullable(Type.String()),
  solAddress: Nullable(Type.String()),
  username: Nullable(Type.String()),
  referCode: Type.String(),
  avatar: Nullable(Type.String()),
  displayName: Nullable(Type.String()),
  createdAt: Type.Number(),
  lastSeenAt: Type.Number(),
})

export type User = Static<typeof TypeUser>

export const TypeUserProfile = Type.Object({
  ...TypeUser.properties,
  referrer: Nullable(Type.String()),
})

export type UserProfile = Static<typeof TypeUserProfile>

export const TypeUserWallets = Type.Object({
  solWallet: Type.String(),
  ethWallet: Type.String(),
  dotWallet: Type.String(),
})

export type UserWallets = Static<typeof TypeUserWallets>
