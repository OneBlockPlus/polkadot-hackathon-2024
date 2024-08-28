import { formatAmount, shorten } from '@did-network/dapp-sdk'
import { NavLink } from 'react-router-dom'
import { useCopyToClipboard } from 'usehooks-ts'

import { Header } from '@/components/layout/Header'
import { useProfile } from '@/hooks/api'

export default function () {
  const data = useProfile()
  const profile = useProfile()

  const { balance } = { balance: 0 }

  const [copiedValue, copy] = useCopyToClipboard()
  const onCopy = useCallback(async () => {
    await copy(data?.solWallet ?? '')
  }, [copy, data?.solWallet])

  if (!data || !profile) {
    return null
  }

  return (
    <>
      <Header title={data.username} subtitle={shorten(data.dotWallet, 12, 12)} icon={profile.openauth.avatar ?? ''} />

      <div className="h-full text-lg font-bold w-full">
        <div className="flex-center gap-x-4 mb-4">
          <NavLink to="/wallet/send" className="flex-1 bg-#0E0A33 border py-2 flex-row flex-center rounded-lg">
            Send
          </NavLink>
          <NavLink to="/wallet/receive" className="flex-1 bg-#0E0A33 border py-2 flex-row flex-center rounded-lg">
            Receive
          </NavLink>
        </div>
        <div className="mt-6 mb-2">Balance:</div>
        <div className="mb-2 bg-#0E0A33 border py-2 px-4 flex-row flex-center rounded-lg">
          <div className="flex-1 text-left flex items-center gap-x-4">
            <div className="leading-none">VARA</div>
          </div>
          <div>{formatAmount(balance, 9)}</div>
        </div>
        <div className="mb-2 bg-#0E0A33 border py-2 px-4 flex-row flex-center rounded-lg">
          <div className="flex-1 text-left flex items-center gap-x-4">
            <div className="leading-none">POINTS</div>
          </div>
          <div>{profile?.points}</div>
        </div>
      </div>
    </>
  )
}
