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


import { useState } from 'react'
import { toast } from 'sonner'
import { createTeam, WalletSelection } from '@/app/teams/actions'
import { Separator } from '@/components/ui/separator'
import { SelectWallets } from '@/app/teams/select-wallets'


interface Props {
  wallets: WalletSelection[]
}

export function AddTeamButton({ wallets }: Props) {
  const [name, setName] = useState('Untitled')
  const [memberAddress, setMemberAddress] = useState('')
  const [selectedWallets, setSelectedWallets] = useState<string[]>([])


  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            New Team
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Add New Team</SheetTitle>
          <SheetDescription>Add new team for your business.</SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              name="name"
              onChange={(e) => setName(e.target.value)}
              value={name}
              className="col-span-3"
            />
          </div>
          <Separator className={'my-2'} />
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Member Address
            </Label>
            <Input
              name="name"
              value={memberAddress}
              onChange={(e) => setMemberAddress(e.target.value)}
              className="col-span-3"
            />
          </div>
          <Separator className={'my-2'} />
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Allowed Wallets
            </Label>
            <SelectWallets className={'col-span-3'} wallets={wallets} selectedWallets={selectedWallets} setSelectedWallets={setSelectedWallets}/>
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              className={'mt-8'}
              onClick={async () => {
                await createTeam(name, [memberAddress], selectedWallets)
                toast.info('Team created successfully')
              }}>
              Add
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
