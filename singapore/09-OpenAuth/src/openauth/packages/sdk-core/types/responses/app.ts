import type { Static } from '@fastify/type-provider-typebox'
import { Type } from '@fastify/type-provider-typebox'

import { Nullable } from '../common'

export const TypeApp = Type.Object({
  id: Type.String(),
  name: Type.String(),
  description: Nullable(Type.String()),
  logoUrl: Nullable(Type.String()),
  emailEnabled: Type.Boolean(),
  googleEnabled: Type.Boolean(),
  discordEnabled: Type.Boolean(),
  twitterEnabled: Type.Boolean(),
  tiktokEnabled: Type.Boolean(),
  githubEnabled: Type.Boolean(),
  huggingfaceEnabled: Type.Boolean(),
  appleEnabled: Type.Boolean(),
  telegramEnabled: Type.Boolean(),
  ethEnabled: Type.Boolean(),
  solEnabled: Type.Boolean(),
  jwtTTL: Type.Number(),
  googleClientId: Nullable(Type.String()),
  telegramBotToken: Nullable(Type.String()),
  tiktokClientKey: Nullable(Type.String()),
  tiktokClientSecret: Nullable(Type.String()),
  githubClientId: Nullable(Type.String()),
  githubClientSecret: Nullable(Type.String()),
  huggingfaceClientId: Nullable(Type.String()),
  huggingfaceAppSecret: Nullable(Type.String()),
  discordApplicationId: Nullable(Type.String()),
})

export type App = Static<typeof TypeApp>
