'use client'

import Image from 'next/image'
import { FC, useEffect, useState } from 'react'

import { compactAddLength, stringToU8a } from '@polkadot/util'
import { useInkathon } from '@scio-labs/use-inkathon'
import toast from 'react-hot-toast'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { useOtpVerificationKey } from '@/hooks/useOtpVerificationKey'
import { generateMerkleTree } from '@/utils/2fa'

import otpvkey from './otp_verification_key.json'

export const FaCard: FC = () => {
  const { api, activeAccount, activeSigner } = useInkathon()
  const otpVerificationKey = useOtpVerificationKey(false)

  const [secret, setSecret] = useState('')
  const [uri, setURI] = useState('')
  const [root, setRoot] = useState('')

  const [error, setError] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [Deploying, setDeploying] = useState(false)
  const [deployed, setDeployed] = useState(true)

  const deploy = async (event: any) => {
    if (!activeAccount || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    event.preventDefault()

    if ('' === otpVerificationKey) {
      const a2vkey = stringToU8a(JSON.stringify(otpvkey))
      const compact_a2vkey = compactAddLength(a2vkey)

      const t = await api.tx.otp
        .setupVerification(compact_a2vkey)
        .signAndSend(activeAccount.address, { signer: activeSigner }, ({ status }) => {
          if (status.isInBlock) {
            console.log(`Completed at block hash #${status.asInBlock.toString()}`)
          } else {
            console.log(`Current status: ${status.type}`)
          }
        })

      await delay(10000)

      console.log(`Submitted with hash ${t}`)
    }

    setError(false)
    setDeployed(false)

    setDeploying(true)

    const [_uri, _secret, root] = await generateMerkleTree()

    setSecret(_secret)
    setURI(_uri)

    const root_u8a = stringToU8a(root.toString())
    const compact_root = compactAddLength(root_u8a)

    //console.log('@@@ root is', root, JSON.stringify(compact_root))
    await api?.tx.otp
      .setOtpCommitment(compact_root)
      .signAndSend(activeAccount.address, { signer: activeSigner }, ({ status }) => {
        if (status.isInBlock) {
          console.log(`Completed at block hash #${status.asInBlock.toString()}`)
        } else {
          console.log(`@@@Current status: ${status.type}`)
          if (status.isFinalized) {
            toast.success('setup 2fa key successfully!')
          }
        }
      })
      .catch((error: any) => {
        setErrorMsg(error.toString())
        setError(true)
        setDeploying(false)
        console.log(':( transaction failed', error)
      })

    localStorage.setItem('_secret', _secret)
    localStorage.setItem('_uri', _uri)
    localStorage.setItem('root', root)

    setDeploying(false)
    setDeployed(true)
    event.preventDefault()
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  useEffect(() => {
    // declare the data fetching function
    const fetchData = async () => {
      const [_uri, _secret, root] = await generateMerkleTree()

      setSecret(_secret)
      setURI(_uri)
      setRoot(root)

      localStorage.setItem('_secret', _secret)
      localStorage.setItem('_uri', _uri)
      localStorage.setItem('root', root)
    }

    const _secret = localStorage.getItem('_secret')
    const _uri = localStorage.getItem('_uri')

    console.log('@@@_secret', _secret, _uri)
    if (!_secret && !_uri) {
      // call the function
      console.log('@@@call fetch data')

      fetchData()
        // make sure to catch any error
        .catch(console.error)
    } else {
      setSecret(_secret as any)
      setURI(_uri as any)
    }
  }, [])

  return (
    <div className="my-8 flex max-w-[220rem] grow flex-col gap-4">
      <Card>
        <CardHeader>
          <h2 className="text-left font-sans text-2xl font-bold text-primary">2FA</h2>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="flex justify-center">
              <Button onClick={deploy}>update account 2fa key</Button>
            </div>
          </div>
          <div className="py-4 text-xl text-primary">
            Scan the QR code using Google Authenticator or manually <br /> input the setup key
          </div>
          <div className="py-4 text-base">Setup key: {secret}</div>
          <div className="flex justify-center">
            <Image src={uri} width={240} height={240} alt="QR Code" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
