import crypto from 'node:crypto'

import axios from 'axios'

import type { TikTokCodeParams, TikTokToken, TikTokTokenQueryParams, TikTokUser } from '../models/tiktok'

export enum TikTokCookieNames {
  AppId = 'OpenAuthAppId',
  Verifier = 'OpenAuthVerifier',
  RedirectUri = 'OpenAuthRedirectUri',
  RedirectUrl = 'OpenAuthRedirectUrl',
}

function generateRandomString(length: number) {
  let result = ''
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
  const charactersLength = characters.length
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength))
  }
  return result
}

export function generateAuthUrl({ clientKey, scopes = ['user.info.basic'], redirectUri }: TikTokCodeParams) {
  const searchParams = new URLSearchParams()
  const csrfState = Math.random().toString(36).slice(2)
  const codeVerifier = generateRandomString(64)
  const codeChallenge = crypto.createHash('sha256')
    .update(codeVerifier)
    .digest('hex')
  searchParams.append('client_key', clientKey)
  searchParams.append('scope', scopes.join(','))
  searchParams.append('redirect_uri', redirectUri)
  searchParams.append('state', csrfState)
  searchParams.append('response_type', 'code')
  searchParams.append('code_challenge', codeChallenge)
  searchParams.append('code_challenge_method', 'S256')

  return {
    url: `https://www.tiktok.com/v2/auth/authorize/?${searchParams.toString()}`,
    csrfState,
    codeVerifier,
  }
}

export async function getAccessToken(params: TikTokTokenQueryParams) {
  const data = await axios.post<TikTokToken>('https://open.tiktokapis.com/v2/oauth/token/', new URLSearchParams(params).toString(), {
    headers: {
      ContentType: 'application/x-www-form-urlencoded',
    },
  })
  return data.data
}

export async function getTikTokUser(token: string, tokenType: string) {
  const data = await axios.get<{ data: { user: TikTokUser } }>('https://open.tiktokapis.com/v2/user/info/', {
    headers: {
      Authorization: `${tokenType} ${token}`,
    },
    params: {
      fields: 'open_id,union_id,avatar_url,display_name',
    },
  })
  return data.data
}
