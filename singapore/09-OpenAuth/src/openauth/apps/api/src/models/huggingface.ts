import type { Static } from '@fastify/type-provider-typebox'
import { Type } from '@fastify/type-provider-typebox'

export const TypeHuggingfaceCodeParams = Type.Object({
  clientId: Type.String(),
  scopes: Type.Optional(Type.Array(Type.Union([
    Type.Literal('openid'),
    Type.Literal('profile'),
    // ...
  ]))),
  redirectUri: Type.String(),
})

export type HuggingfaceCodeParams = Static<typeof TypeHuggingfaceCodeParams>

export const TypeHuggingfaceRedirectQueryParams = Type.Object({
  code: Type.String(),
  scope: Type.String(),
  state: Type.String(),
  error: Type.Optional(Type.String()),
})
export type HuggingfaceRedirectQueryParams = Static<typeof TypeHuggingfaceRedirectQueryParams>

export const TypeHuggingfaceTokenQueryParams = Type.Object({
  code: Type.String(),
  client_id: Type.String(),
  client_secret: Type.String(),
  redirect_uri: Type.String(),
})
export type HuggingfaceTokenQueryParams = Static<typeof TypeHuggingfaceTokenQueryParams>

export const TypeHuggingfaceUser = Type.Object({
  id: Type.Number(),
  avatarUrl: Type.String(),
  name: Type.String(),
  fullname: Type.String(),
  email: Type.Optional(Type.String()),
  websiteUrl: Type.Optional(Type.String()),
  isPro: Type.Optional(Type.Boolean()),
})
export type HuggingfaceUser = Static<typeof TypeHuggingfaceUser>

export const TypeHuggingfaceToken = Type.Object({
  scope: Type.String(),
  access_token: Type.String(),
  token_type: Type.String(),
  expires_in: Type.Date(),
  id_token: Type.Date(),
  refresh_token: Type.String(),
})
export type HuggingfaceToken = Static<typeof TypeHuggingfaceToken>
