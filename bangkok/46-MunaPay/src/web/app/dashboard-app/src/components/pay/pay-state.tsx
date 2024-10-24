//@ts-nocheck

"use client"


import CountdownTimer from '@/components/CountDown'
import React, {useState} from 'react'
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from "@/components/ui/form"
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
  import { useQRCode } from 'next-qrcode'
  import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
  import { Input } from "@/components/ui/input"
  import { useForm, SubmitHandler } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle, CheckCheckIcon, CircleCheckBig, Loader, Loader2, LoaderPinwheel, Mail, MessageCircleWarningIcon, Phone, QrCode, TimerIcon, User2Icon, UserRound, Wallet, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { useWallet } from '@aptos-labs/wallet-adapter-react'
import { WalletSelector2 } from '@/components/aptos-connector/wallet-selector2'
import { toSmallestUnit } from '@/utils/aptosUtils'
import { aptos } from '@/lib/aptos-config'
import { useQuery } from '@tanstack/react-query'
import { WEBSITE_BASE_URL } from '@/utils/constants'

type Props  = {
    data : any
    SESSION_EXP_TIME : any
    status : any
    isCheckingOut : any
    setisCheckingOut :  any

}


const formSchema = z.object({
    payerEmail: z.string(),
    payerName : z.string(),
      payerAddress : z.string(),
       country :   z.string(),
      addressLine1  :  z.string(),
      addressLine2  :  z.string(),
      city :  z.string(),
      state : z.string(),
      zipCode :  z.string()
   })
