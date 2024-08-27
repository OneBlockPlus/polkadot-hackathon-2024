import { Type } from '@fastify/type-provider-typebox'
import { TypeAuthHeaders, TypePageMeta, TypePageParams, TypeUser } from '@open-auth/sdk-core'
import { Prisma } from '@prisma/client'
import type { FastifyInstance } from 'fastify'

import { verifyApp } from '../../../handlers/verifyApp'
import type { AppAuthPayload } from '../../../models/request'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../../models/typebox'
import { transformUserToReponse } from '../../../repositories/transform'
import { prisma } from '../../../utils/prisma'

const schema = {
  tags: ['App - Users'],
  summary: 'List users',
  querystring: Type.Intersect([
    TypePageParams,
    Type.Object({
      search: Type.Optional(Type.String()),
      sortBy: Type.Optional(Type.String()),
      order: Type.Optional(Type.Union([Type.Literal(Prisma.SortOrder.asc), Type.Literal(Prisma.SortOrder.desc)])),
    }),
  ]),
  headers: TypeAuthHeaders,
  response: {
    200: Type.Object({
      data: Type.Array(TypeUser),
      meta: TypePageMeta,
    }),
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { appId } = request.user as AppAuthPayload
  const { page, limit, sortBy, order, search } = request.query
  const whereFilters: Prisma.UserWhereInput = {
    appId,
  }
  if (search) {
    if (search.includes('@')) {
      whereFilters.OR = [
        { google: search },
        { email: search },
      ]
    } else if (search.length === 8) {
      whereFilters.referCode = search
    } else if (search.length === 36 && search.includes('-')) {
      whereFilters.id = search
    } else if (search.length === 44) {
      whereFilters.solAddress = search
    } else if (search.length === 42 && search.startsWith('0x')) {
      whereFilters.ethAddress = search
    } else if (/^\d+$/.test(search)) {
      whereFilters.OR = [
        { telegram: search },
        { discord: search },
      ]
    } else {
      whereFilters.username = search
    }
  }
  const totalCount = await prisma.user.count({ where: whereFilters })
  const users = await prisma.user.findMany({
    where: whereFilters,
    take: limit,
    skip: (page - 1) * limit,
    orderBy: sortBy ? { [sortBy]: order } : undefined,
  })
  reply.status(200).send({
    data: users.map(user => transformUserToReponse(user)),
    meta: {
      totalItems: totalCount,
      totalPages: Math.ceil(totalCount / limit),
    },
  })
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '',
    onRequest: [verifyApp],
    schema,
    handler,
  })
}
