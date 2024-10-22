'use client'

import { FC, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { compactAddLength, hexToU8a, stringToU8a } from '@polkadot/util'
import { useInkathon } from '@scio-labs/use-inkathon'
import random from 'crypto-random-bigint'
import { poseidon2 } from 'poseidon-bls12381'
import { SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { groth16 } from 'snarkjs'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { useMixerVerificationKey } from '@/hooks/useMixerVerificationKey'
import { generateInput } from '@/utils/2fa'
import vkey from './verification_key.json'

const formSchema = z.object({
  amount: z.string().min(1).max(90),
  faCode: z.string().optional(),
})

export const DepositCard: FC = () => {
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const mixerVerificationKey = useMixerVerificationKey(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = form
  const { api, activeAccount, activeSigner } = useInkathon()

  // Update Greeting
  const deposit: SubmitHandler<z.infer<typeof formSchema>> = async ({ amount, faCode }) => {
    console.log(amount, faCode)
    if (!activeAccount || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    if ('' === mixerVerificationKey) {
      const a2vkey = stringToU8a(JSON.stringify(vkey))
      const compact_a2vkey = compactAddLength(a2vkey)

      const t = await api.tx.mixer
        .setupVerification(compact_a2vkey)
        .signAndSend(activeAccount.address)
      await delay(10000)

      console.log(`Submitted with hash ${t}`)
    }

    const sk2 = BigInt(random(64)) //random number
    const cmt2 = poseidon2([sk2, BigInt(0)])
    const a = hexToU8a('0x' + cmt2.toString(16))
    const compact_a = compactAddLength(a)

    if (faCode) {
      const input = await generateInput(faCode).catch((error: any) => {
        toast.error('Invalid OTP code')
        throw error
      })

      const { proof, publicSignals } = await groth16.fullProve(input, 'otp.wasm', 'otp_0001.zkey')
      const a2proof = stringToU8a(JSON.stringify(proof))
      const compact_a2proof = compactAddLength(a2proof)
      const a2root = stringToU8a(publicSignals[0])
      const compact_a2root = compactAddLength(a2root)

      const txHash = await api.tx.mixer
          .depositWithNaiveOtp(compact_a, compact_a2proof, compact_a2root, input?.time)
          .signAndSend(activeAccount.address, { signer: activeSigner }, ({ status }) => {
            if (status.isInBlock) {
              console.log(`Completed at block hash #${status.asInBlock.toString()}`)
            } else {
              console.log(`Current status: ${status.type}`)
            }
          })
    } else {
      const txHash = await api.tx.mixer
          .deposit(compact_a)
          .signAndSend(activeAccount.address, { signer: activeSigner }, ({ status }) => {
            if (status.isInBlock) {
              console.log(`Completed at block hash #${status.asInBlock.toString()}`)
            } else {
              console.log(`Current status: ${status.type}`)
            }
          })
    }

    await delay(10000)
    downloadProof(sk2)
    toast.success('deposit successfully!')
  }

  const downloadProof = (proof: any) => {
    const blob = new Blob([proof], { type: 'application/text' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url

    a.download = proof // 文件名

    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url) // 释放内存
  }

  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  return (
    <div className="my-8 flex max-w-[220rem] grow flex-col gap-4">
      <Form {...form}>
        <Card>
          <CardHeader>
            <h2 className="text-left font-sans text-2xl font-bold text-primary">Deposit</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(deposit)} className="flex flex-col justify-end gap-2">
              <FormItem>
                <FormLabel className="text-base">Amount</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      disabled={form.formState.isSubmitting}
                      readOnly
                      value={1000}
                      {...register('amount', { required: true })}
                    />
                  </div>
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel className="text-base">2fa code</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      disabled={form.formState.isSubmitting}
                      {...register('faCode', { required: false })}
                    />
                  </div>
                </FormControl>
              </FormItem>
              <FormItem>
                <FormControl>
                  <div className="flex justify-center p-4">
                    <Button
                      type="submit"
                      className="bg-primary py-6 text-xl"
                      disabled={fetchIsLoading || form.formState.isSubmitting}
                      isLoading={form.formState.isSubmitting}
                    >
                      Deposit
                    </Button>
                  </div>
                </FormControl>
              </FormItem>
            </form>
          </CardContent>
        </Card>
      </Form>
    </div>
  )
}
