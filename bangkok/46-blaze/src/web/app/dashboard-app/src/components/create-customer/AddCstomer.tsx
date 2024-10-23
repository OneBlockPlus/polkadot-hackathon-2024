//@ts-nocheck

import React, {useState} from 'react'
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
import { COUNTRIES_DIAL_CODE } from '@/lib/countries-code'
import { useUserContext } from '../providers/user-context'
import { useMutation } from '@tanstack/react-query'
import { BACKEND_URL } from '@/constants'

export default function AddCstomer() {
     const  PAY_BASE_URL = `${BACKEND_URL}/pay/`
       const  LOCAL_PAY_BASE_URL = `http://localhost:5000/customer/`

       const {userProfile} = useUserContext()
       const {toast}  = useToast()





    const formSchema = z.object({
        customerName: z.string().min(5, {
          message : "Title must be at least 5 characters"
        }),
        customerEmail : z.string(),
        organizationName : z.string(),
        customerPhoneNumber : z.string(),
        customerPhoneCode : z.string(),
        customerCountry : z.string(),
        customerAddressLine1 : z.string(),
        customerAddressLine2 : z.string(),
        customerCity : z.string(),
        customerState : z.string(),
        customerZipCode : z.string(),
        customerTaxId : z.string(),
      
      })


                   // 1. Define your form.
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
     customerName: undefined,
      customerEmail  :  undefined,
      organizationName  :  undefined,
      customerPhoneNumber  :  "",
      customerPhoneCode  : "",
      customerCountry  : "",
      customerAddressLine1  :  "",
      customerAddressLine2 : "",
      customerCity : "",
      customerZipCode : "",
      customerState : "",
      customerTaxId  :  "",
     
    },
  })

  const handleAddNewCustomer =  async (valueData)  =>  {
    const  res  = await  axios.post(`${LOCAL_PAY_BASE_URL}add-customer`,  valueData)
    return res
  }

  const customerMutation = useMutation({
    mutationFn : handleAddNewCustomer,
    mutationKey : ['customers']
  })

       // 2. Define a submit handler.
  const onSubmit  =  async (values: z.infer<typeof formSchema>)=>{
    const valueData = {
      userId : userProfile?.id,
      customerName: values.customerName,
      customerEmail  :  values.customerEmail,
      organizationName  :  values.organizationName,
      customerPhoneNumber  :  values.customerPhoneNumber,
      customerPhoneCode  : values.customerPhoneCode,
      customerCountry  :  values.customerCountry,
      customerAddressLine1  :  values.customerAddressLine1,
      customerAddressLine2 : values.customerAddressLine2,
      customerCity :  values.customerCity,
      customerZipCode : values.customerZipCode,
      customerState : values.customerState,
      customerTaxId  :  values.customerTaxId

    }

    try {
      
       await customerMutation.mutateAsync(valueData)
         toast({
          title  : "Created new customer",
          description :  "New Customer added to your dashaboard"
         })
           
      
    } catch (error) {
       console.log("error", error)
       toast({
        title : "something went wrong",
        description  : "something went wrong, report the issue to our customer support ",
        variant : "destructive"
       })
      
    }
 
   
  }

  return (
    <div>
       <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="customerName"
            rules={{
              required : true
            }}
          render={({ field }) => (
            
                 <FormItem  className='my-4'>
              <FormLabel>Customer name</FormLabel>
              <FormControl>
                <Input placeholder="Mo shaikh" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>      )}/> 

            <FormField
          control={form.control}
          name="customerEmail"
          rules={{required : true}}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Customer email</FormLabel>
              <FormControl>
                <Input
                  placeholder="abdulkabugu@gmail.com"
                  className=""
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />


<FormField
          control={form.control}
          name="organizationName"
          rules={{required : true}}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization name</FormLabel>
              <FormControl>
                <Input
                  placeholder="Polkadot foundation"
                  className=""
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

  
  <div className='flex space-x-3 w-full items-center '>
            <FormField
          control={form.control}
          name="customerPhoneCode"
          render={({ field }) => (



            <FormItem className='  max-w-[18%]'>
              
                 <Select onValueChange={field.onChange} defaultValue={field.value}  >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="+1" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                {COUNTRIES_DIAL_CODE.map((item, i)  => (
                   <SelectItem  key={i} value={item.name}  >{item.dial_code}</SelectItem>
                ))}
                </SelectContent>
              </Select>
                 
            </FormItem>

            
                       )}/> 


                  




<FormField
          control={form.control}
          name="customerPhoneNumber"
          rules={{required : true}}
          render={({ field }) => (
            <FormItem className='w-full'>
            
              <FormControl >
                <Input
                  placeholder="phone number"
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

  



           <div  className='my-4'>

              <h1 className='  font-medium'>Customer address  <span  className='text-muted-foreground text-xs ml-2 '>Optional</span></h1>


              <FormField
          control={form.control}
          name="customerCountry"
          render={({ field }) => (



            <FormItem className='my-4  '>
              
                 <Select onValueChange={field.onChange} defaultValue={field.value}  >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                {COUNTRIES_DIAL_CODE.map((item, i)  => (
                  <SelectItem key={i} value={item.name}>{item.name}</SelectItem>
                ))}
                </SelectContent>
              </Select>
                 
            </FormItem>

            
                       )}/> 
          <FormField
          control={form.control}
          name="customerAddressLine1"
          rules={{required : true}}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="address line 1"
                  className=""
                  {...field}
                  
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
          <FormField
          control={form.control}
          name="customerAddressLine2"
          rules={{required : true}}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="address line 2"
                  className=""
                  {...field}
                  
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

          <div className='flex space-x-3 justify-between'>

          <FormField
          control={form.control}
          name="customerState"
          rules={{required : true}}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="State"
                  className=""
                  {...field}
                  
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
          control={form.control}
          name="customerCity"
          rules={{required : true}}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="City"
                  className=""
                  {...field}
                  
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

<FormField
          control={form.control}
          name="customerZipCode"
          rules={{required : true}}
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  placeholder="Zip/pin code"
                  className=""
                  {...field}
                  
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
             
          </div>
           </div>


           
           

        
        <Button type="submit" className='w-full'  disabled={customerMutation.isPending}>{customerMutation.isPending  ?  "Adding customer.."  :  "Add customer"}</Button>
      </form>
    </Form>
    </div>
  )
}
