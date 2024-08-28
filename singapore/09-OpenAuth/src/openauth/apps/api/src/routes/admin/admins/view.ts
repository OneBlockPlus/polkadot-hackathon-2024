import { Type } from '@fastify/type-provider-typebox'
import { TypeAdmin } from '@open-auth/sdk-core'
import type { FastifyInstance } from 'fastify'

import { verifyAdmin } from '../../../handlers/verifyAdmin'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../../models/typebox'
import { prisma } from '../../../utils/prisma'
import { ERROR404_SCHEMA } from '../../../utils/schema'

const schema = {
  tags: ['Admin - Admins'],
  summary: 'Get admin',
  params: Type.Object({
    id: Type.Number(),
  }),
  headers: Type.Object({
    Authorization: Type.String(),
  }),
  response: {
    200: Type.Object({
      data: TypeAdmin,
    }),
    404: ERROR404_SCHEMA,
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { id } = request.params
  const admin = await prisma.admin.findUnique({
    where: { id },
  })

  if (!admin) {
    return reply.status(404).send({ message: 'Admin not found' })
  }
  reply.status(200).send({
    data: admin,
  })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/:id',
    onRequest: [verifyAdmin],
    schema,
    handler,
  })
}
