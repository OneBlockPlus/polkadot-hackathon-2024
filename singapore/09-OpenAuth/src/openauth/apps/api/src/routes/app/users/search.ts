import { Type } from '@fastify/type-provider-typebox'
import { TypeAuthHeaders, TypeUser } from '@open-auth/sdk-core'
import type { Prisma } from '@prisma/client'
import type { FastifyInstance } from 'fastify'

import { verifyApp } from '../../../handlers/verifyApp'
import type { AppAuthPayload } from '../../../models/request'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../../models/typebox'
import { transformUserToReponse } from '../../../repositories/transform'
import { prisma } from '../../../utils/prisma'

const schema = {
  tags: ['App - Users'],
  summary: 'Search users',
  headers: TypeAuthHeaders,
  body: Type.Union([
    Type.Object({
      ids: Type.Array(Type.String()),
    }),
    Type.Object({
      referCode: Type.String(),
    }),
    Type.Object({
      solAddress: Type.String(),
    }),
    Type.Object({
      telegram: Type.String(),
    }),
  ]),
  response: {
    200: Type.Object({
      data: Type.Array(TypeUser),
    }),
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { appId } = request.user as AppAuthPayload

  const where: Prisma.UserWhereInput = { appId }
  if ('ids' in request.body) {
    where.id = { in: request.body.ids }
  }
  if ('referCode' in request.body) {
    where.referCode = request.body.referCode
  }
  if ('solAddress' in request.body) {
    where.solAddress = request.body.solAddress
  }
  if ('telegram' in request.body) {
    where.telegram = request.body.telegram
  }

  const users = await prisma.user.findMany({ where })
  reply.status(200).send({
    data: users.map(user => transformUserToReponse(user)),
  })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '/search',
    onRequest: [verifyApp],
    schema,
    handler,
  })
}
