//@ts-nocheck

"use client"

import React,  {useState} from 'react'
import Navbar from '../dashboard/Navbar'
import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
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
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  import { Textarea } from "@/components/ui/textarea"
import axios from 'axios'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import withAuth from '@/components/middleware/auth-middleware'
import { useUserContext } from '@/components/providers/user-context'
import { BACKEND_URL } from '@/constants'
const formSchema = z.object({
  linkName: z.string().min(5, {
    message : "Title must be at least 5 characters"
  }),
  paymentType : z.string(),
  amount : z.coerce.number().min(1, {
    message  : "Amount must be  greater than 1"
  }),
  //supportedTokens : z.string(),  DISBLED  PAYMENT TOKENS  PARAM
  collectEmail : z.boolean(),
  collectName : z.boolean(),
  collectAddress : z.boolean(),
  redirectUser : z.boolean(),
  paymentTag : z.string(),
  labelText : z.string(),
  redirectUrl : z.string(),
  userId : z.string(),
  description : z.string().min(10,  {
    message  : "Description  must be  at least 10 characters."
  })
 // recieverWallet :  z.string()

})




/*type Inputs = {
  name: string
  paymentType: string
  amount :  number,
  supportedTokens : any
  collectEmail : boolean
  collectName :  boolean
  collectAddress : boolean
  paymentTag : string
  labelText : string
  redirectUser : boolean
  redirectUrl : string
}*/


const  Create = () =>  {
  const [isRedirecting, setisRedirecting] = useState(false)
  const {userProfile}  = useUserContext()
  const {toast}  = useToast()


   
  const  router =  useRouter()


      // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      linkName: "",
      paymentType  :  "open",
      collectEmail  :  false,
      collectName  :  false,
      collectAddress  : false,
      amount  : 1,
      redirectUser  :  false,
      redirectUrl : "",
      paymentTag : "",
      labelText : "",
      //recieverWallet : "",
      userId  :  userProfile?.id,
      description : ""
     
    },
  })


       const  PAY_BASE_URL = `${BACKEND_URL}/pay/`
       const  LOCAL_PAY_BASE_URL = `http://localhost:5000/pay/`

 
  // 2. Define a submit handler.
  const onSubmit  =  async (values: z.infer<typeof formSchema>)=>{
    setisRedirecting(true)

    try {
      const  res  = await  axios.post(`${PAY_BASE_URL}create-link`,  values)
         toast({
          title  : "New payment link created",
          description :  "Youve  succefully created new payment link"
         })
           
        setisRedirecting(false)
     router.push("/payment/payment-links")
           console.log(res.status)
      
    } catch (error) {
       console.log("error", error)
       setisRedirecting(false)
       toast({
        title : "something went wrong",
        description  : "something went wrong, report the issue to our customer support "
       })
      
    }
      

        
    console.log("the value", values)
   
  }



     

  return (
    <div>
        <Navbar  />

          <div  className='max-w-5xl  border border-border min-h-screen w-full mx-auto p-3'>

              <div  className='max-w-md  w-full   mx-auto p-2'>

                  <h1  className='text-2xl font-bold'>Create payment link</h1>


                  <div>
                  <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="linkName"
            rules={{
              required : true
            }}
          render={({ field }) => (
            
                 <FormItem  className='my-4'>
              <FormLabel>Link title</FormLabel>
              <FormControl>
                <Input placeholder="charity donation.." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>      )}/> 

            <FormField
          control={form.control}
          name="description"
          rules={{required : true}}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us a little bit about this payment link"
                  className="resize-none h-32"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

  
            <FormField
          control={form.control}
          name="paymentType"
          render={({ field }) => (

            <FormItem className='my-4'>
                <FormLabel>Payment type</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}  >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a verified email to display" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="fixed">Fixed price</SelectItem>
                  <SelectItem value="open">
             <h1 className='text-sm  text-secondary-foreground capitalize '>Open price</h1>
                  </SelectItem>
                </SelectContent>
              </Select>
                 
            </FormItem>

            
                       )}/> 


                       {form.watch("paymentType")  === "fixed"  &&  (
                            <FormField
                            control={form.control}
                            name="amount"
                              rules={{
                                required : false
                              }}
                            render={({ field }) => (
                              
                                   <FormItem  className='my-1'>
                                <FormLabel>Amount</FormLabel>
                                <FormControl>
                                  <Input type='number' placeholder="100" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>      )}/> 
                       )}



{/*
<FormField
          control={form.control}
        
          name="recieverWallet"
          render={({ field }) => (

            <FormItem className='my-4'>
                <FormLabel>Reciever wallet</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}  >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a verified email to display" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="fixed">Fixed price</SelectItem>
                  <SelectItem value="open">
             <h1 className='text-sm  text-secondary-foreground capitalize '>Open price</h1>
                  </SelectItem>
                </SelectContent>
              </Select>
                 
            </FormItem>


          )}/> 

          */}

           <div  className='my-4'>

              <h1 className=' capitalize  text-xl font-semibold'>Collect customer info  <span  className='text-muted-foreground text-xs ml-2 uppercase'>Optional</span></h1>


              <FormField
              control={form.control}
              name="collectEmail"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 my-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Collect Email
                    </FormLabel>
                  
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="collectName"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 my-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Collect Name
                    </FormLabel>
                  
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="collectAddress"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 my-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">
                      Collect Billing Address
                    </FormLabel>
                  
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
           </div>


           <div  className='my-4'>
            <h1  className='capitalize  text-xl font-semibold'>Advanced  <span  className='text-muted-foreground text-xs ml-2 uppercase'>Optional</span></h1>

             <div>
             <FormField
          control={form.control}
          name="paymentTag"
          rules={{required : false}}
          render={({ field }) => (

            <FormItem className='my-6'>
                <FormLabel>Payment Tag</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Donation" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="donation">Donation</SelectItem>
                  <SelectItem value="freelancing">
             Freelancing
                  </SelectItem>
                  <SelectItem value="event">
              Event
                  </SelectItem>
                  <SelectItem value="sponsorship">
             Sponsorship
                  </SelectItem>

                  <SelectItem value="membership">
             membership
                  </SelectItem>
                </SelectContent>
              </Select>
                 
            </FormItem>


          )}/> 





<FormField
          control={form.control}
          name="labelText"
          render={({ field }) => (

            <FormItem className='my-4'>
                <FormLabel>Label for call to action</FormLabel>
                 <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl >
                  <SelectTrigger  >
                    <SelectValue placeholder="Pay" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="pay">Pay</SelectItem>
                  <SelectItem value="book">
            Book
                  </SelectItem>
                  <SelectItem value="donate">
            Donate
                  </SelectItem>
                </SelectContent>
              </Select>
                 
            </FormItem>


          )}/> 



<FormField
          control={form.control}
          name="redirectUser"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Redirect customer to your page
                </FormLabel>
                <FormDescription>
                  Redirect customer to your website
               
                </FormDescription>
              </div>
            </FormItem>
          )}
        />


          {form.watch("redirectUser")  &&  (
      <FormField
      control={form.control}
      name="redirectUrl"
        rules={{
          required : false
        }}
      render={({ field }) => (
        
             <FormItem  className='my-1'>
          <FormLabel>Redirect link</FormLabel>
          <FormControl>
            <Input placeholder="my-website.com" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>      )}/> 
          )}

             </div>
           </div>
           

        
        <Button type="submit" className='w-full'  disabled={isRedirecting}>{isRedirecting  ?  "Creating payment link.."  :  "Create payment link"}</Button>
      </form>
    </Form>
                  </div>
              </div>

          </div>
    </div>
  )
}


export default withAuth(Create)
