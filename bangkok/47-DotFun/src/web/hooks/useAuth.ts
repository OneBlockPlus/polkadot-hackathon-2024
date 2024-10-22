import { trpc } from '@/utils/trpc'
import { useCallback, useState } from 'react'
import base58 from 'bs58'
import { create } from 'zustand'
import { UserProfile } from '@/utils/types'
import { useCookies } from 'react-cookie'

type State = { profile: UserProfile | undefined }
type Action = { updateProfile: (profile: UserProfile | undefined) => void }

const useAuthStore = create<State & Action>((set) => ({
  profile: undefined,
  updateProfile: (profile) => set(() => ({ profile })),
}))

export function useAuth() {
  const [cookies] = useCookies(['userId'])
  const userId = cookies.userId as string | undefined
  const { publicKey, signMessage, disconnect } = useDotWallet()
  const [loading, setLoading] = useState(false)
  const { data: { message } = {} } = trpc.auth.message.useQuery()
  const { mutateAsync: logInMutate, isPending: logInPending } = trpc.auth.logInPolkadot.useMutation()
  const { mutateAsync: logOutMutate, isPending: logOutPending } = trpc.auth.logOut.useMutation()

  const { profile, updateProfile } = useAuthStore()

  const logInPolkadot = useCallback(async () => {
    if (!publicKey || !message || !signMessage) {
      console.error('Missing publicKey, message, or signMessage: ', publicKey, message, signMessage)
      return
    }
    setLoading(true)
    try {
      const sig = await signMessage(new TextEncoder().encode(message))
      const signature = base58.encode(sig)
      await logInMutate({ wallet: publicKey.toBase58(), signature })
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }, [logInMutate, message, publicKey, signMessage])

  const logOut = useCallback(async () => {
    setLoading(true)
    try {
      updateProfile(undefined)
      await logOutMutate()
      await disconnect()
    } catch (error) {
      console.error(error)
    }
    setLoading(false)
  }, [updateProfile, logOutMutate, disconnect])

  return {
    userId,
    profile,
    updateProfile,
    logInPolkadot,
    logInPending: logInPending || loading,
    logOut,
    logOutPending: logOutPending || loading,
  }
}
