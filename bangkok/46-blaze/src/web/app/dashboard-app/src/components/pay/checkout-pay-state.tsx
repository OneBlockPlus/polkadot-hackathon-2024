
//@ts-nocheck
import { useMutation , useQuery} from '@tanstack/react-query'
import { useQRCode } from 'next-qrcode'
import { useParams } from 'next/navigation'
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
  import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
  import { Input } from "@/components/ui/input"
  import { useForm } from "react-hook-form"
  import { zodResolver } from "@hookform/resolvers/zod"
  import { useAccount, useSendTransaction } from 'wagmi'
import { z } from "zod"
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCheckIcon, CircleCheckBig, Loader, Loader2, LoaderPinwheel, Mail, MessageCircleWarningIcon, Phone, QrCode, TimerIcon, User2Icon, UserRound, Wallet, X } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { WEBSITE_BASE_URL } from '@/constants'
import React from 'react'
import CountdownTimer from '@/components/CountDown'
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit'
import { parseEther } from 'viem'

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

type Props  = {
    data : any
    SESSION_EXP_TIME : any
    status : any
    isCheckingOut : any
    setisCheckingOut :  any

}
export default function CheckouSessionPayState({data, SESSION_EXP_TIME, status} : Props) {
   const {connectModalOpen, openConnectModal} = useConnectModal()
   const {isConnected, address} = useAccount()
    const params =  useParams()
    const sessionId = params.sessionId
  const  PAY_BASE_URL = `https://got-be.onrender.com/pay/`
   const  LOCAL_BASE_URL  = "http://localhost:5000/pay/"
   const  OFFICIAL__BASE_URL  = "http://localhost:5000"
   const {toast}  = useToast()
   const transferFunds = useSendTransaction()
   

     console.log("expiration time", SESSION_EXP_TIME)
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

   const handleFetchCountries  =   async ()  =>  {
    const res  =  await  axios.get(`https://restcountries.com/v3.1/all?fields=name,flags`)
     return res.data
  }

  const {data : countries, isError : isCountriesError, isSuccess : isCountriesSuccess, isLoading : isCountriesLOading, error : countriesErro}  = useQuery({
    queryKey : ['countries'],
    queryFn : handleFetchCountries
   })

   const RECIEVER_2 = data?.session?.merchantWallet
   const  AMOUNT_2 = "0.001"   //data?.session?.totalPrice

   const handleTransfer2 =  async ()  =>  {
     const res = await  transferFunds.sendTransactionAsync({
      to : "0x345fdA96178147bF5E8cdFbfBDF723d15f2973C3",
      value : parseEther("0.001")
    })
   console.log("sending tokens", res)

   }



     // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof formSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values)
  }

      const values =  form.watch() 

       const handlePay1 =  async ()  =>  {
        console.log("the reciever", RECIEVER_2)
         const txHash =  await  transferFunds.sendTransactionAsync({
          to : RECIEVER_2,
           value : parseEther(AMOUNT_2)
         })
         const txHash2 = "0x24e9ca3d5e592fcbd054397d165253a9bd78580ff2fb944eabf1c0f01721950e"
          console.log("transaction hash", txHash)
         const valueData  = {
            payerEmail : values.payerEmail,
            payerName : values.payerName,
            payerWallet : address,
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
         const  res  = await  axios.post(`${LOCAL_BASE_URL}checkout-session/${sessionId}`,  valueData)
         return res
       }
  
   const  mutation  = useMutation({
    mutationFn : handlePay1,
    mutationKey : ["pay"]
   })


     // Disabled logic
  const isButtonDisabled = 
  (data?.reciever?.collectEmail && !values.payerEmail) ||
  (data?.reciever?.collectName && !values.payerName) ||
  (data?.reciever?.collectAddress && 
    (!values.addressLine1 || !values.addressLine2));

     console.log("mutation status", mutation.status)

     console.log("shit values", data)
   const { Canvas } = useQRCode();
    const getChckeouView = ()  =>  {
        if( data?.session.collectShippingAddress ){
                return(
                    <>
                  
                    <h1 className='  font-semibold text-sm my-2  '>Contact  information</h1>
                    
                    <div> 
                           
                           <Form {...form}>
                        <form   onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    
                    <div className='flex flex-col space-y-2'>
                        {  data?.session?.collectName  &&
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
                                            <User2Icon className='w-4 h-4' />
                                       <Input className='h-7' type='text' placeholder="name" {...field}  />
                                       </div>
                                     </FormControl>
                                     <FormMessage />
                                   </FormItem>      )}/> 
                    
                                   
                       
                                 }
                       
                       {  data?.session?.collectEmail &&
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
                                     <Mail className='w-4 h-4' />
                                       <Input className='h-7' type='email' placeholder="example@gmail.com" {...field}  />
                                       </div>
                                     </FormControl>
                                     <FormMessage />
                                   </FormItem>      )}/> 
                       
                                 }
                                 </div>
                       
                       {  data?.session?.collectAddress  &&
                              
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
                                       {! isConnected  ?  (
                                      <Button className='w-full' type='button' onClick={openConnectModal}>Connect wallet</Button>
                                       ) : (
                                        <Button disabled={
                                 isButtonDisabled || mutation.isPending 
                                        }  
                                        onClick={() => mutation.mutateAsync()}  
                                        className={`w-full capitalize `} >{data?.reciever?.labelText ? `${data?.reciever?.labelText} Now` : mutation.isPending ? "Loading..." : "Pay now"}</Button>  
                                     

                    
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
                                             src: 'https://pbs.twimg.com/profile_images/1792601935737966592/EK42ujXH_400x400.jpg',
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
                                              <h1  className='font-medium text-sm   mb-1'>{`Send ${data?.session?.totalPrice} dev token on ${data?.session.network} network`}</h1>
                                               <div className='flex items-center  space-x-1'>
                                                  <MessageCircleWarningIcon  className='w-3 h-3 text-muted-foreground'  />
                                                   <p  className='text-xs  text-muted-foreground'>Sending funds on the wrong network or token leads to fund loss.</p>
                                               </div>
                                           </div>
                                           <Button disabled ={! status}  className='w-full ' variant={"outline"}>
                                           
                                          { status &&  status.status  === "COMPLETED"  && status.invoiceId === sessionId ?  (
                                            <>
                                            <CheckCheckIcon className="mr-2 h-4 w-4" />
                                             Payment made succecfully
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
                    <ConnectButton   />
                    <Button type='button' onClick={() =>  handleTransfer2()}>Test sender</Button>
                        </form>
                    
                    </Form>
                    </div>
                        </>
                )
            }else {
              return(
                <Accordion type="single" collapsible className="w-full">
 
        <div className='border p-3 rounded-xl'>
       
                         <div className='flex items-center space-x-2  mt-0 mb-6 '>
                            <Wallet className='w-5 h-5'  />
                            <p className=''>Wallet</p>
                         </div>
                          {! isConnected  ?  (
                         <Button className='w-full' onClick={ openConnectModal}>Connect wallet</Button>
                          ) : (
                           <Button type='button' onClick={()  => mutation.mutateAsync()} className={`w-full capitalize `} >{data?.reciever?.labelText ? `${data?.reciever?.labelText} Now` : "continue to pay"}</Button>  
       
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
                              text={`${WEBSITE_BASE_URL}pay/checkout-session/${sessionId}`}
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
                                src: 'https://pbs.twimg.com/profile_images/1792601935737966592/EK42ujXH_400x400.jpg',
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
                                 <h1  className='font-medium text-sm   mb-1'>{`Send ${data?.session?.totalPrice} dev token on ${data?.session.network} network`}</h1>
                                  <div className='flex items-center  space-x-1'>
                                     <MessageCircleWarningIcon  className='w-3 h-3 text-muted-foreground'  />
                                      <p  className='text-xs  text-muted-foreground'>Sending funds on the wrong network or token leads to fund loss.</p>
                                  </div>
                              </div>
                              <Button disabled ={ ! status}  className='w-full ' variant={"outline"} type='button'>
                              
                             { status &&  status.status  === "COMPLETED"  && status.invoiceId === sessionId ?  (
                               <>
                               <CheckCheckIcon className="mr-2 h-4 w-4" />
                                Payment made succecfully
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
            )}
    }
  return (
    <div>
                <div  className='flex  justify-between items-center  my-4 mb-6'>
    <h1  className='font-semibold  text-sm lg:text-xl'>{data?.reciever?.collectEmail ||  data?.reciever?.collectAddress ||  data?.reciever?.collectName  ?  "Fill  in the  details"   :  "Pay with"}</h1>
       <CountdownTimer   expTime={SESSION_EXP_TIME}  />
    </div>

      {getChckeouView()}
    </div>
  )
}
