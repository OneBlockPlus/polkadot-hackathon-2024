import { randomUUID } from 'node:crypto'

import { Type } from '@fastify/type-provider-typebox'
import type { FastifyInstance } from 'fastify'

import { JWT_PUBLIC_KEY } from '../../../../constants'
import { verifyAdmin } from '../../../../handlers/verifyAdmin'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../../../models/typebox'
import { prisma } from '../../../../utils/prisma'
import { ERROR404_SCHEMA } from '../../../../utils/schema'

const schema = {
  tags: ['Admin - Apps'],
  summary: 'Get app secret',
  params: Type.Object({
    appId: Type.String(),
  }),
  headers: Type.Object({
    Authorization: Type.String(),
  }),
  response: {
    200: Type.Object({
      data: Type.Object({
        appSecret: Type.String(),
        jwtSecret: Type.String(),
      }),
    }),
    404: ERROR404_SCHEMA,
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { appId } = request.params
  const app = await prisma.app.findUnique({
    where: { id: appId },
  })

  if (!app) {
    return reply.status(404).send({ message: 'App not found' })
  }

  let appSecret = app.secret

  if (appSecret === null) {
    appSecret = `oa_${randomUUID().replaceAll('-', '')}`
    await prisma.app.update({
      where: { id: appId },
      data: { secret: appSecret },
    })
  }

  reply.status(200).send({
    data: {
      appSecret,
      jwtSecret: JWT_PUBLIC_KEY,
    },
  })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/secret',
    onRequest: [verifyAdmin],
    schema,
    handler,
  })
}
