
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
  useQueryClient,
  QueryClient,
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

const formSchema = z.object({
  amount: z.coerce.number(),
  network : z.string(),
    coin : z.string()
 })

export default function LinkPay() {

  const params =  useParams()
  const  router =  useRouter()
  const [isRedirecting, setisRedirecting] = useState(false)

     const  PAY_BASE_URL = `https://got-be.onrender.com/pay/`
     const  LOCAL_PAY_BASE_URL = `http://localhost:5000/pay/`


  const handleFetchLink  =   async ()  =>  {
    const res  =  await  axios.get(`${LOCAL_PAY_BASE_URL}link/${linkId}`)
     return res.data
  }

    const {data, isPending, isError, isSuccess, isLoading, error}  = useQuery({
     queryKey : ['linkData'],
     queryFn : handleFetchLink
    })

    const linkId = params.linkId

   console.log("path name ",data)

      const  generateCheckouSession =  async (CHECKOUT_DATA)  =>   {
         const sessionId =   await axios.post(`${LOCAL_PAY_BASE_URL}create-session/${linkId}`, CHECKOUT_DATA)
           return  sessionId
      }

    const pushToChckOut =   async (CHECKOUT_DATA)  =>  {
        const  id =  await generateCheckouSession(CHECKOUT_DATA )
         if(id.status  === 200){
          setisRedirecting(true)
     router.push(`/payment/checkout-session/${id.data.sessionId}`)
         }
    }


  

   useEffect(() => {

    if(data && data.paymentType === "fixed"){
       const  DEFAULT_TOKEN_DATA  =  {
          amount :  data?.amount,
           coin  :  "HBAR",
           network :  "Hedera"
       }
      pushToChckOut(DEFAULT_TOKEN_DATA)
       
    }
    
  
  }, [data])


 

        // 1. Define your form.
   const form = useForm<z.infer<typeof formSchema>>({
     resolver: zodResolver(formSchema),
     defaultValues: {
      amount : 1,
      coin :  "HBAR",
      network : "Hedera"
      
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
         title : "something went wrong",
         description  : "something went wrong check consol"
        })
       
     }
       
 
         
     console.log("the value", values)
    
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
    <div className='w-full min-h-screen bg-yellow-500 flex items-center justify-center'>
   
    <div  className='w-[450px]   bg-background rounded-3xl p-5'>
   
    
    
     <div  className='p-6 my-2'>
        <h1  className='font-semibold  text-xl text-center mt-3 mb-1'>{data?.paymentLink?.linkName}</h1>
         <h2 className='text-muted-foreground  text-lg  text-center'>{data?.paymentLink?.description}</h2>
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
                 <Select onValueChange={field.onChange} defaultValue={field.value}  >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Hedera" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="Hedera">Hedera</SelectItem>
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
                 <Select onValueChange={field.onChange} defaultValue={field.value}  >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="HBAR" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="HBAR">HBAR</SelectItem>
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
            <Button type="submit" className='w-full' disabled={isRedirecting} >{isRedirecting   ? "loading.." : "Continue to pay"}</Button>

</form>
</Form>
          

      </div>

   
    </div>
    </div>
 
  )
}
