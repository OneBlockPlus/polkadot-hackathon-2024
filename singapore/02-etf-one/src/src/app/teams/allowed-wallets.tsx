'use client'
import { Wallet } from '@/generated/public/Wallet'
import { Avatar } from '@/components/ui/avatar'
import Identicon from '@polkadot/react-identicon'


export async function AllowedWallets({ wallets }: { wallets: Wallet[] }) {

  return (
    <>
      {wallets?.map((wallet) => (
        <Avatar key={wallet.id} className="h-4 w-4 rounded-full">
          <Avatar className="h-9 w-9 rounded-full sm:flex">
            <Identicon value={wallet.address} size={36} theme={'polkadot'} />
          </Avatar>
        </Avatar>
      ))}
    </>
  )
}
