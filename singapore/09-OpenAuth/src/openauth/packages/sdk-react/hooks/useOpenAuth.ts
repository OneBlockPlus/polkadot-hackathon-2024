import { useContext } from 'react'

import { OpenAuthContext } from '../context/OpenAuthContext'

export function useOpenAuth() {
  const context = useContext(OpenAuthContext)

  return {
    config: context.config,
    globalConfig: context.globalConfig,
    token: context.token,
    client: context.client,
    profile: context.profile,
    logIn: context.logIn,
    logOut: context.logOut,
    refetch: context.refetch,
  }
}
