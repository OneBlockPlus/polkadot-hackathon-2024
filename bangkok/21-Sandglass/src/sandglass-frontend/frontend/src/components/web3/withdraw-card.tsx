'use client'

import { FC, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { compactAddLength, hexToU8a, stringToU8a } from '@polkadot/util'
import { useInkathon } from '@scio-labs/use-inkathon'
import { MerkleTree } from 'fixed-merkle-tree'
import { poseidon2 } from 'poseidon-bls12381'
import { SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import { groth16 } from 'snarkjs'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  note: z.any().refine((fileList: any[]) => fileList.length > 0, {
    message: 'place upload the note',
  }),
  address: z.string().min(1, { message: 'Address is required' }),
})

export const WithdrawCard: FC = () => {
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const { api, activeAccount, activeSigner } = useInkathon()

  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = form
  const withdraw: SubmitHandler<z.infer<typeof formSchema>> = async ({
    note: NoteFile,
    address,
  }) => {
    console.log(NoteFile, address)
    if (!activeAccount || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }
    const note = NoteFile[0].name
    console.log(note)
    const sk2 = BigInt(note)
    const cmt2 = poseidon2([sk2, BigInt(0)])
    const hashFun = (left: any, right: any) => poseidon2([BigInt(left), BigInt(right)]).toString()

    const tree = new MerkleTree(8, undefined, {
      zeroElement: '0',
      hashFunction: hashFun,
    })

    const merkleCommitmentsVec = (await api.query.mixer.merkleVec()).toJSON()
    const o = JSON.parse(JSON.stringify(merkleCommitmentsVec))

    for (const k in o) {
      console.log(k, o[k])
      const cm = BigInt(o[k])
      tree.bulkInsert([cm.toString()])
    }

    // product root
    const root = toFixedHex(tree.root)
    console.log('@@@ local root3', root, tree.root.toString())

    console.log('@@@ tree is ', tree)

    // product proof
    const commitment = cmt2.toString()
    const leafIndex = tree.indexOf(commitment)
    console.log('leafIndex', leafIndex)

    const nullifier = poseidon2([BigInt(leafIndex), sk2])

    const { pathElements, pathIndices } = tree.path(leafIndex)

    const input = {
      root: tree.root.toString(),
      nullifierHash: nullifier.toString(),
      secret: sk2.toString(),
      paths2_root: pathElements,
      paths2_root_pos: pathIndices,
    }

    console.log('@@@input is, ', JSON.stringify(input))

    const { proof, publicSignals } = await groth16.fullProve(
      input,
      './mixer.wasm',
      './mixer_0001.zkey',
    )

    const a2nullifier = hexToU8a('0x' + nullifier.toString(16))
    const compact_a2nullifier = compactAddLength(a2nullifier)

    const a2root = hexToU8a(root)
    const compact_a2root = compactAddLength(a2root)

    console.log('@@@ proof is', JSON.stringify(proof))
    const a2proof = stringToU8a(JSON.stringify(proof))
    const compact_a2proof = compactAddLength(a2proof)
    const txHash2 = await api.tx.mixer
      .withdraw(compact_a2proof, compact_a2root, compact_a2nullifier, address)
      .signAndSend(activeAccount.address)
    await delay(5000)
    console.log(`withdraw with hash ${txHash2}`)
    toast.success('withdraw successfully!')
  }
  function delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
  function toFixedHex(value: any, length = 32) {
    const isBuffer = value instanceof Buffer

    const str = isBuffer ? value.toString('hex') : BigInt(value).toString(16)
    return '0x' + str.padStart(length * 2, '0')
  }
  return (
    <div className="my-8 flex max-w-[220rem] grow flex-col gap-4">
      <Form {...form}>
        <Card>
          <CardHeader>
            <h2 className="text-left font-sans text-2xl font-bold text-primary">Withdraw</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(withdraw)} className="flex flex-col justify-end gap-2">
              <FormItem>
                <FormLabel className="text-base">Note</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <label
                      htmlFor="dropzone-file"
                      className="flex h-24 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-input bg-background hover:bg-input"
                    >
                      {(!form.getValues('note') || form.getValues('note').length === 0) && (
                        <div className="flex flex-col items-center justify-center">
                          <svg
                            className="mb-4 h-8 w-8 text-gray-500 dark:text-gray-400"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 20 16"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
                            />
                          </svg>
                          <p className="text-sm text-gray-50">
                            <span className="font-semibold">Click to upload</span> the note
                          </p>
                        </div>
                      )}
                      {form.getValues('note') && <div>{form.getValues('note')?.[0]?.name}</div>}
                    </label>
                    <Input
                      id="dropzone-file"
                      className="hidden"
                      type="file"
                      disabled={form.formState.isSubmitting}
                      {...register('note', { required: true })}
                    />
                  </div>
                </FormControl>
                <FormMessage>{errors.note?.message as string}</FormMessage>
              </FormItem>

              <FormItem>
                <FormLabel className="text-base">recipient address</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input
                      disabled={form.formState.isSubmitting}
                      {...register('address', { required: true })}
                    />
                  </div>
                </FormControl>
                <FormMessage>{errors.address?.message}</FormMessage>
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
                      withdraw
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
