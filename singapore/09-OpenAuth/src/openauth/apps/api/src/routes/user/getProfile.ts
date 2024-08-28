import { Type } from '@fastify/type-provider-typebox'
import { Nullable, TypeUser } from '@open-auth/sdk-core'
import type { FastifyInstance } from 'fastify'

import { verifyUser } from '../../handlers/verifyUser'
import type { JwtPayload } from '../../models/request'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../models/typebox'
import { transformUserToReponse } from '../../repositories/transform'
import { prisma } from '../../utils/prisma'
import { ERROR400_SCHEMA } from '../../utils/schema'

const schema = {
  tags: ['User'],
  summary: 'Get profile',
  headers: Type.Object({
    Authorization: Type.String(),
  }),
  response: {
    200: Type.Object({
      data: Type.Object({
        ...TypeUser.properties,
        referrer: Nullable(Type.String()),
      }),
    }),
    400: ERROR400_SCHEMA,
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { userId } = request.user as JwtPayload

  const user = await prisma.user.findUnique({
    where: { id: userId },
  })
  if (!user) {
    return reply.status(404).send({ message: 'User not found' })
  }

  const referral = await prisma.referral.findUnique({ where: { referee: userId } })

  const userResponse = transformUserToReponse(user)

  reply.status(200).send({
    data: {
      ...userResponse,
      referrer: referral?.referrer ?? null,
    },
  })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/profile',
    onRequest: [verifyUser],
    schema,
    handler,
  })
}
