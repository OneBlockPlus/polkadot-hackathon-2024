import { useGoogleLogin } from '@react-oauth/google'
import { useCallback, useState } from 'react'

import { useOpenAuth } from './useOpenAuth'

export function useBindWithGoogle() {
  const { client, refetch } = useOpenAuth()
  const [loading, setLoading] = useState(false)

  const googleLogin = useGoogleLogin({
    onNonOAuthError: (error) => {
      console.error(error)
      setLoading(false)
    },
    onError: (error) => {
      console.error(error)
      setLoading(false)
    },
    onSuccess: async (tokenResponse) => {
      try {
        const token = tokenResponse.access_token
        const userinfo = await (
          await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
        ).json()
        await client.user.bindWithGoogle({ email: userinfo.email, token })
        await refetch()
      } catch (error) {
        console.error(error)
      }
      setLoading(false)
    },
  })

  const bindWithGoogle = useCallback(() => {
    setLoading(true)
    googleLogin()
  }, [googleLogin])

  return {
    bindWithGoogle,
    loading,
  }
}
