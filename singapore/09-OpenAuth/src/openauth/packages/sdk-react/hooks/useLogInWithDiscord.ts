import { fetchDiscordUser, useDiscordLogin } from '@open-auth/react-discord'
import { useState } from 'react'

import { useOpenAuth } from './useOpenAuth'

export function useLogInWithDiscord() {
  const { config, logIn, globalConfig, client } = useOpenAuth()
  const [loading, setLoading] = useState(false)

  const logInWithDiscord = useDiscordLogin({
    applicationId: globalConfig?.discordApplicationId ?? undefined,
    onStart: () => {
      setLoading(true)
    },
    onClose: () => {
      setLoading(false)
    },
    onError: (error) => {
      console.error(error)
    },
    onSuccess: async (token) => {
      try {
        const user = await fetchDiscordUser(token)
        const data = await client.user.logInWithDiscord({
          appId: config.appId,
          discord: user.id,
          token: token.access_token,
        })
        await logIn(data.token)
      } catch (error) {
        console.error(error)
      }
      setLoading(false)
    },
  })

  return {
    logInWithDiscord,
    loading,
  }
}
