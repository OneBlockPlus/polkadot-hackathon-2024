'use client'

import { FC, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import * as Tabs from '@radix-ui/react-tabs'
import { useInkathon } from '@scio-labs/use-inkathon'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { FaCard } from './2fa-card'
import { DepositCard } from './deposit-card'
import { MixerSwap } from './mixerswap-card'
import { WithdrawCard } from './withdraw-card'

const formSchema = z.object({
  newMessage: z.string().min(1).max(90),
})

export const MixerBody: FC = () => {
  const { api, activeAccount, activeSigner } = useInkathon()
  const [greeterMessage, setGreeterMessage] = useState<string>()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const { register, reset, handleSubmit } = form

  if (!api) return null

  return (
    <>
      <Tabs.Root defaultValue="deposit" orientation="vertical">
        <Tabs.List className="px-4" aria-label="tabs example">
          <Tabs.Trigger
            className="mr-8 border-2 border-solid border-transparent p-4 data-[state=active]:border-b-primary"
            value="deposit"
          >
            Deposit
          </Tabs.Trigger>
          <Tabs.Trigger
            className="mr-8 border-2 border-solid border-transparent p-4 data-[state=active]:border-b-primary"
            value="withdraw"
          >
            Withdraw
          </Tabs.Trigger>
          <Tabs.Trigger
            className="mr-8 border-2 border-solid border-transparent p-4 data-[state=active]:border-b-primary"
            value="mixer-swap"
          >
            Mixer Swap
          </Tabs.Trigger>
          <Tabs.Trigger
            className="mr-8 border-2 border-solid border-transparent p-4 data-[state=active]:border-b-primary"
            value="2fa"
          >
            Two Factor Authentication
          </Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="deposit">
          <DepositCard />
        </Tabs.Content>
        <Tabs.Content value="withdraw">
          <WithdrawCard />
        </Tabs.Content>
        <Tabs.Content value="mixer-swap">
          <MixerSwap />
        </Tabs.Content>
        <Tabs.Content value="2fa">
          <FaCard />
        </Tabs.Content>
      </Tabs.Root>
    </>
  )
}
