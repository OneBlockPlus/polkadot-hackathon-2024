import { Type } from '@fastify/type-provider-typebox'
import { TypeAuthHeaders, TypeUser } from '@open-auth/sdk-core'
import type { FastifyInstance } from 'fastify'

import { verifyApp } from '../../../../handlers/verifyApp'
import type { AppAuthPayload } from '../../../../models/request'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../../../models/typebox'
import { transformUserToReponse } from '../../../../repositories/transform'
import { prisma } from '../../../../utils/prisma'
import { ERROR404_SCHEMA } from '../../../../utils/schema'

const schema = {
  tags: ['App - Users'],
  summary: 'Get user',
  params: Type.Object({
    userId: Type.String(),
  }),
  headers: TypeAuthHeaders,
  response: {
    200: Type.Object({
      data: TypeUser,
    }),
    404: ERROR404_SCHEMA,
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { appId } = request.user as AppAuthPayload
  const { userId } = request.params
  const user = await prisma.user.findUnique({
    where: { appId, id: userId },
  })
  if (!user) {
    return reply.status(404).send({ message: 'User not found' })
  }
  reply.status(200).send({
    data: transformUserToReponse(user),
  })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '',
    onRequest: [verifyApp],
    schema,
    handler,
  })
}
