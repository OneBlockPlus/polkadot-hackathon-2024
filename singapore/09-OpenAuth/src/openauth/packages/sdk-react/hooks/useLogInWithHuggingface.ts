import { useCallback, useState } from 'react'

import { useOpenAuth } from './useOpenAuth'

export function useLogInWithHuggingface() {
  const { config } = useOpenAuth()
  const [loading, setLoading] = useState(false)

  const logInWithHuggingface = useCallback(
    () => {
      setLoading(true)
      const params = new URLSearchParams()
      params.append('endpoint', config.endpoint)
      params.append('redirectUrl', window.location.href)
      window.location.href = `${config.endpoint}/auth/${config.appId}/huggingface/oauth?${params.toString()}`
    },
    [config.appId, config.endpoint],
  )

  return {
    logInWithHuggingface,
    loading,
  }
}
