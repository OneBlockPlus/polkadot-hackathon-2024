import type { Static } from '@fastify/type-provider-typebox'
import { Type } from '@fastify/type-provider-typebox'

export const TypeGithubCodeParams = Type.Object({
  clientId: Type.String(),
  scopes: Type.Optional(Type.Array(Type.Union([
    Type.Literal('user'),
    // ...
  ]))),
  redirectUri: Type.String(),
})

export type GithubCodeParams = Static<typeof TypeGithubCodeParams>

export const TypeGithubRedirectQueryParams = Type.Object({
  code: Type.String(),
  scopes: Type.String(),
  state: Type.String(),
  error: Type.Optional(Type.String()),
  error_description: Type.Optional(Type.String()),
})
export type GithubRedirectQueryParams = Static<typeof TypeGithubRedirectQueryParams>

export const TypeGithubTokenQueryParams = Type.Object({
  client_id: Type.String(),
  client_secret: Type.String(),
  code: Type.String(),
  redirect_uri: Type.String(),
})
export type GithubTokenQueryParams = Static<typeof TypeGithubTokenQueryParams>

export const TypeGithubToken = Type.Object({
  scope: Type.String(),
  access_token: Type.String(),
  token_type: Type.String(),
})
export type GithubToken = Static<typeof TypeGithubToken>

export const TypeGithubUser = Type.Object({
  id: Type.Number(),
  avatar_url: Type.String(),
  name: Type.String(),
  email: Type.String(),
  bio: Type.String(),
})
export type GithubUser = Static<typeof TypeGithubUser>
