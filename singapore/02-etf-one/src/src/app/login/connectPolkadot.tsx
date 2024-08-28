'use client'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import * as React from 'react'
import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import Identicon from '@polkadot/react-identicon'

import { cn } from '@/lib/utils'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { getNonce, loginPolkadot } from '@/app/login/actions'
import { toast } from 'sonner'
import { sign } from '@/app/login/polka-sign-message'
import { InjectedAccountWithMeta } from '@polkadot/extension-inject/types'

 
export default function ConnectPolkadot() {
  const [isOpen, setOpen] = useState(false)
  const [addresses, setAddresses] = useState<PolkadotAddress[]>([])

  return (
    <>
      <Button
        variant="outline"
        className="flex w-full gap-4"
        onClick={() => {
          connectPolkadot(isOpen, setOpen, setAddresses)
        }}>
        <Image
          src={'/img/PolkaLogo.svg'}
          alt={'Polkadot Icon'}
          width={20}
          height={20}
          className="h-5.5 w-5.5"
        />
        <div className="w-36 text-left">Login with Polkadot</div>
      </Button>
      <ChooseMainDialog
        isOpen={isOpen}
        setOpen={setOpen}
        addresses={addresses}
      />
    </>
  )
}

async function nextAuthSignIn(account: InjectedAccountWithMeta) {
  const nonce = await getNonce(account.address)
  const signedNonce = await sign(account, nonce!)
  await loginPolkadot({
    publicAddress: account.address,
    nonce: nonce!,
    signature: signedNonce!.signature,
  })
}

async function connectPolkadot(
  isOpen: boolean,
  setOpen: (value: ((prevState: boolean) => boolean) | boolean) => void,
  setAddresses: (value: PolkadotAddress[]) => void,
) {
  const { web3Enable, web3Accounts } = await import('@polkadot/extension-dapp')
  const _ = await web3Enable('my cool dapp')

  // returns an array of { address, meta: { name, source } }
  // meta.source contains the name of the extension that provides this account
  const allAccounts = await web3Accounts()
  if (!allAccounts || allAccounts.length === 0) {
    toast.info('No wallet found. Please check your Polkadot extension.')
    return
  }
  if (allAccounts.length === 1) {
    await nextAuthSignIn(allAccounts[0])
    return
  }

  if (allAccounts.length > 1) {
    setAddresses(
      allAccounts.map((account) => {
        return {
          address: account.address,
          name: account.meta.name || 'unknown',
          account,
        }
      }),
    )
    setOpen(!isOpen)
  }
}

function ChooseMainDialog({
  isOpen,
  setOpen,
  addresses,
}: {
  isOpen: boolean
  setOpen: (isOpen: boolean) => void
  addresses: PolkadotAddress[]
}) {
  const [main, setMain] = useState<PolkadotAddress>()
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
        setMain((_) => undefined)
      }}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Select main account</DialogTitle>
          <DialogDescription>
            Multiple addresses found, select on as your main account.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Main:
            </Label>

            <SelectMainAddress addresses={addresses} setMain={setMain} />
          </div>
        </div>
        <DialogFooter>
          <Button
            onClick={async () => {
              await nextAuthSignIn(main!.account)
            }}
            disabled={main === undefined}>
            Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface PolkadotAddress {
  address: string
  name: string
  account: InjectedAccountWithMeta
}

export function SelectMainAddress({
  addresses,
  setMain,
}: {
  addresses: PolkadotAddress[]
  setMain: React.Dispatch<React.SetStateAction<PolkadotAddress | undefined>>
}) {
  const [open, setOpen] = React.useState(false)
  const [value, setValue] = React.useState<PolkadotAddress>()

  return (
    <Popover
      open={open}
      onOpenChange={(isOpen) => {
        setOpen(isOpen)
      }}>
      <PopoverTrigger asChild className={'col-span-3 w-full'}>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between">
          <SelectorItem
            {...addresses.find((address) => address.name === value?.name)}
          />
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Command>
          <CommandInput placeholder="Search address..." />
          <CommandEmpty>No address found.</CommandEmpty>
          <CommandGroup>
            <CommandList>
              {addresses.map((a: PolkadotAddress) => (
                <CommandItem
                  key={a.name}
                  value={a.name}
                  onSelect={(currentValue) => {
                    const address = addresses.find(
                      (address) => address.name === currentValue,
                    )
                    setValue(address)
                    setMain(address)
                    setOpen(false)
                  }}>
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      value?.name === a.name ? 'opacity-100' : 'opacity-0',
                    )}
                  />
                  <div className={'flex items-center gap-3'}>
                    <div>
                      <Identicon
                        value={a.address}
                        size={32}
                        theme={'polkadot'}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label className={'text-lg'}>{a.name}</Label>
                      <div className={'text-sm text-muted-foreground'}>
                        {a.address}
                      </div>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandList>
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

function SelectorItem({ name, address }: { name?: string; address?: string }) {
  if (!name) {
    return 'Select address...'
  }
  return (
    <div className="flex items-center gap-3">
      <Identicon value={address} size={18} theme={'polkadot'} />
      {name}
    </div>
  )
}
