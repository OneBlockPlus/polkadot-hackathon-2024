import type { Static } from '@fastify/type-provider-typebox'
import { Type } from '@fastify/type-provider-typebox'

import { Nullable } from '../common'

export const TypeAdminConfig = Type.Object({
  initialized: Type.Boolean(),
})

export const TypeGlobalConfig = Type.Object({
  production: Type.Boolean(),
  brand: Type.String(),
  message: Type.String(),
  googleClientId: Nullable(Type.String()),
  discordApplicationId: Nullable(Type.String()),
})

export type AdminConfig = Static<typeof TypeAdminConfig>
export type GlobalConfig = Static<typeof TypeGlobalConfig>
