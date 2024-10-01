'use client'

import { useEffect } from 'react'

import { useInkathon } from '@scio-labs/use-inkathon'
import { toast } from 'react-hot-toast'

import { ConnectButton } from '@/components/web3/connect-button'
import { GreeterContractInteractions } from '@/components/web3/greeter-contract-interactions'

export default function HomePage() {
  // Display `useInkathon` error messages (optional)
  const { error } = useInkathon()
  useEffect(() => {
    if (!error) return
    toast.error(error.message)
  }, [error])

  return (
    <>
      <div className="container relative flex grow flex-col py-10">
        {/* Title */}
        <div className='flex justify-between items-center'>
          <h2 className=''>sandglass</h2>
          {/* Connect Wallet Button */}
          <ConnectButton />
        </div>
        <div className="mt-12 flex w-full flex-wrap items-start justify-center gap-4">
          <GreeterContractInteractions />
        </div>
      </div>
    </>
  )
}
