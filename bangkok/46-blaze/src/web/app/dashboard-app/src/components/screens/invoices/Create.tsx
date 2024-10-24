//@ts-nocheck
"use client"
import Image from 'next/image'
import Link from 'next/link'
import React, {useState, useEffect} from 'react'
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
import AddCstomer from '@/components/create-customer/AddCstomer'

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { COUNTRIES_DIAL_CODE } from '@/lib/countries-code'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useUserContext } from '@/components/providers/user-context'
import { BACKEND_URL, currencies, paymentScheduleDates } from '@/constants'


const formSchema = z.object({
  customer: z.string(),
  invoiceNumber : z.string(),
  dueDate : z.string(),
  paymentToken : z.string(),
  description  : z.string(),
  InvoiceMemo  : z.string().min(9, {
    message : "Memo must be at least 9 characters"
  }),
  InvoiceFooter  : z.string().min(9, {
    message : "Footer must be at least 9 characters"
  }),
 itemDescriptioon  : z.string(),
  itemPrice : z.coerce.number().min(1, {
    message  : "Amount must be  greater than 1"
  }),
  itemQuantity : z.coerce.number().min(1, {
    message  : "Amount must be  greater than 1"
  }),

tax : z.coerce.number()

})

export default function CreateInvoice() {

  const {userProfile}  =  useUserContext()

   console.log("user profile", userProfile)
  const {toast}  = useToast()

  const  router =  useRouter()


      // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer: undefined,
      invoiceNumber  :  "open",
      dueDate  :  undefined,
      paymentToken  :  undefined,
      description  : "",
      itemDescriptioon  : "",
      itemPrice  :  undefined,
      itemQuantity : undefined,
      tax : 0,
      InvoiceFooter : "",
      InvoiceMemo : ""
     
    },
  })


       const  PAY_BASE_URL = `https://got-be.onrender.com/pay/`
       const  LOCAL_PAY_BASE_URL = `http://localhost:5000/pay/`
       const  INVOICE_BASE_URL = `${BACKEND_URL}/invoice/`

       const  CUSTOMER_BASE_URL = `${BACKEND_URL}/customer/`



       //  FTECH  ALL  USER CUSTOMERS

       const  fetchUserCustomers  =  async ()  =>  {
     const res =   await axios.get(`${CUSTOMER_BASE_URL}get-customers/${userProfile?.id}`)
        return res.data
       }

     const {data : customers, isLoading : isCustomersLoading, isError : isCustomersErro }  = useQuery({
      queryKey : ['customers'],
      queryFn : fetchUserCustomers,
      enabled : !!userProfile?.id
     })

       console.log("customers", customers)
       

         const  handleSubmitInvoice =  async (valuesData )  =>  {
          console.log("I'm hitted", valuesData)
          const  res  = await  axios.post(`${INVOICE_BASE_URL}create-invoice`,   valuesData)
          return res
         }

         const invoiceMutation =  useMutation({
           mutationFn : handleSubmitInvoice,
           mutationKey : ['invoices']
         })
           // 2. Define a submit handler.
           const  values = form.watch()
           const  valuesData  =  {
            userId  :  userProfile?.id,
            customer:  values.customer,
             memo  :  values.InvoiceMemo,
            dueDate  :  values.dueDate,
            paymentToken  :   values.paymentToken,
            tax : values.tax,
             items   : [
              {
               description : values.description,
                quantity : values.itemQuantity,
                price : values.itemPrice
              }
             ]
            
          }

  const onSubmit  =  async (valuess: z.infer<typeof formSchema>)=>{

console.log("values", valuesData)
    try {
      await invoiceMutation.mutateAsync(valuesData)
         toast({
          title  : "Invoice created and sent",
          description :  "Invoice created and  sent"
         })
      
    } catch (error) {
       console.log("error", error)
       toast({
        variant : "destructive",
        title : "something went wrong",
        description  : "Something went wrong, report the issue to our customer support "
       })
      
    }
 }

   const  handleCreateAndSend =  async ()  =>  {
     try {
        await invoiceMutation.mutateAsync(valuesData)
        toast({
          title  : "Invoice created and sent",
          description :  "Invoice created and  sent"
         })
     } catch (error) {
      toast({
        variant : "destructive",
        title : "something went wrong",
        description  : "Something went wrong, report the issue to our customer support "
       })
      
     }
   }

  const  {watch} = form

  const priceAmount = watch("itemPrice")
  const itemQuantity =  watch("itemQuantity")
  const  taxAmount  =  watch("tax")
  const customer = watch("customer")

  console.log("selected customer", customer)

   const itemArray =  [
    {
      //description : values.description,
       quantity :  itemQuantity,
       price :  priceAmount
     }
   ]

     // Calculate subtotal and total amounts
     const subtotal = itemArray.reduce((sum, item) => sum + (item.quantity * item.price), 0);
   
  // Disabled logic
