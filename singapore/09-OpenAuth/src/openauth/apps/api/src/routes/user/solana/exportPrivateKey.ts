import { Type } from '@fastify/type-provider-typebox'
import type { FastifyInstance } from 'fastify'

import { getSolanaWallet } from '../../../crypto/solana/getSolanaWallet'
import { verifyUser } from '../../../handlers/verifyUser'
import type { JwtPayload } from '../../../models/request'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../../models/typebox'
import { prisma } from '../../../utils/prisma'
import { ERROR400_SCHEMA } from '../../../utils/schema'

const schema = {
  tags: ['User'],
  summary: 'Export Solana private key',
  headers: Type.Object({
    Authorization: Type.String(),
  }),
  response: {
    200: Type.Object({
      data: Type.String(),
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
    return reply.status(400).send({ message: 'User not found' })
  }

  reply.status(200).send({
    data: getSolanaWallet(userId).privateKey,
  })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '/private-key',
    onRequest: [verifyUser],
    schema,
    handler,
  })
}
