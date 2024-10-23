import { WalletAggregator } from '@polkadot-onboard/core'
import { InjectedWalletProvider } from '@polkadot-onboard/injected-wallets'
import { PolkadotWalletsContextProvider } from '@polkadot-onboard/react'

import { AccountsContextProvider } from '@/contexts/dot/AccountsContext.tsx'

import { APP_NAME, extensionConfig } from './config.ts'

export function PolkadotProvider({ children }: any) {
  const injectedWalletProvider = new InjectedWalletProvider(extensionConfig, APP_NAME)
  const walletAggregator = new WalletAggregator([injectedWalletProvider])

  return (
    <PolkadotWalletsContextProvider walletAggregator={walletAggregator}>
      <AccountsContextProvider>{children}</AccountsContextProvider>
    </PolkadotWalletsContextProvider>
  )
}
