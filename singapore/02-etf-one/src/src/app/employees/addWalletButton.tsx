'use client'

import { Button } from '@/components/ui/button'
import { PlusCircle } from 'lucide-react'
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Image from 'next/image'
import { useState } from 'react'
import {WalletType } from '@/app/wallets/walletType'
import { toast } from 'sonner'
import { addWallet } from '@/app/wallets/actions'


export function AddWalletButton() {
  const [name, setName] = useState('Untitled')
  const [address, setAddress] = useState('')
  const [type, _] = useState(WalletType.PolkaDot)

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Wallet
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Wallet</SheetTitle>
          <SheetDescription>
            Add new wallet information to your account.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Address
            </Label>
            <Input
              name="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Wallet Type
            </Label>
            <Select defaultValue={type}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select......" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ETHEREUM">
                  <div className={'flex gap-3'}>
                    <Image
                      src={'/icons/eth.svg'}
                      alt="Eth logo"
                      className=""
                      width={18}
                      height={18}
                      priority
                    />
                    <div>Ethereum</div>
                  </div>
                </SelectItem>
                <SelectItem value="POLKADOT">
                  <div className={'flex gap-3'}>
                    <Image
                      src={'/icons/dot.svg'}
                      alt="Eth logo"
                      className=""
                      width={18}
                      height={18}
                      priority
                    />
                    <div>Polkadot</div>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              onClick={async () => {
                const wallet = await addWallet({ name, address, type })
                toast.info('Wallet added successfully')
              }}
              disabled={address === ''}>
              Add
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
