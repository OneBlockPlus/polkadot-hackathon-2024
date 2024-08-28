import { Type } from '@fastify/type-provider-typebox'
import { TypeAdmin } from '@open-auth/sdk-core'
import type { FastifyInstance } from 'fastify'

import { verifyAdmin } from '../../../handlers/verifyAdmin'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../../models/typebox'
import { prisma } from '../../../utils/prisma'

const schema = {
  tags: ['Admin - Admins'],
  summary: 'List admins',
  headers: Type.Object({
    Authorization: Type.String(),
  }),
  response: {
    200: Type.Object({
      data: Type.Array(TypeAdmin),
    }),
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const admins = await prisma.admin.findMany()
  reply.status(200).send({
    data: admins,
  })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '',
    onRequest: [verifyAdmin],
    schema,
    handler,
  })
}
