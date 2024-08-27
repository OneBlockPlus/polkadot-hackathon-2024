import type { FastifyReply, FastifyRequest } from 'fastify'

import type { JwtPayload } from '../models/request'
import { validateSession } from '../utils/jwt'

export async function verifyUser(request: FastifyRequest, reply: FastifyReply) {
  try {
    const { userId, appId, sessionId } = await request.jwtVerify<JwtPayload>()
    if (!userId || !appId) {
      return reply.code(401).send({ message: 'Unauthorized' })
    }

    if (sessionId) {
      const isValid = await validateSession(sessionId)
      if (!isValid) {
        return reply.code(401).send({ message: 'Unauthorized' })
      }
    }
  } catch {
    return reply.code(401).send({ message: 'Unauthorized' })
  }
}
