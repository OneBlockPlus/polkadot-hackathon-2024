import { Type } from '@fastify/type-provider-typebox'

const commonErrorSchema = Type.Object({
  message: Type.String(),
})

export const ERROR400_SCHEMA = { ...commonErrorSchema, description: 'Bad Request' }
export const ERROR401_SCHEMA = { ...commonErrorSchema, description: 'Unauthorized' }
export const ERROR403_SCHEMA = { ...commonErrorSchema, description: 'Forbidden' }
export const ERROR404_SCHEMA = { ...commonErrorSchema, description: 'Not Found' }
export const ERROR500_SCHEMA = { ...commonErrorSchema, description: 'Internal Error' }
