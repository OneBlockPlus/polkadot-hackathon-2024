import type { GlobalConfig, UserProfile } from '@open-auth/sdk-core'
import { OpenAuthClient } from '@open-auth/sdk-core'
import { GoogleOAuthProvider } from '@react-oauth/google'
import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useLocalStorage } from 'usehooks-ts'

import { StorageKeys } from '../utils/constants'
import type { IOpenAuthConfig } from '../utils/types'
import { OpenAuthContext } from './OpenAuthContext'

export function OpenAuthProvider({ config, children }: { config: IOpenAuthConfig, children: ReactNode }) {
  const [token, setToken] = useLocalStorage<string | undefined>(StorageKeys.Token, undefined)
  const [profile, setProfile] = useLocalStorage<UserProfile | undefined>(StorageKeys.Profile, undefined)
  const [globalConfig, setGlobalConfig] = useLocalStorage<GlobalConfig | undefined>(StorageKeys.Config, undefined)
  const [searchParams] = useSearchParams()
  const client = useMemo(() => new OpenAuthClient(config.endpoint), [config])

  const refetch = useCallback(async () => {
    if (client.user.isAuthorized()) {
      const profile = await client.user.getProfile()
      setProfile(profile)
    } else {
      setProfile(undefined)
    }
  }, [client, setProfile])

  const updateToken = useCallback(
    async (token?: string) => {
      setToken(token)
      client.user.updateToken(token)
      await refetch()
    },
    [setToken, client, refetch],
  )

  const logIn = useCallback((token: string) => updateToken(token), [updateToken])
  const logOut = useCallback(() => updateToken(), [updateToken])

  // update client error handling
  useEffect(() => {
    client.user.onError = (error) => {
      if (error.message === 'Unauthorized') {
        logOut().then(() => config.onError?.(error)).catch(console.error)
      } else {
        config.onError?.(error)
      }
    }
  }, [client, config, logOut])

  // refetch profile on mount
  useEffect(() => {
    if (token) {
      client.user.updateToken(token)
      refetch().catch(console.error)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // fetch global config on mount
  useEffect(() => {
    if (config.endpoint) {
      client.user
        .getConfig({ appId: config.appId })
        .then(data => setGlobalConfig(data))
        .catch(console.error)
    }
  }, [client, config, setGlobalConfig])

  // handle auth redirect
  useEffect(() => {
    const authType = searchParams.get('auth_type')
    switch (authType) {
      case 'openauth_tiktok': {
        const accessToken = searchParams.get('access_token')
        const openId = searchParams.get('open_id')
        if (accessToken && openId) {
          client.user
            .logInWithTikTok({ appId: config.appId, openId, token: accessToken })
            .then(({ token }) => logIn(token))
            .catch(console.error)
            .finally(() => {
              window.location.href = config.oauthRedirectUrl ?? '/'
            })
        }
        break
      }
      case 'openauth_github': {
        const accessToken = searchParams.get('access_token')
        const tokenType = searchParams.get('token_type')
        if (accessToken && tokenType) {
          client.user
            .logInWithGithub({ appId: config.appId, token: accessToken, tokenType })
            .then(({ token }) => logIn(token))
            .catch(console.error)
            .finally(() => {
              window.location.href = config.oauthRedirectUrl ?? '/'
            })
        }
        break
      }
      case 'openauth_huggingface': {
        const accessToken = searchParams.get('access_token')
        const tokenType = searchParams.get('token_type')
        if (accessToken && tokenType) {
          client.user
            .logInWithHuggingFace({ appId: config.appId, token: accessToken, tokenType })
            .then(({ token }) => logIn(token))
            .catch(console.error)
            .finally(() => {
              window.location.href = config.oauthRedirectUrl ?? '/'
            })
        }
        break
      }
      default: {
        break
      }
    }
  }, [client.user, config, logIn, searchParams])

  const value = useMemo(() => ({
    config,
    client,
    globalConfig,
    token,
    profile,
    logIn,
    logOut,
    refetch,
  }), [client, config, globalConfig, logIn, logOut, profile, refetch, token])

  let openAuthProvider = <OpenAuthContext.Provider value={value}>{children}</OpenAuthContext.Provider>

  if (config.googleClientId) {
    openAuthProvider = <GoogleOAuthProvider clientId={config.googleClientId}>{openAuthProvider}</GoogleOAuthProvider>
  }

  return openAuthProvider
}
