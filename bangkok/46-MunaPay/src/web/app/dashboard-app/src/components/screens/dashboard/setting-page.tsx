
//@ts-nocheck
"use client"

import { ArrowLeft, EyeOff, Loader, LucideEye } from 'lucide-react'
import React, {useState} from 'react'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import axios from 'axios'
import { useQuery, useMutation } from '@tanstack/react-query'
import { truncateText } from '@/lib/truncateTxt'
import { useUserContext } from '@/components/providers/user-context'
import { useToast } from '@/components/ui/use-toast'
import { BACKEND_URL } from '@/constants'
import ErrorsState from '@/components/states/errors-state'


const formSchema = z.object({
    payment_emails: z.boolean().default(false).optional(),
    security_emails: z.boolean(),
    businessName : z.string(),
    wallet : z.string()
  })
export default function SettingPage() {
const {userProfile}  =  useUserContext()
const [showPublicKey, setshowPublicKey] = useState(false)
 const [showPrivateKey, setshowPrivateKey] = useState(false)
const {toast} = useToast()
const  AUTH_ENDPOINT =  `${BACKEND_URL}/auth/`
//const  LIVE_AUTH_ENDPOINT = "https://sapo-rdii.onrender.com/api/auth/"
const  getUserInfo  =  async ()  =>  {
   const res =  axios.get(`${AUTH_ENDPOINT}user/${userProfile?.id}`)
   return (await res).data
}

const {data, isLoading, isError}  =  useQuery({
  queryKey : ['user'],
  queryFn : getUserInfo,
  enabled : !!userProfile
})

console.log("settings data", data)
   
     // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      payment_emails: true,
      security_emails : true,
      businessName : data?.user?.businessName,
      wallet : data?.user?.wallet
    },
  })
 

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
      toast({
        title : "profile updated",
        description : "profile updated succefully"
      })
    } catch (error) {
      console.log("something went wrong", error)
    }
    console.log(values)
  }

  if(isLoading){
    return(
      <div className='w-full min-h-screen flex items-center justify-center flex-col space-y-3'>
       <Loader   className='w-10 h-10 animate-spin' />
       <p>Loading</p>
      </div>
    )
  }

  if(isError){
    return(
    <ErrorsState  />
    )
  }
  return (
    <div  className='border border-border  max-w-xl p-4 mx-auto min-h-screen'>
    <div className='flex items-center space-x-1 text-muted-foreground my-2'>
        <ArrowLeft className='w-5 h-5'  />
        <p className='font-medium'>Settings</p>
      </div>

      <div className='my-4'>

      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem className='my-3'>
                             <p className='text-xs text-muted-foreground font-semibold'>Your busiess name is : {data?.user?.businessName  || "no business name"}</p>

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
                                           <p className='text-xs text-muted-foreground font-semibold'>Your wallet Address is: {data?.user?.wallet ? truncateText(data?.user?.wallet, 18,7,9)  : "no business wallet"}</p>

               <FormLabel>wallet address</FormLabel>
              <FormControl>
                <Input placeholder="aptos wallet" {...field} />
              </FormControl>
              <FormDescription>
              Used to receive payments from your customers. 
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />




         <div  className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
         <div className="space-y-0.5">
                    <FormLabel>Generate API Key</FormLabel>
                    <FormDescription>
                    Save the keys safely,  Your old keys will be replaced if you generate new ones.
                    </FormDescription>
                  </div>

                  <Button size={"sm"} variant={"outline"}>Generate Key</Button>

         </div>

<FormField
              control={form.control}
              name="payment_emails"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Payment emails</FormLabel>
                    <FormDescription>
                      Receive emails about your payments and  sales.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled
                      aria-readonly
                    />
                  </FormControl>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="security_emails"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                  <div className="space-y-0.5">
                    <FormLabel>Security emails</FormLabel>
                    <FormDescription>
                      Receive emails about your account security.
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled
                      aria-readonly
                    />
                  </FormControl>
                </FormItem>
              )}
            />

<div  className='flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm'>
         <div className="space-y-0.5">
                    <FormLabel>Your API Keys</FormLabel>
                    <div   className='w-full justify-between my-3'>
                   <div className='flex items-center space-x-3'>
                    <p className='font-semibold'>Public key</p>
                    <div>
                      <div className='border py-1 px-2'> <span>{data?.user?.publicKey &&  showPublicKey ? data?.user?.publicKey : data?.user?.publicKey && !showPublicKey ? "*************************************************" : showPublicKey && ! data?.user?.publicKey ? "No active api key yet generate one" : "" }</span></div>
                    </div>
                    <Button type='button' variant={"ghost"} size={"icon"} onClick={() => setshowPublicKey(! showPublicKey)}> <LucideEye /></Button>
                   </div>
                    </div>
                    <div   className='w-full justify-between my-3'>
                   <div className='flex items-center space-x-3'>
                    <p className='font-semibold'>Private key</p>
                    <div>
                      <div className='border py-1 px-2'> <span>{data?.user?.privateKey &&  showPrivateKey ? data?.user?.privateKey : data?.user?.privateKey && !showPrivateKey ? "*************************************************" : showPrivateKey && ! data?.user?.privateKey ? "No active api key yet generate one" : "" }</span></div>
                    </div>
                    <Button type='button' variant={"ghost"} size={"icon"} onClick={() => setshowPrivateKey(! showPrivateKey)}> <LucideEye /></Button>
                   </div>
                    </div>
                  </div>

                 

         </div>

        <Button type="submit"  className='mt-6  w-full ' disabled={mutation.isPending}>{mutation?.isPending ? "Updating settings" : "Update settings"}</Button>
      </form>
    </Form>

      </div>
    </div>
  )
}
