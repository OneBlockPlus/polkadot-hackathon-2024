import type { Static } from '@fastify/type-provider-typebox'
import { Type } from '@fastify/type-provider-typebox'

export const TypeAdmin = Type.Object({
  id: Type.Number(),
  username: Type.String(),
})

export type Admin = Static<typeof TypeAdmin>
