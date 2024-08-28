import { ethers } from 'ethers'
import { useCallback, useState } from 'react'

import { getEthereumProvider } from '../utils/getProvider'
import { useOpenAuth } from './useOpenAuth'

export function useBindWithEthereum() {
  const { globalConfig, client, refetch } = useOpenAuth()
  const [loading, setLoading] = useState(false)

  const bindWithEthereum = useCallback(async () => {
    if (!globalConfig) {
      return
    }
    const ethereum = getEthereumProvider()
    if (!ethereum) {
      throw new Error('No wallet found')
    }
    setLoading(true)
    try {
      const provider = new ethers.BrowserProvider(ethereum)
      await provider.send('eth_requestAccounts', [])
      const signer = await provider.getSigner()
      const address = await signer.getAddress()
      const signature = await signer.signMessage(globalConfig.message)
      await client.user.bindWithEthereum({ ethAddress: address, signature })
      await refetch()
      setLoading(false)
    } catch (error) {
      setLoading(false)
      throw error
    }
  }, [client.user, globalConfig, refetch])

  return {
    bindWithEthereum,
    loading,
  }
}
