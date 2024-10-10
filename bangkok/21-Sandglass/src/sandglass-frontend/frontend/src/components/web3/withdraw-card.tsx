'use client'

import { FC, useState } from 'react'

import { Button } from '@/components/ui/button'
import { zodResolver } from '@hookform/resolvers/zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import * as z from 'zod'

import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Form, FormControl, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'

const formSchema = z.object({
  note: z.string().min(1).max(90),
  address: z.string().min(1).max(90)
})

export const WithdrawCard: FC = () => {
  const [fetchIsLoading, setFetchIsLoading] = useState<boolean>()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  })

  const { register, reset, handleSubmit } = form
  const withdraw: SubmitHandler<z.infer<typeof formSchema>> = async ({ note, address }) => {
    console.log(note, address)
  }
  return (
    <div className="my-8 flex max-w-[220rem] grow flex-col gap-4">
      <Form {...form}>
        <Card>
          <CardHeader>
            <h2 className="text-left text-primary font-sans font-bold text-2xl">Withdraw</h2>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit(withdraw)} className="flex flex-col justify-end gap-2">
              <FormItem>
                <FormLabel className="text-base">Note</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input disabled={form.formState.isSubmitting} {...register('note', {required: true})} />
                  </div>
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel className="text-base">recipient address</FormLabel>
                <FormControl>
                  <div className="flex gap-2">
                    <Input disabled={form.formState.isSubmitting} {...register('address', {required: true})} />
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
