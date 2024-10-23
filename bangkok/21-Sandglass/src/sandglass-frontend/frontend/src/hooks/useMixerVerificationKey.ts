import { useEffect, useState } from 'react'

import { ApiPromise } from '@polkadot/api'
import { useInkathon } from '@scio-labs/use-inkathon'

export const getKey = async (api: ApiPromise): Promise<any> => {
  // Query the chain and parse data
  const key: any = await api.query.mixer.verificationKeyStorage()

  return key.toHuman()
}

/**
 * Hook that returns the native token order of the given `address`.
 */
export const useMixerVerificationKey = (watch?: boolean): any => {
  const { api } = useInkathon()
  const [verificationKey, setVerificationKey] = useState('')
  const [unsubscribes, setUnsubscribes] = useState<(VoidFunction | null)[]>([])

  useEffect(() => {
    const updateKeyData = (data: any) => {
      setVerificationKey(() => data)
    }

    if (!api) {
      updateKeyData('')
      return
    }

    getKey(api).then(updateKeyData)
  }, [api])

  return verificationKey
}
