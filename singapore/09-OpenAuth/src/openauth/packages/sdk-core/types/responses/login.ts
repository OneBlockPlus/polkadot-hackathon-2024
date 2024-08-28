import type { Static } from '@fastify/type-provider-typebox'
import { Type } from '@fastify/type-provider-typebox'

export const TypeLoginResponse = Type.Object({
  token: Type.String(),
})
export type LoginResponse = Static<typeof TypeLoginResponse>
