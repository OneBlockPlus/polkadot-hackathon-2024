import { Animator, AnimatorGeneralProvider } from '@arwes/react'
import { shorten } from '@did-network/dapp-sdk'

import { useAccounts } from '@/contexts/dot/AccountsContext.tsx'
import { WalletModal } from '@/contexts/dot/header/WalletModal.tsx'

export function ConnectDOT() {
  const { account, connecting } = useAccounts()
  const [show, setShow] = useState(false)

  return (
    <>
      <button className="flex items-center pr-4" onClick={() => setShow(true)}>
        {connecting && <span className="i-line-md:loading-twotone-loop inline-flex mr-1 w-4 h-4 text-white"></span>}
        {account ? `${account.name} (${shorten(account.address)})` : 'Connect Wallet'}
      </button>

      <AnimatorGeneralProvider
        duration={{
          enter: 0.1,
          exit: 0.1,
          stagger: 0.05,
        }}
        disabled={false}
        dismissed={false}
      >
        <Animator root active={show}>
          <WalletModal onClose={() => setShow(false)} />
        </Animator>
      </AnimatorGeneralProvider>
    </>
  )
}
