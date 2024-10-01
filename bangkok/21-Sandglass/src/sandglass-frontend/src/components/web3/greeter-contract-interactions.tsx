'use client'

import { FC, useEffect, useState } from 'react'

import { ContractIds } from '@/deployments/deployments'
import { zodResolver } from '@hookform/resolvers/zod'
import * as Tabs from '@radix-ui/react-tabs'
import
  {
    contractQuery,
    decodeOutput,
    useInkathon,
    useRegisteredContract,
  } from '@scio-labs/use-inkathon'
import { SubmitHandler, useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Form, FormControl, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { contractTxWithToast } from '@/utils/contract-tx-with-toast'

const formSchema = z.object({
  newMessage: z.string().min(1).max(90),
})

export const GreeterContractInteractions: FC = () => {
  const { api, activeAccount, activeSigner } = useInkathon()
  const { contract, address: contractAddress } = useRegisteredContract(ContractIds.Greeter)
  // const { typedContract } = useRegisteredTypedContract(ContractIds.Greeter, GreeterContract)
  const [greeterMessage, setGreeterMessage] = useState<string>()
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const { register, reset, handleSubmit } = form

  // Fetch Greeting
  const fetchGreeting = async () => {
    if (!contract || !api) return

    setFetchIsLoading(true)
    try {
      const result = await contractQuery(api, '', contract, 'greet')
      const { output, isError, decodedOutput } = decodeOutput(result, contract, 'greet')
      if (isError) throw new Error(decodedOutput)
      setGreeterMessage(output)

      // NOTE: Currently disabled until `typechain-polkadot` dependencies are upted to support ink! v5
      // Alternatively: Fetch it with typed contract instance
      // const typedResult = await typedContract.query.greet()
      // console.log('Result from typed contract: ', typedResult.value)
    } catch (e) {
      console.error(e)
      toast.error('Error while fetching greeting. Try again…')
      setGreeterMessage(undefined)
    } finally {
      setFetchIsLoading(false)
    }
  }
  useEffect(() => {
    fetchGreeting()
  }, [contract])

  // Update Greeting
  const updateGreeting: SubmitHandler<z.infer<typeof formSchema>> = async ({ newMessage }) => {
    if (!activeAccount || !contract || !activeSigner || !api) {
      toast.error('Wallet not connected. Try again…')
      return
    }

    try {
      await contractTxWithToast(api, activeAccount.address, contract, 'setMessage', {}, [
        newMessage,
      ])
      reset()
    } catch (e) {
      console.error(e)
    } finally {
      fetchGreeting()
    }
  }

  if (!api) return null

  return (
    <>
      <Tabs.Root defaultValue="tab1" orientation="vertical">
        <Tabs.List className="px-4" aria-label="tabs example">
          <Tabs.Trigger className="p-4 mr-8" value="tab1">Deposit</Tabs.Trigger>
          <Tabs.Trigger value="tab2">Withdraw</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="tab1">
          <div className="flex max-w-[22rem] grow flex-col gap-4">
            <h2 className="text-center font-mono text-gray-400">Deposit</h2>

            <Form {...form}>
              <Card>
                <CardContent className="pt-6">
                  <form
                    onSubmit={handleSubmit(updateGreeting)}
                    className="flex flex-col justify-end gap-2"
                  >
                    <FormItem>
                      <FormLabel className="text-base">Amount</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            disabled={form.formState.isSubmitting}
                            {...register('newMessage')}
                          />
                          <Button
                            type="submit"
                            className="bg-primary font-bold"
                            disabled={fetchIsLoading || form.formState.isSubmitting}
                            isLoading={form.formState.isSubmitting}
                          >
                            Submit
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  </form>
                </CardContent>
              </Card>
            </Form>
          </div>
        </Tabs.Content>
        <Tabs.Content value="tab2">
          <div className="flex max-w-[22rem] grow flex-col gap-4">
            <h2 className="text-center font-mono text-gray-400">Withdraw</h2>

            <Form {...form}>
              <Card>
                <CardContent className="pt-6">
                  <form
                    onSubmit={handleSubmit(updateGreeting)}
                    className="flex flex-col justify-end gap-2"
                  >
                    <FormItem>
                      <FormLabel className="text-base">Amount</FormLabel>
                      <FormControl>
                        <div className="flex gap-2">
                          <Input
                            disabled={form.formState.isSubmitting}
                            {...register('newMessage')}
                          />
                          <Button
                            type="submit"
                            className="bg-primary font-bold"
                            disabled={fetchIsLoading || form.formState.isSubmitting}
                            isLoading={form.formState.isSubmitting}
                          >
                            Submit
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  </form>
                </CardContent>
              </Card>
            </Form>
          </div>
        </Tabs.Content>
      </Tabs.Root>
    </>
  )
}
