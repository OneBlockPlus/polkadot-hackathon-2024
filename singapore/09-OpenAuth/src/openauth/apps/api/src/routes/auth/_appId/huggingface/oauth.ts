import { Type } from '@fastify/type-provider-typebox'
import type { FastifyInstance } from 'fastify'

import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../../../models/typebox'
import { generateAuthUrl, HuggingfaceCookieNames } from '../../../../utils/huggingface'
import { prisma } from '../../../../utils/prisma'
import { ERROR400_SCHEMA } from '../../../../utils/schema'

const schema = {
  tags: ['Auth'],
  summary: 'Huggingface oauth',
  params: Type.Object({
    appId: Type.String(),
  }),
  querystring: Type.Object({
    endpoint: Type.String(),
    redirectUrl: Type.String(),
  }),
  response: {
    400: ERROR400_SCHEMA,
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { appId } = request.params
  const { endpoint, redirectUrl } = request.query
  const app = await prisma.app.findUnique({ where: { id: appId } })
  if (!app?.huggingfaceClientId || !app?.huggingfaceAppSecret) {
    return reply.status(400).send({ message: 'The Huggingface client id is not set.' })
  }

  const redirectUri = `${endpoint}/auth/${appId}/huggingface/callback`
  const url = generateAuthUrl({ clientId: app.huggingfaceClientId, redirectUri })

  reply.setCookie(HuggingfaceCookieNames.AppId, appId, { maxAge: 60000 })
  reply.setCookie(HuggingfaceCookieNames.RedirectUri, redirectUri, { maxAge: 60000 })
  reply.setCookie(HuggingfaceCookieNames.RedirectUrl, redirectUrl, { maxAge: 60000 })

  reply.redirect(url)
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/oauth',
    schema,
    handler,
  })
}
