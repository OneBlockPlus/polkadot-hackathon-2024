import { encodeBase58 } from 'ethers'
import { useCallback, useState } from 'react'

import { getSolanaProvider } from '../utils/getProvider'
import { useOpenAuth } from './useOpenAuth'

export function useLogInWithSolana() {
  const { config, globalConfig, logIn, client } = useOpenAuth()
  const [loading, setLoading] = useState(false)

  const logInWithSolana = useCallback(async () => {
    if (!globalConfig) {
      return
    }
    const provider = getSolanaProvider()
    if (!provider) {
      throw new Error('No wallet found')
    }
    setLoading(true)
    try {
      const resp = await provider.connect()
      const address = resp.publicKey.toString()
      const sig = await provider.signMessage(new TextEncoder().encode(globalConfig.message))
      const signature = encodeBase58(sig.signature)
      const data = await client.user.logInWithSolana({ appId: config.appId, solAddress: address, signature })
      await logIn(data.token)
      setLoading(false)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }, [globalConfig, client.user, config.appId, logIn])

  return {
    logInWithSolana,
    loading,
  }
}
