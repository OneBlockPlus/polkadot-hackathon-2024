import { Type } from '@fastify/type-provider-typebox'
import { TypeAuthHeaders } from '@open-auth/sdk-core'
import type { FastifyInstance } from 'fastify'

import { sendVaraReply } from '../../../../../crypto/vara/sendVaraReply'
import { verifyApp } from '../../../../../handlers/verifyApp'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../../../../models/typebox'
import { prisma } from '../../../../../utils/prisma'
import { ERROR400_SCHEMA } from '../../../../../utils/schema'

const schema = {
  tags: ['App - Users'],
  summary: 'Send Vara reply',
  params: Type.Object({
    userId: Type.String(),
  }),
  headers: TypeAuthHeaders,
  body: Type.Object({
    replyToId: Type.String(),
    payload: Type.String(),
  }),
  response: {
    200: Type.Object({
      data: Type.Object({
        signature: Type.String(),
      }),
    }),
    400: ERROR400_SCHEMA,
    500: ERROR400_SCHEMA,
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { userId } = request.params
  const { payload, replyToId } = request.body
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return reply.status(400).send({ message: 'User not found' })
  }

  try {
    const signature = await sendVaraReply({ userId, replyToId: replyToId as `0x${string}`, payload })
    reply.status(200).send({ data: { signature } })
  } catch (error: any) {
    reply.status(500).send({ message: error.message ?? 'Internal RPC error' })
  }
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '/send-reply',
    onRequest: [verifyApp],
    schema,
    handler,
  })
}
