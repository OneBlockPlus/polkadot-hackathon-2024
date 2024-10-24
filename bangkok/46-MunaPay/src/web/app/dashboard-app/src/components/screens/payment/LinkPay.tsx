
//@ts-nocheck

"use client"

import { usePathname , useParams,  useRouter} from 'next/navigation'
import React, {useState, useEffect} from 'react'
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from '@/components/ui/use-toast'
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  useQuery,
  useMutation,
} from '@tanstack/react-query'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader } from 'lucide-react'
import { BACKEND_URL, currencies, supportedNetworks } from '@/constants'

const formSchema = z.object({
  amount: z.coerce.number(),
  network : z.string(),
    coin : z.string()
 })

export default function LinkPay() {

  const params =  useParams()
  const  router =  useRouter()
  const [isLoading1, setisLoading] = useState(false)
  const [isRedirecting, setisRedirecting] = useState(false)
  const linkId = params.linkId
     const  PAY_BASE_URL = `${BACKEND_URL}/pay/`
     const  LOCAL_PAY_BASE_URL = `http://localhost:5000/pay/`


  const handleFetchLink  =   async ()  =>  {
    const res  =  await  axios.get(`${PAY_BASE_URL}link/${linkId}`)
     return res.data
  }

    const {data, isPending, isError, isSuccess, isLoading, error}  = useQuery({
     queryKey : ['linkData'],
     queryFn : handleFetchLink
    })

    

   console.log("path name ",data)

      const  generateCheckouSession =  async (CHECKOUT_DATA) => {
        try {
          const sessionId =   await axios.post(`${LOCAL_PAY_BASE_URL}create-session/${linkId}`, CHECKOUT_DATA)
          return  sessionId
          
        } catch (error) {
          console.log("somthing went wrong", error)
        }
       }

    const pushToChckOut =   async (CHECKOUT_DATA)  =>  {
      setisLoading(true)
        const  id =  await generateCheckouSession(CHECKOUT_DATA )
        setisLoading(false)
         if(id?.status  === 200){
          setisRedirecting(true)
     router.push(`/payment/checkout-session/${id.data.sessionId}`)
         }
    }

  

   useEffect(() => {

    if(data && data?.paymentLink?.paymentType === "fixed"){
       const  DEFAULT_TOKEN_DATA  =  {
        amount : data.paymentLink.amount,
        coin :  data?.paymentLink?.coin || "dev",
        network :  data?.paymentLink?.network || "Moonbase alpha"
       }
      pushToChckOut(DEFAULT_TOKEN_DATA)

      console.log("I'm stat let me go")
       
    }
    
  
  }, [data])


 

        // 1. Define your form.
   const form = useForm<z.infer<typeof formSchema>>({
     resolver: zodResolver(formSchema),
     defaultValues: {
      amount : 1,
      coin :  "dev",
      network :  "Moonbase alpha"
      
     },
   })
 


 
   // 2. Define a submit handler.
   const onSubmit  =  async (values: z.infer<typeof formSchema>)=>{
 
     try {
       //const  res  = await  axios.post(`${PAY_BASE_URL}session/${linkId}`,  values)
   console.log(values)
          await pushToChckOut(values)
         } catch (error) {
        console.log("error", error)
        toast({
         title : "Something went wrong",
         description  : "make sure you have connected to internet and filled all fiealds with valid information if not solve please contact us",
         variant : "destructive"
        })
       }
}
     if(error){
            return(
              <div className='w-full h-screen flex items-center justify-center'>

                <p className='font-semibold text-center'>Something went wrong please check your connection and reload</p>
                <p className='text-muted-foreground text-center'>Or reach out to our customer suport</p>
              </div>
            )
          }

          if(isLoading){
            return(
              <div className='w-full h-screen flex items-center justify-center'>

               <Loader

  className='w-24 h-24 text-indigo-500 animate-spin'
/>
              </div>
            )
          }

        
          
  return (
    <div className='w-full min-h-screen bg-zinc-100 flex items-center justify-center'>
   
    <div  className=' w-[95%] mx-auto md:w-[450px] border border-zinc-200 shadow-2xl shadow-zinc-400   bg-white rounded-xl md:rounded-3xl p-5'>
   
    
    
     <div  className='p-6 my-2'>
        <h1  className='font-semibold  text-xl text-center mt-3 mb-1 line-clamp-1 '>{data?.paymentLink?.linkName}</h1>
         <h2 className='text-muted-foreground  text-base  text-center line-clamp-2 '>{data?.paymentLink?.description}</h2>
     </div  >

      <div  className=' dark:bg-background  pt-5  p-3 rounded-t-3xl'>
      <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">

          <div>
          <FormField
          control={form.control}
          name="network"
          render={({ field }) => (

            <FormItem className='my-4'>
                <FormLabel>Network</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={"moonbeam"}  >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Network" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {supportedNetworks.map((item, i) =>  (
                   <SelectItem key={i} value={item.value}>{item.name}</SelectItem>
                  ))}
                  
                </SelectContent>
              </Select>
                 
            </FormItem>

            
                       )}/>

<FormField
          control={form.control}
          name="coin"
          render={({ field }) => (

            <FormItem className='my-4'>
                <FormLabel>Coin</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={"GLMR"}  >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Coin" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currencies.map((item,i) => (
                    <SelectItem key={i} value={item.value}>{item.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
                 
            </FormItem>

            
                       )}/>
          </div>
        <FormField
          control={form.control}
          name="amount"
            rules={{
              required : false
            }}
          render={({ field }) => (
            
                 <FormItem  className='my-4'>
              <FormLabel>Amount</FormLabel>
              <FormControl>
                <Input placeholder="100" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>      )}/> 
            <Button type="submit" className='w-full' disabled={isRedirecting || isLoading1} >{isRedirecting || isLoading1  ? "loading.." : "Continue to pay"}</Button>

</form>
</Form>
          

      </div>

   
    </div>
    </div>
 
  )
}
