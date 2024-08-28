import { encodeBase58 } from 'ethers'
import { useCallback, useState } from 'react'

import { getSolanaProvider } from '../utils/getProvider'
import { useOpenAuth } from './useOpenAuth'

export function useBindWithSolana() {
  const { globalConfig, client, refetch } = useOpenAuth()
  const [loading, setLoading] = useState(false)

  const bindWithSolana = useCallback(async () => {
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
      await client.user.bindWithSolana({ solAddress: address, signature })
      await refetch()
      setLoading(false)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }, [globalConfig, client.user, refetch])

  return {
    bindWithSolana,
    loading,
  }
}
