import { Type } from '@fastify/type-provider-typebox'
import bcrypt from 'bcrypt'
import type { FastifyInstance } from 'fastify'

import type { AdminJwtPayload } from '../../models/request'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../models/typebox'
import { prisma } from '../../utils/prisma'
import { ERROR401_SCHEMA } from '../../utils/schema'

const schema = {
  tags: ['Admin'],
  summary: 'Login',
  body: Type.Object({
    username: Type.String(),
    password: Type.String(),
  }),
  response: {
    200: Type.Object({
      data: Type.Object({
        token: Type.String(),
      }),
    }),
    401: ERROR401_SCHEMA,
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { username, password } = request.body
  const user = await prisma.admin.findUnique({ where: { username } })
  const isMatch = user && (await bcrypt.compare(password, user.password))
  if (!isMatch) {
    return reply.code(401).send({
      message: 'Invalid username or password',
    })
  }

  const payload: AdminJwtPayload = {
    adminId: user.id,
  }
  const token = await reply.jwtSign(payload, { expiresIn: 3600 * 24 })
  reply.status(200).send({
    data: {
      token,
    },
  })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '/login',
    schema,
    handler,
  })
}
