import { Type } from '@fastify/type-provider-typebox'
import { TypeAdminConfig } from '@open-auth/sdk-core'
import type { FastifyInstance } from 'fastify'

import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../models/typebox'
import { prisma } from '../../utils/prisma'

const schema = {
  tags: ['Config'],
  summary: 'Get config',
  response: {
    200: Type.Object({
      data: TypeAdminConfig,
    }),
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const adminCount = await prisma.admin.count()
  reply.status(200).send({
    data: {
      initialized: adminCount > 0,
    },
  })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/config',
    schema,
    handler,
  })
}
