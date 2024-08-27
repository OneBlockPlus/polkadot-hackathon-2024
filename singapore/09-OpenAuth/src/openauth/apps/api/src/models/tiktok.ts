import type { Static } from '@fastify/type-provider-typebox'
import { Type } from '@fastify/type-provider-typebox'

export const TypeTikTokCodeParams = Type.Object({
  clientKey: Type.String(),
  scopes: Type.Optional(Type.Array(Type.Union([
    Type.Literal('user.info.basic'),
    Type.Literal('user.info.profile'),
  ]))),
  redirectUri: Type.String(),
})

export type TikTokCodeParams = Static<typeof TypeTikTokCodeParams>

export const TypeTikTokRedirectQueryParams = Type.Object({
  code: Type.String(),
  scopes: Type.String(),
  state: Type.String(),
  error: Type.Optional(Type.String()),
  error_description: Type.Optional(Type.String()),
})
export type TikTokRedirectQueryParams = Static<typeof TypeTikTokRedirectQueryParams>

export const TypeTikTokTokenQueryParams = Type.Object({
  client_key: Type.String(),
  client_secret: Type.String(),
  code: Type.String(),
  grant_type: Type.String(),
  redirect_uri: Type.String(),
  code_verifier: Type.String(),
})
export type TikTokTokenQueryParams = Static<typeof TypeTikTokTokenQueryParams>

export const TypeTikTokToken = Type.Object({
  open_id: Type.String(),
  scope: Type.String(),
  access_token: Type.String(),
  expires_in: Type.Number(),
  token_type: Type.String(),
})
export type TikTokToken = Static<typeof TypeTikTokToken>

export const TypeTikTokUser = Type.Object({
  open_id: Type.String(),
  union_id: Type.String(),
  avatar_url: Type.String(),
  display_name: Type.String(),
})
export type TikTokUser = Static<typeof TypeTikTokUser>
