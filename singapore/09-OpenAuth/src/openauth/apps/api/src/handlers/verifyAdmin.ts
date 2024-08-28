import type { FastifyReply, FastifyRequest } from 'fastify'

import type { AdminJwtPayload } from '../models/request'
import { prisma } from '../utils/prisma'

export async function verifyAdmin(request: FastifyRequest, reply: FastifyReply) {
  try {
    const result = await request.jwtVerify<AdminJwtPayload>()
    if (!result.adminId) {
      return reply.code(401).send({ message: 'Unauthorized' })
    }
    const admin = await prisma.admin.findUnique({ where: { id: result.adminId, isDeleted: false } })
    if (!admin) {
      return reply.code(401).send({ message: 'Unauthorized' })
    }
  } catch {
    return reply.code(401).send({ message: 'Unauthorized' })
  }
}
