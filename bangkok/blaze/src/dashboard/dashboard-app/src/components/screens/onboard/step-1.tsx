
//@ts-nocheck
import React from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, EyeOff, Loader, LucideEye } from 'lucide-react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import axios from 'axios'
import {  useMutation } from '@tanstack/react-query'
import { useUserContext } from '@/components/providers/user-context'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { BACKEND_URL } from '@/constants'

const formSchema = z.object({
    businessName : z.string(),
    wallet : z.string()
  })

  type Props = {
    setProgress : unknown
    progress : unknown
  }
export default function Step1({setProgress, progress}: Props) {
    const {userProfile}  =  useUserContext()
     const router = useRouter()
const {toast} = useToast()
const  AUTH_ENDPOINT =  `${BACKEND_URL}/auth/`
         // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName : undefined,
      wallet : undefined
    },
  })
 

    console.log("user profile",  userProfile)

    const handleUpdateProfile =  async (values)  =>  {
      const res =  await axios.put(`${AUTH_ENDPOINT}user/${userProfile?.id}/update-profile`, values)
      return res
    }

   const mutation = useMutation({
      mutationFn : handleUpdateProfile,
      mutationKey : ['user']
    })
  // 2. Define a submit handler.
  const onSubmit =  async (values: z.infer<typeof formSchema>) =>{
    try {
     const data = await mutation.mutateAsync(values)
    console.log("response", data.status)
    setProgress(progress + 50)
    router.push("/dashboard")
    
    } catch (error) {
      console.log("something went wrong", error)
      toast({
        title : "Something went wrong",
        description : "check your connection and  try again",
        variant : "destructive"
      })
    }
    console.log(values)
  }
  return (
    <div className='w-full'>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
     
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem className='my-3'>
               <FormLabel>Business name</FormLabel>
              <FormControl>
                <Input placeholder="business name..." {...field} />
              </FormControl>
              <FormDescription>
              Your business name displayed to customers on the checkout page.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
         <FormField
          control={form.control}
          name="wallet"
          render={({ field }) => (
            <FormItem className='my-3'>
               <FormLabel>Wallet address</FormLabel>
              <FormControl>
                <Input placeholder="evm wallet" {...field} />
              </FormControl>
              <FormDescription>
              Used to receive payments from your customers. 
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

 
<div className='w-full flex items-end justify-end'>
        <Button type="submit"  className='mt-7   ml-auto  ' disabled={mutation.isPending}>{mutation?.isPending ? "Loading..." : "Continue"}</Button>
        </div>
      </form>
    </Form>
    </div>
  )
}
