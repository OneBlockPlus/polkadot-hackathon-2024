'use client'

import { FC, useState } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  amount: z.string().min(1).max(90),
  faCode: z.string().min(1).max(90),
})

export const DepositCard: FC = () => {
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const { register, reset, handleSubmit, formState: { errors } } = form
// Update Greeting
const deposit: SubmitHandler<z.infer<typeof formSchema>> = async ({ amount, faCode }) => {
  console.log(amount, faCode)
}

  return (
    <div className="my-8 flex max-w-[220rem] grow flex-col gap-4">
      <Form {...form}>
        <Card>
          <CardHeader>
            <h2 className="text-left text-primary font-sans font-bold text-2xl">Deposit</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(deposit)} className="flex flex-col justify-end gap-2">
              <FormItem>
                <FormLabel className="text-base">Amount</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input type="number" disabled={form.formState.isSubmitting}  {...register('amount', { required: true })} />
                  </div>
                </FormControl>
              </FormItem>
              <FormItem>
                <FormLabel className="text-base">2fa code(Optional)</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input disabled={form.formState.isSubmitting} {...register('faCode')} />
                  </div>
                </FormControl>
              </FormItem>
              <FormItem>
                <FormControl>
                  <div className="flex justify-center p-4">
                  <Button
                      type="submit"
                      className="bg-primary font-bold"
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
