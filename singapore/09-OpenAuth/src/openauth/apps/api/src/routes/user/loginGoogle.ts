import { Type } from '@fastify/type-provider-typebox'
import { TypeLoginResponse } from '@open-auth/sdk-core'
import type { FastifyInstance } from 'fastify'

import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../models/typebox'
import { findOrCreateUser } from '../../repositories/findOrCreateUser'
import { verifyGoogle } from '../../utils/auth'
import { generateJwtToken } from '../../utils/jwt'
import { prisma } from '../../utils/prisma'
import { avatarQueue } from '../../utils/queue'
import { ERROR400_SCHEMA } from '../../utils/schema'

const schema = {
  tags: ['User'],
  summary: 'Log in with Google',
  body: Type.Object({
    appId: Type.String(),
    email: Type.String(),
    token: Type.String(),
  }),
  response: {
    200: Type.Object({
      data: TypeLoginResponse,
    }),
    400: ERROR400_SCHEMA,
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { appId, email, token } = request.body
  const app = await prisma.app.findUnique({ where: { id: appId } })
  if (!app) {
    return reply.status(400).send({ message: 'App not found' })
  }

  const { verified, avatar, displayName } = await verifyGoogle(email, token)
  if (!verified) {
    return reply.status(400).send({ message: 'Invalid Google access token' })
  }

  const user = await findOrCreateUser({ appId, google: email }, { displayName })
  const jwtToken = await generateJwtToken(reply, { userId: user.id, appId, jwtTTL: app.jwtTTL })
  await avatarQueue.add({ userId: user.id, imageURL: avatar }, { removeOnComplete: true })
  reply.status(200).send({ data: { token: jwtToken } })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '/login-google',
    schema,
    handler,
  })
}
