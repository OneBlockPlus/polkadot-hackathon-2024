'use client'

import { Button } from '@/components/ui/button'
import { PolkaDotSender, usePolkadotSender } from '@/lib/use-polkadot'

// Do something
export default function Page() {
  const sender = usePolkadotSender()
  return <Button onClick={(e) => test(sender)}>button</Button>
}

async function test(sender: PolkaDotSender) {
  const { web3Enable, web3Accounts, web3FromSource } = await import(
    '@polkadot/extension-dapp'
  )
  const extensions = await web3Enable('my cool dapp')

  const allAccounts = await web3Accounts()

  const account = allAccounts[0]

  sender(account.address, '5FWWejrrS4RHMUAbdj8ZsmnfZH5BVSp9yZqkyy3WAbUyJUiG', 5)

}
