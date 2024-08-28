import { Type } from '@fastify/type-provider-typebox'
import { TypeLoginResponse } from '@open-auth/sdk-core'
import type { FastifyInstance } from 'fastify'

import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../models/typebox'
import { findOrCreateUser } from '../../repositories/findOrCreateUser'
import { verifySOL } from '../../utils/auth'
import { generateJwtToken } from '../../utils/jwt'
import { prisma } from '../../utils/prisma'
import { ERROR400_SCHEMA } from '../../utils/schema'

const schema = {
  tags: ['User'],
  summary: 'Log in with Solana',
  body: Type.Object({
    appId: Type.String(),
    solAddress: Type.String(),
    signature: Type.String(),
  }),
  response: {
    200: Type.Object({
      data: TypeLoginResponse,
    }),
    400: ERROR400_SCHEMA,
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { appId, solAddress, signature } = request.body
  const app = await prisma.app.findUnique({ where: { id: appId } })
  if (!app) {
    return reply.status(400).send({ message: 'App not found' })
  }

  if (!verifySOL(app.name, solAddress, signature)) {
    return reply.status(400).send({ message: 'Invalid SOL signature' })
  }

  const user = await findOrCreateUser({ appId, solAddress })
  const token = await generateJwtToken(reply, { userId: user.id, appId, jwtTTL: app.jwtTTL })
  reply.status(200).send({ data: { token } })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '/login-solana',
    schema,
    handler,
  })
}
