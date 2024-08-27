import { Type } from '@fastify/type-provider-typebox'
import type { FastifyInstance } from 'fastify'

import { verifyUser } from '../../handlers/verifyUser'
import type { JwtPayload } from '../../models/request'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../models/typebox'
import { verifyDiscord } from '../../utils/auth'
import { prisma } from '../../utils/prisma'
import { avatarQueue } from '../../utils/queue'
import { ERROR400_SCHEMA } from '../../utils/schema'

const schema = {
  tags: ['User'],
  summary: 'Bind with Discord',
  headers: Type.Object({
    Authorization: Type.String(),
  }),
  body: Type.Object({
    discordId: Type.String(),
    token: Type.String(),
  }),
  response: {
    200: Type.Object({
      data: Type.Object({}),
    }),
    400: ERROR400_SCHEMA,
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { appId, userId } = request.user as JwtPayload
  const { discordId, token } = request.body

  const exUser = await prisma.user.findFirst({ where: { discord: discordId, appId } })
  if (exUser) {
    return reply.status(400).send({ message: 'Discord account already binded' })
  }
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return reply.status(404).send({ message: 'User not found' })
  }

  const { verified, avatar } = await verifyDiscord(discordId, token)
  if (!verified) {
    return reply.status(400).send({ message: 'Invalid discord token' })
  }

  await prisma.user.update({
    where: { id: userId },
    data: { discord: discordId },
  })
  await avatarQueue.add({ userId, imageURL: avatar, skipIfExist: true }, { removeOnComplete: true })
  reply.status(200).send({ data: user })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '/bind-discord',
    onRequest: [verifyUser],
    schema,
    handler,
  })
}
