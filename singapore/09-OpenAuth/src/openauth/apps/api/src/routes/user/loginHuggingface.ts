import { Type } from '@fastify/type-provider-typebox'
import { TypeLoginResponse } from '@open-auth/sdk-core'
import type { FastifyInstance } from 'fastify'

import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../models/typebox'
import { findOrCreateUser } from '../../repositories/findOrCreateUser'
import { getHuggingfaceUser } from '../../utils/huggingface'
import { generateJwtToken } from '../../utils/jwt'
import { prisma } from '../../utils/prisma'
import { avatarQueue } from '../../utils/queue'
import { ERROR400_SCHEMA } from '../../utils/schema'

const schema = {
  tags: ['User'],
  summary: 'Log in with HuggingFace',
  body: Type.Object({
    appId: Type.String(),
    token: Type.String(),
    tokenType: Type.Optional(Type.String()),
  }),
  response: {
    200: Type.Object({
      data: TypeLoginResponse,
    }),
    400: ERROR400_SCHEMA,
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { appId, token, tokenType } = request.body
  const app = await prisma.app.findUnique({ where: { id: appId } })
  if (!app) {
    return reply.status(400).send({ message: 'App not found' })
  }
  const { id, avatarUrl: avatar, name } = await getHuggingfaceUser(token, tokenType)
  if (!id) {
    return reply.status(400).send({ message: 'Invalid Huggingface access token' })
  }

  const user = await findOrCreateUser({ appId, huggingface: id.toString() }, { displayName: name })
  const jwtToken = await generateJwtToken(reply, { userId: user.id, appId, jwtTTL: app.jwtTTL })
  await avatarQueue.add({ userId: user.id, imageURL: avatar })
  reply.status(200).send({ data: { token: jwtToken } })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '/login-huggingface',
    schema,
    handler,
  })
}
