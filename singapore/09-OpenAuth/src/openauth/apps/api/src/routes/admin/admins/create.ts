import { Type } from '@fastify/type-provider-typebox'
import { TypeAdmin } from '@open-auth/sdk-core'
import bcrypt from 'bcrypt'
import type { FastifyInstance } from 'fastify'

import { verifyAdmin } from '../../../handlers/verifyAdmin'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../../models/typebox'
import { SALT_ROUNDS } from '../../../utils/auth'
import { prisma } from '../../../utils/prisma'

const schema = {
  tags: ['Admin - Admins'],
  summary: 'Create admin',
  headers: Type.Object({
    Authorization: Type.String(),
  }),
  body: Type.Object({
    username: Type.String(),
    password: Type.String(),
  }),
  response: {
    201: Type.Object({
      data: TypeAdmin,
    }),
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { username, password: rawPassword } = request.body
  const password = await bcrypt.hash(rawPassword, SALT_ROUNDS)
  const admin = await prisma.admin.create({
    data: {
      username,
      password,
    },
  })

  reply.status(201).send({ data: admin })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '',
    onRequest: [verifyAdmin],
    schema,
    handler,
  })
}
