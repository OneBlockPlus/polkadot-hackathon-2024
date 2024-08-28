import axios from 'axios'

import type { GithubCodeParams, GithubToken, GithubTokenQueryParams, GithubUser } from '../models/github'

export enum GithubCookieNames {
  AppId = 'OpenAuthAppId',
  RedirectUri = 'OpenAuthRedirectUri',
  RedirectUrl = 'OpenAuthRedirectUrl',
}

export function generateAuthUrl({ clientId, scopes = ['user'], redirectUri }: GithubCodeParams) {
  const searchParams = new URLSearchParams()
  const csrfState = Math.random().toString(36).slice(2)

  searchParams.append('client_id', clientId)
  searchParams.append('scope', scopes.join(','))
  searchParams.append('redirect_uri', redirectUri)
  searchParams.append('state', csrfState)

  return `https://github.com/login/oauth/authorize/?${searchParams.toString()}`
}

export async function getAccessToken(params: GithubTokenQueryParams) {
  const data = await axios.post<GithubToken>('https://github.com/login/oauth/access_token', params, {
    headers: {
      Accept: 'application/json',
    },
  })
  return data.data
}

export async function getGithubUser(token: string, tokenType?: string) {
  const data = await axios.get<GithubUser>('https://api.github.com/user', {
    headers: {
      Authorization: `${tokenType ?? 'Bearer'} ${token}`,
    },
  })
  return data.data
}