const isButtonDisabled = !values.customer ||  !values.dueDate || !values.paymentToken || !values.itemPrice
  return (
    <div  className=' w-full      min-h-screen  mx-auto'>

  
     <div   className='max-w-3xl  mx-auto  min-h-screen  my-3 '>
  

<Form {...form}>
  
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
   
      

  
  <div className='p-5 bg-gray-100  my-4 rounded-xl'>
            <FormField
          control={form.control}
          name="customer"
          render={({ field }) => (


            <FormItem className=''>

              <FormLabel>Customer</FormLabel>
              
                 <Select onValueChange={field.onChange} defaultValue={field.value}  >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                </FormControl>

             
                <SelectContent>

                { customers?.map((item, i)  => (
                   <SelectItem  key={i} value={item._id}  >{`(${item.customerName})  ${item.customerEmail}`}</SelectItem>
                ))}

                  
<Dialog>
  <DialogTrigger asChild>
    <Button className='my-3 w-full' size={"sm"} variant={"secondary"}>Add new customer</Button>
  </DialogTrigger>
  <DialogContent>
    <DialogHeader>
      <DialogTitle>Add customer</DialogTitle>
      </DialogHeader>
      <AddCstomer  />
  </DialogContent>
</Dialog>
                
                </SelectContent>
              </Select>
                 
            </FormItem>

            
                       )}/> 


                  

</div>



<div>
   <h1 className=' my-3'>Invoice  Details</h1>

<div  className='p-6 bg-gray-100 rounded-xl'>
<div  className='flex  space-x-5 my-3 items-center '>
   <p className='font-medium '>Invoice number</p>

     <div className='p-2 rounded-lg border '>
    <p className='text-sm font-mono'>AUTO GENERATED</p>
     </div>
</div>


 <div className='flex  space-x-7 w-full items-center justify-between my-5'>

   <div className=''>
    <p className='font-medium'>Due in</p>
   </div>
<div className='flex space-x-3 items-center justify-center'>
   <FormField
          control={form.control}
          name="dueDate"
          render={({ field }) => (



            <FormItem className='w-80 '>
              
                 <Select onValueChange={field.onChange} defaultValue={"tomorrow"}  >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Due date" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                {paymentScheduleDates.map((item, i)  => (
                  <SelectItem key={i} value={item.value}>{item.title}</SelectItem>
                ))}
                </SelectContent>
              </Select>
                 
            </FormItem>

            
                       )}/>

                      
                       </div>
 </div>


 <div className='flex justify-between items-center'>

  <div>
     <p className='font-medium'>Currency </p>
  </div>

  <FormField
          control={form.control}
          name="paymentToken"
          render={({ field }) => (



            <FormItem className='w-80 '>
              
                 <Select onValueChange={field.onChange} defaultValue={"GLMR"}  >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Payment currency" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                {currencies.map((item, i)  => (
                  <SelectItem key={i} value={item.value}>{item.name}</SelectItem>
                ))}
                </SelectContent>
              </Select>
                 
            </FormItem>

            
                       )}/>
 </div>
  <div>

</div>

</div>

</div>


           <div  className='my-4'>

              <h1 className='  font-medium my-3'>Item </h1>


     

          <div className=' p-6 bg-gray-100 rounded-xl'>
<div className='flex space-x-3 justify-between'>
          <FormField
          control={form.control}
          name="description"
          rules={{required : true}}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Name"
                  className=""
                  {...field}
                  type='text'
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
          control={form.control}
          name="itemQuantity"
          rules={{required : true}}
          render={({ field }) => (
            <FormItem>
               <FormLabel>Quantity</FormLabel>
              <FormControl>
                <Input
                  placeholder="1"
                  className=""
                  {...field}
                  type='number'
                  
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
          control={form.control}
          name="itemPrice"
          rules={{required : true}}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Price</FormLabel>
              <FormControl>
              
                <Input
                  placeholder="1"
                  className=""
                  {...field}
                  type='number'
                  
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
</div>
<div className='flex justify-between items-center my-3'>
          <FormField
          control={form.control}
          name="tax"
          rules={{required : true}}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax rate  <span  className='text-xs text-muted-foreground'>Optional</span></FormLabel>
              <FormControl>
              
                <Input
                  placeholder="optional"
                  className=""
                  {...field}
                  type='number'
                  
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className='flex space-x-5'>
          <p>Subtotal</p>
           <p>{subtotal} </p>
        </div>
          
        </div> 
          </div>

     
           </div>


           
           <div  className='my-4 w-full'>

           <h1 className='  font-medium my-3'>Additional <span  className='text-muted-foreground text-xs ml-2 '>Optional</span></h1>

           <div  className='p-6 bg-gray-100 rounded-xl w-full'>

           <FormField
          control={form.control}
          name="InvoiceMemo"
          rules={{required : true}}
          render={({ field }) => (
            <FormItem className='my-4'>
               <FormLabel>Memo</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Invoice memo"
                  className="resize-none h-16 "
                  {...field}
                 
                  
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
          control={form.control}
          name="InvoiceFooter"
          rules={{required : true}}
          render={({ field }) => (
            <FormItem className='my-4'>
               <FormLabel>Footer</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Invoice footer"
                  className="resize-none h-16 "
                  {...field}
                 
                  
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
           </div>
             
           </div>

        
           <Button type="button" onClick={handleCreateAndSend} className='w-full' 
            disabled={invoiceMutation.isPending || !values.customer ||  !values.dueDate ||  !values.itemPrice || !values.paymentToken  }
            >{invoiceMutation.isPending  ?  "Adding customer.."  :  "Save and send"}
            </Button>

       
      </form>
    </Form>
 
     </div>
    </div>
  )
}
