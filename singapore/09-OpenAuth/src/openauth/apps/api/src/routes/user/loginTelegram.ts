import { Type } from '@fastify/type-provider-typebox'
import { TypeLoginResponse } from '@open-auth/sdk-core'
import type { FastifyInstance } from 'fastify'

import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../models/typebox'
import { findOrCreateUser } from '../../repositories/findOrCreateUser'
import { parseTelegramData, verifyTelegram } from '../../utils/auth'
import { generateJwtToken } from '../../utils/jwt'
import { prisma } from '../../utils/prisma'
import { avatarQueue } from '../../utils/queue'
import { ERROR400_SCHEMA } from '../../utils/schema'

const schema = {
  tags: ['User'],
  summary: 'Log in with Telegram',
  body: Type.Object({
    appId: Type.String(),
    data: Type.String(),
  }),
  response: {
    200: Type.Object({
      data: TypeLoginResponse,
    }),
    400: ERROR400_SCHEMA,
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { appId, data } = request.body
  const app = await prisma.app.findUnique({ where: { id: appId } })
  if (!app || !app.telegramBotToken) {
    return reply.status(400).send({ message: 'Bot token is null' })
  }
  if (!verifyTelegram(data, app.telegramBotToken)) {
    return reply.status(400).send({ message: 'Invalid signature' })
  }

  const { userId, displayName } = parseTelegramData(data)

  const user = await findOrCreateUser({ appId, telegram: userId.toString() }, { displayName })
  await avatarQueue.add({ userId: user.id }, { removeOnComplete: true })

  const token = await generateJwtToken(reply, { userId: user.id, appId, jwtTTL: app.jwtTTL })
  reply.status(200).send({ data: { token } })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '/login-telegram',
    schema,
    handler,
  })
}
