import type { FastifyInstance } from 'fastify'

import type { TikTokRedirectQueryParams } from '../../../../models/tiktok'
import { TypeTikTokRedirectQueryParams } from '../../../../models/tiktok'
import type { FastifyReplyTypebox, FastifyRequestTypebox } from '../../../../models/typebox'
import { prisma } from '../../../../utils/prisma'
import { ERROR500_SCHEMA } from '../../../../utils/schema'
import { getAccessToken, TikTokCookieNames } from '../../../../utils/tiktok'

const schema = {
  tags: ['Auth'],
  summary: 'TikTok callback',
  queryString: TypeTikTokRedirectQueryParams,
  response: {
    500: ERROR500_SCHEMA,
  },
}

async function handler(request: FastifyRequestTypebox<typeof schema>, reply: FastifyReplyTypebox<typeof schema>) {
  const { error, error_description, code } = request.query as TikTokRedirectQueryParams
  const appId = request.cookies[TikTokCookieNames.AppId]
  const codeVerifier = request.cookies[TikTokCookieNames.Verifier]
  const redirectUri = request.cookies[TikTokCookieNames.RedirectUri]
  const redirectUrl = request.cookies[TikTokCookieNames.RedirectUrl]

  if (!appId || !codeVerifier || !redirectUrl || !redirectUri) {
    return reply.status(500).send({ message: 'Missing cookies' })
  }

  if (error && error_description) {
    const searchParams = new URLSearchParams()
    searchParams.append('error', error)
    return reply.redirect(`${redirectUrl}?${searchParams.toString()}`)
  }

  const app = await prisma.app.findUnique({ where: { id: appId } })
  if (!app?.tiktokClientKey || !app?.tiktokClientSecret) {
    return reply.status(500).send({ message: 'TikTok client key is not set' })
  }

  const searchParams = new URLSearchParams()
  searchParams.append('auth_type', 'openauth_tiktok')

  try {
    const { access_token, token_type, open_id } = await getAccessToken({
      code,
      client_key: app.tiktokClientKey,
      client_secret: app.tiktokClientSecret,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    })
    searchParams.append('open_id', open_id)
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
