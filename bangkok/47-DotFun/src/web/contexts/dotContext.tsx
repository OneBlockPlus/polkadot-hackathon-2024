import { ConnectDOT } from '@/contexts/dot/header/ConnectDOT.tsx'
import useSubmitTask from '@/contexts/dot/useSubmitTask.ts'

import { AppContext, usePayload } from './common.tsx'
import { useAccounts } from './dot/AccountsContext.tsx'

export function DotContext({ children }: any) {
  const { account } = useAccounts()
  const walletComponent = <ConnectDOT />
  const { payload, setPayload } = usePayload()
  const submitTask = useSubmitTask(payload)

  return (
    <AppContext.Provider
      value={{
        walletAddress: account?.address,
        substrateAddress: account?.address,
        walletComponent,
        submitTask,
        payload,
        setPayload,
      }}
    >
      {children}
    </AppContext.Provider>
  )
}
