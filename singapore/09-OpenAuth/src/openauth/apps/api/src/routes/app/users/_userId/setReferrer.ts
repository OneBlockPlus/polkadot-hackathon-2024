import { Type } from '@fastify/type-provider-typebox'
import { TypeAuthHeaders } from '@open-auth/sdk-core'
import type { FastifyInstance } from 'fastify'

import { verifyApp } from '../../../../handlers/verifyApp'
import type { AppAuthPayload } from '../../../../models/request'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../../../models/typebox'
import { getReferralChain } from '../../../../repositories/getReferralChain'
import { prisma } from '../../../../utils/prisma'
import { ERROR403_SCHEMA } from '../../../../utils/schema'

const schema = {
  tags: ['App - Users'],
  summary: 'Set user referrer',
  params: Type.Object({
    userId: Type.String(),
  }),
  headers: TypeAuthHeaders,
  body: Type.Object({
    referCode: Type.String(),
  }),
  response: {
    200: Type.Object({
      data: Type.Object({}),
    }),
    403: ERROR403_SCHEMA,
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { appId } = request.user as AppAuthPayload
  const { userId: refereeId } = request.params
  const { referCode } = request.body

  const referee = await prisma.user.findUnique({ where: { id: refereeId } })
  if (!referee) {
    return reply.status(404).send({ message: 'User not found' })
  }

  const referrer = await prisma.user.findUnique({
    where: { appId_referCode: { appId, referCode } },
  })

  if (!referrer) {
    return reply.status(404).send({ message: 'Referrer not found' })
  }

  if (referrer.id === referee.id) {
    return reply.status(403).send({ message: 'Cannot set yourself as referrer' })
  }

  const referralChain = await getReferralChain(referrer.id)
  if (referralChain.includes(referee.id)) {
    return reply.status(403).send({ message: 'You are in the referrer\'s referral chain' })
  }

  await prisma.referral.upsert({
    where: { referee: referee.id },
    update: {},
    create: {
      appId,
      referrer: referrer.id,
      referee: referee.id,
    },
  })

  reply.status(200).send({ data: {} })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '/bind-referrer',
    onRequest: [verifyApp],
    schema,
    handler,
  })
}
