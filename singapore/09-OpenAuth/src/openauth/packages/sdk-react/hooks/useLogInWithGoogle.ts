import { useGoogleLogin } from '@react-oauth/google'
import { useCallback, useState } from 'react'

import { useOpenAuth } from './useOpenAuth'

export function useLogInWithGoogle() {
  const { logIn, config, client } = useOpenAuth()
  const [loading, setLoading] = useState(false)

  const googleLogin = useGoogleLogin({
    onError: (error) => {
      console.error(error)
      setLoading(false)
    },
    onNonOAuthError: (error) => {
      console.error(error)
      setLoading(false)
    },
    onSuccess: async (tokenResponse) => {
      const token = tokenResponse.access_token
      try {
        const userinfo = await (
          await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        ).json()
        const { email } = userinfo
        const data = await client.user.logInWithGoogle({ appId: config.appId, email, token })
        await logIn(data.token)
      } catch (error) {
        console.error(error)
      }
      setLoading(false)
    },
  })

  const logInWithGoogle = useCallback(() => {
    setLoading(true)
    googleLogin()
  }, [googleLogin])

  return {
    logInWithGoogle,
    loading,
  }
}
