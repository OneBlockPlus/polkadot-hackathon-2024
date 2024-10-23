import { useCallback, useState } from 'react'

import { useOpenAuth } from './useOpenAuth'

export function useLogInWithGithub() {
  const { config } = useOpenAuth()
  const [loading, setLoading] = useState(false)

  const logInWithGithub = useCallback(
    () => {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('endpoint', config.endpoint)
      params.append('redirectUrl', window.location.href)
      window.location.href = `${config.endpoint}/auth/${config.appId}/github/oauth?${params.toString()}`
    },
    [config.appId, config.endpoint],
  )

  return {
    logInWithGithub,
    loading,
  }
}
