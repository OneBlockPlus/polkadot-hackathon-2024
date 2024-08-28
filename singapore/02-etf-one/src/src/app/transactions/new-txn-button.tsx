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

import { Dispatch, SetStateAction, useState } from 'react'
import { toast } from 'sonner'
import { Wallet } from '@/generated/public/Wallet'
import { SelectWallet } from '@/app/transactions/select-wallet'
import { createTxn } from '@/app/transactions/actions'


interface Props {
  wallets: Wallet[]
  setWallet: Dispatch<SetStateAction<Wallet | undefined>>
}

export function NewTxnButton({ wallets, setWallet }: Props) {
  const [from,setFrom ] = useState<Wallet>()
  const [amount, setAmount] = useState(0)
  const [to, setTo] = useState('')

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size="sm" className="mx-2 h-8 gap-1">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Txn
          </span>
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Create New Transaction</SheetTitle>
          <SheetDescription></SheetDescription>
        </SheetHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              From
            </Label>
            <SelectWallet wallets={wallets} setFrom={setFrom} />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              Amount
            </Label>
            <Input
              name="amount"
              type="number"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="username" className="text-right">
              To
            </Label>
            <Input
              name="address"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="col-span-3"
            />
          </div>
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button
              onClick={async () => {
                await createTxn(from!, amount, to)
                toast.info('Wallet added successfully')
              }}
              disabled={to === ''}>
              Create
            </Button>
          </SheetClose>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
