import { Type } from '@fastify/type-provider-typebox'
import bcrypt from 'bcrypt'
import type { FastifyInstance } from 'fastify'

import { verifyAdmin } from '../../../handlers/verifyAdmin'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../../models/typebox'
import { SALT_ROUNDS } from '../../../utils/auth'
import { prisma } from '../../../utils/prisma'

const schema = {
  tags: ['Admin - Admins'],
  summary: 'Update admin',
  params: Type.Object({
    id: Type.Number(),
  }),
  headers: Type.Object({
    Authorization: Type.String(),
  }),
  body: Type.Object({
    username: Type.String(),
    password: Type.String(),
  }),
  response: {
    200: Type.Object({
      data: Type.Object({}),
    }),
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { id } = request.params
  const { username, password: rawPassword } = request.body

  const password = await bcrypt.hash(rawPassword, SALT_ROUNDS)
  await prisma.admin.update({
    where: {
      id,
    },
    data: {
      username,
      password,
    },
  })

  return reply.status(200).send({ data: {} })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'PATCH',
    url: '/:id',
    onRequest: [verifyAdmin],
    schema,
    handler,
  })
}
