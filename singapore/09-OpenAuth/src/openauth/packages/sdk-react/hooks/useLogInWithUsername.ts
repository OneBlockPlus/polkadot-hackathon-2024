import { useCallback, useState } from 'react'

import { useOpenAuth } from './useOpenAuth'

export function useLogInWithUsername() {
  const { config, logIn, client } = useOpenAuth()
  const [loading, setLoading] = useState(false)

  const logInWithUsername = useCallback(
    async (username: string, password: string, type: 'login' | 'register') => {
      setLoading(true)
      try {
        const data = await client.user.logInWithUsername({ appId: config.appId, username, password, type })
        await logIn(data.token)
        setLoading(false)
      } catch (error) {
        setLoading(false)
        throw error
      }
    },
    [client.user, config.appId, logIn],
  )

  return {
    logInWithUsername,
    loading,
  }
}
