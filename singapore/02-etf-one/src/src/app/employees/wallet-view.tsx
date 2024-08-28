'use client'
import { Wallet } from '@/generated/public/Wallet'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import Image from 'next/image'
import { Avatar } from '@/components/ui/avatar'
import Identicon from '@polkadot/react-identicon'


export function WalletView(wallet: Wallet) {
  return (
    <Card className="relative">
      <Image
        src={'/icons/eth.svg'}
        alt="Eth logo"
        className="absolute right-4 top-4 rounded-full"
        width={24}
        height={24}
        priority
      />
      <CardHeader className="">
        <CardTitle>
          <div className="flex items-center gap-4">
            <Avatar className="h-9 w-9 rounded-full sm:flex">
              <Identicon value={wallet.address} size={36} theme={'polkadot'} />
            </Avatar>
            <div className="flex gap-2">
              <div>{wallet.name}</div>
            </div>
          </div>
        </CardTitle>
        <CardDescription className="truncate">{wallet.address}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-right text-2xl font-bold">
          {Number(wallet.balance ?? 0).toLocaleString('en-US', {
            style: 'currency',
            currency: 'USD'
          })}
        </div>
      </CardContent>
    </Card>
  )
}