export default function PayState({data, SESSION_EXP_TIME, status, isCheckingOut, setisCheckingOut} : Props) {
    const {connected, connect, account, signAndSubmitTransaction} = useWallet()
    const [isSendingTx, setisSendingTx] = useState(false)


    const handleFetchCountries  =   async ()  =>  {
        const res  =  await  axios.get(`https://restcountries.com/v3.1/all?fields=name,flags`)
         return res.data
      }

      const {data : countries, isError : isCountriesError, isSuccess : isCountriesSuccess, isLoading : isCountriesLOading, error : countriesErro}  = useQuery({
        queryKey : ['countries'],
        queryFn : handleFetchCountries
       })


       console.log("data from pay state", data?.reciever?.collectEmail)

    const {toast}  = useToast()
    const params =  useParams()
        const  router =  useRouter()
        const sessionId = params.sessionId
      const  PAY_BASE_URL = `https://got-be.onrender.com/pay/`
       const  LOCAL_BASE_URL  = "http://localhost:5000/pay/"
       const  LOCAL_HOME_URL  = "http://localhost:5000"
       const  OFFICIAL__BASE_URL  = "http://localhost:5000"


       const { Canvas } = useQRCode();

  
        // 1. Define your form.
        const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: {
             payerEmail : "",
             payerName :  "",
             payerAddress : "",
             country  :  "",
             addressLine1  : "",
             addressLine2  : "",
             zipCode  : "",
             
            },
          })




          const RECIEVER  = "0x09d29f0ec5b03fc73b59e35deb80356cde17b13b8db94ded34fc8130dc1da1d9"
                      const handleTransfer2 =  async ()  =>  {
  try{
                        const response = await signAndSubmitTransaction({
                          sender: account?.address,
                          data: {
                            function: "0x1::coin::transfer",
                            typeArguments: ["0x1::aptos_coin::AptosCoin"],
                            functionArguments: [RECIEVER, toSmallestUnit("0.01", 8)],
                          },
                        });
                        // if you want to wait for transaction
                
                         console.log("the tx response", response)
                        
                          const res = await aptos.waitForTransaction({ transactionHash: response.hash });
                          setisSendingTx(true)
                          console.log("await response", res)
                          return  res.hash
                           
                        } catch (error) {
                          toast({
                            variant  : "destructive",
                            title  : "spmething went wrong",
                            description : "something went  wrong please  check you connection and  try aagain"
                          })
                          console.error("something went wrong", error);
                        }

                      }


                      const  handleInitiatePayment =  async ()  =>  {
                        try {
                            const  res  =  await axios.post(`${LOCAL_BASE_URL}initiate-payment/${sessionId}`)
                              console.log(res.data)
                        } catch (error) {
                          console.log("something went wrong initiating payment", error)
                        }
                      }

                  
              
    // 2. Define a submit handler.
    const onSubmit  =  async (values: z.infer<typeof formSchema>)=>{
      setisCheckingOut(true)
     
  
      try {
        
       /* const txHash =  await  handleTransfer2()
        await handleInitiatePayment()
    
        const valueData =  {
             payerEmail : values.payerEmail,
             payerName : values.payerName,
             payerWallet : account?.address,
             payerAddress : {
              country : values.country,
              addressLine1 : values.addressLine1,
              addressLine2 : values.addressLine2,
               city : values.city,
               state : values.state,
               zipCode : values.zipCode

             },
             transactionHash : txHash
          
        }
        const  res  = await  axios.post(`${LOCAL_BASE_URL}check-out/${sessionId}`,  valueData)
      
            //await   handleSendReciept()
               alert("hello  world")
             console.log(res.status)*/

              console.log("values", values)
        
      } catch (error) {
         console.log("error", error)
         setisCheckingOut(false)
         /*toast({
          title : "something went wrong",
          description  : "something went wrong check consol"
         })*/
        
      }
        }


                // 2. Define a pay handler.
         /* const pay  =  async ()=>{
            setisCheckingOut(true)
        
            try {
              
              const txHash =  await  handleTransfer2()
              await handleInitiatePayment()
              const valueData =  {
                transactionHash : txHash
                    //senderWallet : account?.address
               }
              const  res  = await  axios.post(`${LOCAL_BASE_URL}check-out/${sessionId}`,  valueData)
                 toast({
                  title  : "New ;onk created",
                  description :  "Youve  succefully created new payment link"
                 })
                  //await   handleSendReciept()
                  
                   console.log(res.status)
              
            } catch (error) {
               console.log("error", error)
               setisCheckingOut(false)
               toast({
              variant  : "destructive",
                title : "something went wrong",
                description  : "something went wrong check consol"
               })
              
            }
              
        
            
           
          }*/
  return (
<>
    <div  className='flex  justify-between items-center  my-4 mb-6'>
    <h1  className='font-semibold  text-sm lg:text-xl'>{data?.reciever?.collectEmail ||  data?.reciever?.collectAddress ||  data?.reciever?.collectName  ?  "Fill  in the  details"   :  "Pay with"}</h1>
      
             <CountdownTimer   expTime={SESSION_EXP_TIME}  />
        
      
 </div>






   {
     data?.reciever?.collectEmail ||  
     data?.reciever?.collectName  ||
     data?.reciever?.collectAddress ?

     (
        <>
<h1 className='  font-semibold text-sm my-2  '>Contact  information</h1>


<div> 
       
       <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

<div className='flex flex-col space-y-2'>
    {  data?.reciever?.collectName  &&
           <FormField
             control={form.control}
             name="payerName"
               rules={{
                 required : false
               }}
             render={({ field }) => (

               
               
                    <FormItem  className=''>
             
                 <FormControl>
                    <div className='flex space-x-2 items-center'>
                        <User2Icon className='w-5 h-5' />
                   <Input className='h-7' type='text' placeholder="name" {...field}  />
                   </div>
                 </FormControl>
                 <FormMessage />
               </FormItem>      )}/> 

               
   
             }
   
   {  data?.reciever?.collectEmail &&
           <FormField
             control={form.control}
             name="payerEmail"
               rules={{
                 required : false
               }}
             render={({ field }) => (
               
                    <FormItem  className=''>
                 
                 <FormControl>
                 <div className='flex space-x-2 items-center'>
                 <Mail className='w-5 h-5' />
                   <Input className='h-7' type='email' placeholder="example@gmail.com" {...field}  />
                   </div>
                 </FormControl>
                 <FormMessage />
               </FormItem>      )}/> 
   
             }
             </div>
   
   {  data?.reciever?.collectAddress  &&
          
    <div>
                   <h1 className='mb-2'>Shipping address</h1>
                     <div>
   
                       
   <FormField
             control={form.control}
             name="country"
             render={({ field }) => (
   
               <FormItem className='my-1'>
                    <Select onValueChange={field.onChange} defaultValue={field.value}  >
                   <FormControl>
                     <SelectTrigger>
                       <SelectValue placeholder="Country" />
                     </SelectTrigger>
                   </FormControl>
                   <SelectContent>
                     {countries?.map((item, i)  =>  (
                       <SelectItem value={item.name?.common} key={i}>{item.name.common}</SelectItem>
                     ))}
                   </SelectContent>
                 </Select>
                    
               </FormItem>
   
               
                          )}/>
   
   
   <FormField
             control={form.control}
             name="addressLine1"
               rules={{
                 required : false
               }}
             render={({ field }) => (
               
                    <FormItem  className='my-1'>
                 <FormControl>
                   <Input placeholder="Address line 1" {...field} />
                 </FormControl>
                 <FormMessage />
               </FormItem>      )}/> 
   
               <FormField
             control={form.control}
             name="addressLine2"
               rules={{
                 required : false
               }}
             render={({ field }) => (
               
                    <FormItem  className='my-1'>
                 <FormControl>
                   <Input placeholder="address line 2" {...field}  />
                 </FormControl>
                 <FormMessage />
               </FormItem>      )}/> 
   
   
    <div  className='flex  space-x-3'>
    <FormField
             control={form.control}
             name="city"
               rules={{
                 required : false
               }}
             render={({ field }) => (
               
                    <FormItem  className='my-1'>
                 
                 <FormControl>
                   <Input placeholder="City" {...field}  />
                 </FormControl>
                 <FormMessage />
               </FormItem>      )}/> 
   
               <FormField
             control={form.control}
             name="state"
               rules={{
                 required : false
               }}
             render={({ field }) => (
               
                    <FormItem  className='my-1'>
                 
                 <FormControl>
                   <Input placeholder='State' {...field}  />
                 </FormControl>
                 <FormMessage />
               </FormItem>      )}/> 
   
               <FormField
             control={form.control}
             name="zipCode"
               rules={{
                 required : false
               }}
             render={({ field }) => (
               
                    <FormItem  className='my-1'>
                 
                 <FormControl>
                   <Input placeholder="zip/pin code" {...field}  />
                 </FormControl>
                 <FormMessage />
               </FormItem>      )}/> 
    </div>
   
   
                     </div>
               </div>} 



          <div  className='mt-4'>
   <p className='  md:font-semibold  text-sm'>Continue with your preferred payment method</p>
</div>

 <Accordion type="single" collapsible className="w-full">
 
 <div className='border p-3 rounded-xl'>
                  <div className='flex items-center space-x-2  mt-0 mb-6 '>
                     <Wallet className='w-5 h-5'  />
                     <p className=''>Wallet</p>
                  </div>
                   {! connected  ?  (
                    <WalletSelector2  />
                   ) : (
                    <Button  type='submit' className={`w-full capitalize `} disabled={isCheckingOut}>{data?.reciever?.labelText ? `${data?.reciever?.labelText} Now` : isCheckingOut ? "Sending.." : "Lipi to pay"}</Button>  

                   )}
                   </div>
   
 <AccordionItem value="item-2"  className='my-3 border px-2 rounded-xl'>
   <AccordionTrigger>
      <div  className='flex items-center space-x-2'><QrCode className='w-5 h-5'  />
      <p>Scan QR  code</p>
       </div>
   </AccordionTrigger>
   <AccordionContent className='flex  items-center justify-center  '>
      <div  className='my-4  flex  items-center justify-center  flex-col'>
      <div  className=' bg-slate-100 rounded-xl p-2'>
                      <Canvas
                       text={`${WEBSITE_BASE_URL}payment/checkout-session/${sessionId}`}
                       options={{
                         errorCorrectionLevel: 'M',
                         margin: 2,
                         scale: 20,
                         width: 190,
                         color: {
                             dark: '#09090b',
                             light: '#f8fafc',
                           },
                       }}
                       logo={{
                         src: 'https://pbs.twimg.com/profile_images/1556801889282686976/tuHF27-8_400x400.jpg',
                         options: {
                           width: 35,
                           x: undefined,
                           y: undefined,
                           
                         }
                       }}
                     />
                 </div>

                 <div  className='border  p-3 mt-3 rounded-xl'>
                       <div  className='my-4 '>
                          <h1  className='font-medium text-sm   mb-1'>{`Send ${data?.reciever.amount} APT  on Aptos network`}</h1>
                           <div className='flex items-center  space-x-1'>
                              <MessageCircleWarningIcon  className='w-3 h-3 text-muted-foreground'  />
                               <p  className='text-xs  text-muted-foreground'>Sending funds on the wrong network or token leads to fund loss.</p>
                           </div>
                       </div>
                       <Button disabled ={isCheckingOut || ! status}  className='w-full '>
                       
                      { status &&  status.status  === "COMPLETED"  && status.invoiceId === sessionId ?  (
                        <>
                        <CheckCheckIcon className="mr-2 h-4 w-4" />
                         Payment made succfully
                         </>
                         )  : status &&  status.status  === "FAILED"  && status.invoiceId === sessionId? (
                          <>
                              <AlertCircle className='mr-2 h-4 w-4 text-red-600' />
                              Payment failed
                          </>
                         ) : (
                          <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Checking payment status..
                          </>
                         ) }
                     </Button>
                   </div>
</div>
    
   </AccordionContent>
 </AccordionItem>

</Accordion>     

    </form>

</Form>
</div>
    </>
   
     )  :  (
        <Accordion type="single" collapsible className="w-full">
 
        <div className='border p-3 rounded-xl'>
                         <div className='flex items-center space-x-2  mt-0 mb-6 '>
                            <Wallet className='w-5 h-5'  />
                            <p className=''>Wallet</p>
                         </div>
                          {! connected  ?  (
                           <WalletSelector2  />
                          ) : (
                           <Button  onClick={pay} className={`w-full capitalize `} disabled={isCheckingOut}>{data?.reciever?.labelText ? `${data?.reciever?.labelText} Now` : isCheckingOut ? "Sending.." : "Continue to pay"}</Button>  
       
                          )}
                          </div>
          
        <AccordionItem value="item-2"  className='my-3 border px-2 rounded-xl'>
          <AccordionTrigger>
             <div  className='flex items-center space-x-2'><QrCode className='w-5 h-5'  />
             <p>Scan QR  code</p>
              </div>
          </AccordionTrigger>
          <AccordionContent className='flex  items-center justify-center  '>
             <div  className='my-4  flex  items-center justify-center  flex-col'>
             <div  className=' bg-slate-100 rounded-xl p-2'>
                             <Canvas
                              text={`${WEBSITE_BASE_URL}payment/checkout-session/${sessionId}`}
                              options={{
                                errorCorrectionLevel: 'M',
                                margin: 2,
                                scale: 20,
                                width: 190,
                                color: {
                                    dark: '#09090b',
                                    light: '#f8fafc',
                                  },
                              }}
                              logo={{
                                src: 'https://pbs.twimg.com/profile_images/1556801889282686976/tuHF27-8_400x400.jpg',
                                options: {
                                  width: 35,
                                  x: undefined,
                                  y: undefined,
                                  
                                }
                              }}
                            />
                        </div>
       
                        <div  className='border  p-3 mt-3 rounded-xl'>
                              <div  className='my-4 '>
                                 <h1  className='font-medium text-sm   mb-1'>{`Send ${data?.reciever.amount} APT  on Aptos network`}</h1>
                                  <div className='flex items-center  space-x-1'>
                                     <MessageCircleWarningIcon  className='w-3 h-3 text-muted-foreground'  />
                                      <p  className='text-xs  text-muted-foreground'>Sending funds on the wrong network or token leads to fund loss.</p>
                                  </div>
                              </div>
                              <Button disabled ={isCheckingOut || ! status}  className='w-full '>
                              
                             { status &&  status.status  === "COMPLETED"  && status.invoiceId === sessionId ?  (
                               <>
                               <CheckCheckIcon className="mr-2 h-4 w-4" />
                                Payment made succfully
                                </>
                                )  : status &&  status.status  === "FAILED"  && status.invoiceId === sessionId? (
                                 <>
                                     <AlertCircle className='mr-2 h-4 w-4 text-red-600' />
                                     Payment failed
                                 </>
                                ) : (
                                 <>
                                 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                 Checking payment status..
                                 </>
                                ) }
                            </Button>
                          </div>
       </div>
           
          </AccordionContent>
        </AccordionItem>
       
       </Accordion>  
     )
    }</>
    )}