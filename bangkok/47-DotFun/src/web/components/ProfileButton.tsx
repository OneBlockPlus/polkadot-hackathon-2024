import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { IconLoader2, IconLogout, IconUserCircle, IconWallet } from '@tabler/icons-react'
import usePrevious from '@/hooks/usePrevious'
import { trpc } from '@/utils/trpc'
import { skipToken } from '@tanstack/react-query'
import { useRouter } from 'next/router'
import { ConnectDOT } from '@/contexts/dot/header/ConnectDOT'

export function ProfileButton() {
  const router = useRouter()
  const [show, setShow] = useState(false)
  const { userId } = useAuth()
  const { publicKey } = useWallet()
  const { data, isFetching } = trpc.user.profile.getProfile.useQuery(userId ? { id: userId } : skipToken)
  const { logInPolkadot, logOut, profile, updateProfile } = useAuth()

  useEffect(() => {
    updateProfile(data)
  }, [updateProfile, data])

  // auto login on connect
  const prevPublicKey = usePrevious(publicKey)
  useEffect(() => {
    if (isFetching || profile || userId) {
      return
    }
    if (publicKey !== prevPublicKey && publicKey) {
      logInPolkadot().catch(console.error)
    }
  }, [profile, isFetching, logInPolkadot, prevPublicKey, publicKey, userId])

  // logged in already
  if (profile) {
    return (
      <DropdownMenu open={show} onOpenChange={setShow}>
        <DropdownMenuTrigger>
          <div className="flex justify-center items-center rounded gap-1 w-32 py-2">
            <IconWallet size={20} />
            {profile.displayName}
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="">
          <DropdownMenuItem onSelect={() => router.push(`/users/${profile.id}`)}>
            <div className="py-2 flex items-center gap-1">
              <IconUserCircle size={18} />
              Profile
            </div>
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={logOut}>
            <div className="py-2 flex items-center gap-1 text-red-600 hover:text-red-700">
              <IconLogout size={18} />
              Logout
            </div>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  // not logged in
  if (publicKey) {
    return (
      <div className="h-40px w-32 flex flex-col leading-none gap-0.5">
        <div className="flex items-center gap-1">
          <IconLoader2 size={20} /> Logging In...
        </div>
      </div>
    )
  }

  return <ConnectDOT />
}
