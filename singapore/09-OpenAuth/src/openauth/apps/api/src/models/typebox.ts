import type { TypeBoxTypeProvider } from '@fastify/type-provider-typebox'
import type {
  ContextConfigDefault,
  FastifyReply,
  FastifyRequest,
  RawReplyDefaultExpression,
  RawRequestDefaultExpression,
  RawServerDefault,
} from 'fastify'
import type { RouteGenericInterface } from 'fastify/types/route'
import type { FastifySchema } from 'fastify/types/schema'

export type FastifyRequestTypebox<TSchema extends FastifySchema> = FastifyRequest<
  RouteGenericInterface,
  RawServerDefault,
  RawRequestDefaultExpression,
  TSchema,
  TypeBoxTypeProvider
>

export type FastifyReplyTypebox<TSchema extends FastifySchema> = FastifyReply<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  RouteGenericInterface,
  ContextConfigDefault,
  TSchema,
  TypeBoxTypeProvider
>
