import { ApiPromise } from '@polkadot/api'
import { ed25519PairFromSeed, randomAsU8a } from '@polkadot/util-crypto'
import { Keypair } from '@polkadot/util-crypto/types'
import { Account, BaseWallet } from '@polkadot-onboard/core'
import { useWallets } from '@polkadot-onboard/react'
import { createContext, useContext, useEffect, useState } from 'react'

import { getApi, LocalStorageKeys } from './utils'

interface AccountsContextProps {
  wallet?: BaseWallet
  account?: Account
  setWallet: (value: BaseWallet) => void
  setAccount: (value: Account) => void
  connecting?: boolean
  api?: ApiPromise
  keypair?: Keypair
}

const AccountsContext = createContext<AccountsContextProps>({
  setAccount: () => {},
  setWallet: () => {},
})

export const useAccounts = () => useContext(AccountsContext)

export const AccountsContextProvider = ({ children }: any) => {
  const [activeAccount, setActiveAccount] = useState<Account>()
  const [activeWallet, setActiveWallet] = useState<BaseWallet>()
  const [api, setApi] = useState<ApiPromise>()
  const [keypair, setKeypair] = useState<any>()
  const { wallets } = useWallets()
  const [connecting, setConnecting] = useState<boolean>()

  useEffect(() => {
    // init api
    getApi().then(setApi).catch(console.error)

    // init e2e seed
    let seed = localStorage.getItem(LocalStorageKeys.SeedE2E)
    if (!seed) {
      seed = randomAsU8a().join(',')
      localStorage.setItem(LocalStorageKeys.SeedE2E, seed)
    }
    const keypair = ed25519PairFromSeed(new Uint8Array(seed.split(',').map((i) => parseInt(i))))
    setKeypair(keypair)
  }, [])

  // load from local storage
  useEffect(() => {
    ;(async () => {
      setConnecting(true)
      const storedWallet = localStorage.getItem(LocalStorageKeys.ActiveWallet)
      const storedAccount = localStorage.getItem(LocalStorageKeys.ActiveAccount)
      const foundWallet = wallets?.find((wallet) => wallet.metadata.title === storedWallet)

      if (foundWallet) {
        setActiveWallet(foundWallet)

        await foundWallet.connect()
        const accounts = await foundWallet.getAccounts()
        const foundAccount = accounts.find((account) => account.address === storedAccount)
        if (foundAccount) {
          setActiveAccount(foundAccount)
        }
      }
      setConnecting(false)
    })()
  }, [wallets])

  const setWallet = useCallback((activeWallet: BaseWallet) => {
    setActiveWallet(activeWallet)
    if (activeWallet?.metadata.title) {
      localStorage.setItem(LocalStorageKeys.ActiveWallet, activeWallet.metadata.title)
    } else {
      localStorage.removeItem(LocalStorageKeys.ActiveWallet)
    }
  }, [])

  const setAccount = useCallback((activeAccount: Account) => {
    setActiveAccount(activeAccount)
    if (activeAccount?.address) {
      localStorage.setItem(LocalStorageKeys.ActiveAccount, activeAccount.address)
    } else {
      localStorage.removeItem(LocalStorageKeys.ActiveAccount)
    }
  }, [])

  return (
    <AccountsContext.Provider
      value={{
        account: activeAccount,
        wallet: activeWallet,
        setWallet,
        setAccount,
        connecting,
        api,
        keypair,
      }}
    >
      {children}
    </AccountsContext.Provider>
  )
}
