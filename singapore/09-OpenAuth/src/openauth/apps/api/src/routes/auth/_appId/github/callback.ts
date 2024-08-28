import type { FastifyInstance } from 'fastify'

import type { GithubRedirectQueryParams } from '../../../../models/github'
import { TypeGithubRedirectQueryParams } from '../../../../models/github'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../../../models/typebox'
import { getAccessToken, GithubCookieNames } from '../../../../utils/github'
import { prisma } from '../../../../utils/prisma'
import { ERROR500_SCHEMA } from '../../../../utils/schema'

const schema = {
  tags: ['Auth'],
  summary: 'Github callback',
  queryString: TypeGithubRedirectQueryParams,
  response: {
    500: ERROR500_SCHEMA,
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { error, error_description, code } = request.query as GithubRedirectQueryParams
  const appId = request.cookies[GithubCookieNames.AppId]
  const redirectUri = request.cookies[GithubCookieNames.RedirectUri]
  const redirectUrl = request.cookies[GithubCookieNames.RedirectUrl]

  if (!appId || !redirectUrl || !redirectUri) {
    return reply.status(500).send({ message: 'Missing cookies' })
  }

  if (error && error_description) {
    const searchParams = new URLSearchParams()
    searchParams.append('error', error)
    return reply.redirect(`${redirectUrl}?${searchParams.toString()}`)
  }

  const app = await prisma.app.findUnique({ where: { id: appId } })
  if (!app?.githubClientId || !app?.githubClientSecret) {
    return reply.status(500).send({ message: 'Github client id is not set' })
  }

  const searchParams = new URLSearchParams()
  searchParams.append('auth_type', 'openauth_github')

  try {
    const { access_token, token_type } = await getAccessToken({
      code,
      client_id: app.githubClientId,
      client_secret: app.githubClientSecret,
      redirect_uri: redirectUri,
    })
    searchParams.append('access_token', access_token)
    searchParams.append('token_type', token_type)
  } catch (error: any) {
    searchParams.append('error', error.message ?? error.name ?? 'Unknown error')
  }

  reply.redirect(`${redirectUrl}?${searchParams.toString()}`)
}

export default async function (fastify: FastifyInstance) {
  fastify.route({
    method: 'GET',
    url: '/callback',
    schema,
    handler,
  })
}
