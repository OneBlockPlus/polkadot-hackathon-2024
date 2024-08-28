'use client'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { loginEthereum } from '@/app/login/actions'


export function ConnectMetaMask() {
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={() => connectMetaMask()}>
      <div className="flex gap-4">
        <Image
          src={
            'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg'
          }
          alt={'MetaMask Icon'}
          width={24}
          height={24}
        />
        <div className="w-36 text-left">Login with MetaMask</div>
      </div>
    </Button>
  )
}

async function connectMetaMask() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      })
      console.log(accounts)
      await loginEthereum(accounts[0])
    } catch (error) {
      console.error(error)
    }
  } else {
    console.error('MetaMask not found')
  }
}
