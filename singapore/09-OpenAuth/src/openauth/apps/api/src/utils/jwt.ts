import { randomUUID } from 'node:crypto'

import type { JwtPayload } from '../models/request'
import type { FastifyReplyTypebox } from '../models/typebox'
import { redis } from './redis'

export async function validateSession(sessionId: string) {
  const jwtTTL = await redis.get(sessionId)
  if (!jwtTTL) {
    return false
  }

  await redis.set(sessionId, jwtTTL, 'EX', jwtTTL)
  return true
}

export async function generateJwtToken(
  reply: FastifyReplyTypebox<any>,
  { userId, appId, jwtTTL }: { userId: string, appId: string, jwtTTL: number },
) {
  const sessionId = jwtTTL > 0 ? randomUUID() : undefined
  const payload: JwtPayload = { userId, appId, sessionId }

  if (sessionId) {
    await redis.set(sessionId, jwtTTL, 'EX', jwtTTL)
    return reply.jwtSign(payload)
    // return reply.jwtSign(payload, { expiresIn: jwtTTL })
  }

  return reply.jwtSign(payload)
}
