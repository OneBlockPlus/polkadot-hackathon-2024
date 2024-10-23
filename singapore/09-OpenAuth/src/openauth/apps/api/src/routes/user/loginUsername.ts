import { Type } from '@fastify/type-provider-typebox'
import { TypeLoginResponse } from '@open-auth/sdk-core'
import bcrypt from 'bcrypt'
import type { FastifyInstance } from 'fastify'

import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../models/typebox'
import { createUserByUsername } from '../../repositories/findOrCreateUser'
import { generateJwtToken } from '../../utils/jwt'
import { prisma } from '../../utils/prisma'
import { ERROR400_SCHEMA } from '../../utils/schema'

enum LoginType {
  Login = 'login',
  Register = 'register',
}

const schema = {
  tags: ['User'],
  summary: 'Log in with Username',
  body: Type.Object({
    appId: Type.String(),
    username: Type.String(),
    password: Type.String(),
    type: Type.Enum(LoginType),
  }),
  response: {
    200: Type.Object({
      data: TypeLoginResponse,
    }),
    400: ERROR400_SCHEMA,
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { appId, username, password, type } = request.body
  if (username.length < 3) {
    return reply.status(400).send({ message: 'Username must be at least 3 characters' })
  }
  if (password.length < 6) {
    return reply.status(400).send({ message: 'Password must be at least 6 characters' })
  }
  const app = await prisma.app.findUnique({ where: { id: appId } })
  if (!app) {
    return reply.status(400).send({ message: 'App not found' })
  }

  let user = await prisma.user.findFirst({ where: { appId, username } })

  switch (type) {
    case LoginType.Login: {
      if (!user) {
        return reply.status(400).send({ message: 'Incorrect username or password' })
      }
      const ok = await bcrypt.compare(password, user.password ?? '')
      if (!ok) {
        return reply.status(400).send({ message: 'Incorrect username or password' })
      }
      user = await prisma.user.update({
        where: { id: user.id },
        data: { lastSeenAt: new Date() },
      })
      break
    }
    case LoginType.Register: {
      if (user) {
        return reply.status(400).send({ message: 'Username already exists' })
      }
      user = await createUserByUsername({ appId, username, password })
      break
    }
    default: {
      return reply.status(400).send({ message: 'Invalid type' })
    }
  }

  const token = await generateJwtToken(reply, { userId: user.id, appId, jwtTTL: app.jwtTTL })
  reply.status(200).send({ data: { token } })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'POST',
    url: '/login-username',
    schema,
    handler,
  })
}
