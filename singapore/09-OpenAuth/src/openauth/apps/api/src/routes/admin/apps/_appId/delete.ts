import { Type } from '@fastify/type-provider-typebox'
import type { FastifyInstance } from 'fastify'

import { verifyAdmin } from '../../../../handlers/verifyAdmin'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../../../models/typebox'
import { updateAppCache } from '../../../../repositories/app'
import { prisma } from '../../../../utils/prisma'

const schema = {
  tags: ['Admin - Apps'],
  summary: 'Delete app',
  headers: Type.Object({
    Authorization: Type.String(),
  }),
  params: Type.Object({
    appId: Type.String(),
  }),
  response: {
    200: Type.Object({
      data: Type.Object({}),
    }),
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { appId } = request.params
  const data = await prisma.app.update({
    data: { isDeleted: true },
    where: { id: appId },
  })

  await updateAppCache(data)
  reply.status(200).send({ data })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'DELETE',
    url: '',
    onRequest: [verifyAdmin],
    schema,
    handler,
  })
}
