import type { FastifyReply, FastifyRequest } from 'fastify'

import { prisma } from '../utils/prisma'

export async function verifyApp(request: FastifyRequest, reply: FastifyReply) {
  try {
    const authorization = request.headers.authorization ?? ''
    const secret = authorization.slice('Bearer '.length)
    const app = await prisma.app.findUnique({ where: { secret } })
    if (!app) {
      return reply.code(401).send({ message: 'Unauthorized' })
    }
    // eslint-disable-next-line require-atomic-updates
    request.user = { appId: app.id }
  } catch {
    return reply.code(401).send({ message: 'Unauthorized' })
  }
}
