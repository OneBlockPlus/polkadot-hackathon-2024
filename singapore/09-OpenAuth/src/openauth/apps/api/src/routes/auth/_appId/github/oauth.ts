import { Type } from '@fastify/type-provider-typebox'
import type { FastifyInstance } from 'fastify'

import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../../../models/typebox'
import { generateAuthUrl, GithubCookieNames } from '../../../../utils/github'
import { prisma } from '../../../../utils/prisma'
import { ERROR400_SCHEMA } from '../../../../utils/schema'

const schema = {
  tags: ['Auth'],
  summary: 'Github oauth',
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
  if (!app?.githubClientId || !app?.githubClientSecret) {
    return reply.status(400).send({ message: 'The Github client id is not set.' })
  }

  const redirectUri = `${endpoint}/auth/${appId}/github/callback`
  const url = generateAuthUrl({ clientId: app.githubClientId, redirectUri })

  reply.setCookie(GithubCookieNames.AppId, appId, { maxAge: 60000 })
  reply.setCookie(GithubCookieNames.RedirectUri, redirectUri, { maxAge: 60000 })
  reply.setCookie(GithubCookieNames.RedirectUrl, redirectUrl, { maxAge: 60000 })

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
