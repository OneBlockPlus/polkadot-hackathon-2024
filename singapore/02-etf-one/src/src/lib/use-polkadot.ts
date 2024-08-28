import { useEffect, useState } from 'react'
import { ApiPromise, WsProvider } from '@polkadot/api'
import { InjectedExtension } from '@polkadot/extension-inject/types'


export type PolkaDotSender = (from:string, to:string, amount: number)=>void

export const usePolkadotSender = (): PolkaDotSender => {
  const [api, setApi] = useState<ApiPromise>()
  const [injector, setInjector] = useState<InjectedExtension>()
  const [wsProvider, setWsProvider] = useState<WsProvider>()
  useEffect(() => {
    const initialConnection = async () => {
      const { web3Enable, web3Accounts, web3FromSource } = await import(
        '@polkadot/extension-dapp'
      )
      const { ApiPromise, WsProvider } = await import('@polkadot/api')
      await web3Enable('my app')
      const allAccounts = await web3Accounts()

      const account = allAccounts[0]
      if(!account){
        return
      }
      const wsProvider = new WsProvider('wss://polkadot-rpc.publicnode.com')
      const api = await ApiPromise.create({ provider: wsProvider })
      const injector = await web3FromSource(account.meta.source)
      setInjector(injector)
      setApi(api)
      setWsProvider(wsProvider)
    }
    initialConnection()
    return () => {
      api?.disconnect()
      wsProvider?.disconnect()
    }
  }, [])
  return async (from:string, to:string, amount: number) => {
    console.log('from',from, 'to:', to, 'amount:', amount)
    const transferExtrinsic = api?.tx.balances.transferAllowDeath(
      to,
      Number(amount),
    )
    const { web3Accounts } = await import('@polkadot/extension-dapp')

    transferExtrinsic!
      .signAndSend(from, { signer: injector?.signer }, ({ status }) => {
        if (status.isInBlock) {
          console.log(`Completed at block hash #${status.asInBlock.toString()}`)
        } else {
          console.log(`Current status: ${status.type}`)
        }
      })
      .catch((error: any) => {
        console.log(':( transaction failed', error)
      })
  }
}

export async function send(api: ApiPromise, injector: InjectedExtension) {

}