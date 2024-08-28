import type { GlobalConfig, OpenAuthClient, UserProfile } from '@open-auth/sdk-core'

export interface IOpenAuthConfig {
  appId: string
  endpoint: string
  googleClientId?: string
  oauthRedirectUrl?: string
  onError?: (error: Error) => void
}

export interface IOpenAuthContext {
  config: IOpenAuthConfig
  client: OpenAuthClient

  globalConfig?: GlobalConfig
  token?: string
  profile?: UserProfile

  logIn: (token: string) => Promise<void>
  logOut: () => void
  refetch: () => Promise<void>
}
