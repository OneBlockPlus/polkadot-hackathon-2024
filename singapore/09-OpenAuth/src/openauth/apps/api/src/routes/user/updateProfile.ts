import { Type } from '@fastify/type-provider-typebox'
import type { FastifyInstance } from 'fastify'

import { verifyUser } from '../../handlers/verifyUser'
import type { JwtPayload } from '../../models/request'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../models/typebox'
import { prisma } from '../../utils/prisma'
import { ERROR400_SCHEMA } from '../../utils/schema'

const schema = {
  tags: ['User'],
  summary: 'Update profile',
  headers: Type.Object({
    Authorization: Type.String(),
  }),
  body: Type.Object({
    avatar: Type.String(),
    displayName: Type.String(),
  }),
  response: {
    200: Type.Object({
      data: Type.Object({}),
    }),
    400: ERROR400_SCHEMA,
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { userId } = request.user as JwtPayload
  const { avatar, displayName } = request.body

  await prisma.user.update({
    where: { id: userId },
    data: { avatar, displayName },
  })
  reply.status(200).send({ data: {} })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '/update-profile',
    onRequest: [verifyUser],
    schema,
    handler,
  })
}
