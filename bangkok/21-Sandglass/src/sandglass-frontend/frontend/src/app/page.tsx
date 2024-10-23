'use client'

import Image from 'next/image'
import { useEffect } from 'react'

import { useInkathon } from '@scio-labs/use-inkathon'
import { toast } from 'react-hot-toast'

import { ConnectButton } from '@/components/web3/connect-button'
import { MixerBody } from '@/components/web3/mixer-body'

export default function HomePage() {
  const { error } = useInkathon()
  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  return (
    <>
      <div className="container relative flex grow flex-col py-10">
        {/* Title */}
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Image
              className="mr-4 rounded"
              width={48}
              height={48}
              src="/images/logo.png"
              alt="Logo"
            />
            <h2 className="text-4xl font-extralight">sandglass</h2>
          </div>
          {/* Connect Wallet Button */}
          <ConnectButton />
        </div>
        <div className="mt-12 flex w-full flex-wrap items-start justify-center gap-4">
          <MixerBody />
        </div>
      </div>
    </>
  )
}
