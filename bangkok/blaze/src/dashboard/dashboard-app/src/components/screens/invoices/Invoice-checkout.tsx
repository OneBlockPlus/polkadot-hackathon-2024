
//@ts-nocheck

"use client"
import React, {useState, useEffect} from 'react'
import {
    useQuery,
    useMutation,
  } from '@tanstack/react-query'
  import io from 'socket.io-client';
  import { useQRCode } from 'next-qrcode'

  import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
  } from "@/components/ui/accordion"
  import { Input } from "@/components/ui/input"
  import { useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from 'next/navigation'
import { AlertCircle, CheckCheckIcon, Loader2, MessageCircleWarningIcon,  QrCode,  Wallet} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { INVOICE_ABB, GLOBAL_LOGO, WEBSITE_BASE_URL, BACKEND_URL } from '@/constants';
import { AnimatePresence, motion } from "framer-motion"
import Image from 'next/image';
import SuccessState from './success-state';
import PaidState from './paid-status';
import FailedState from './failedState';
import { useAccount , useSendTransaction} from 'wagmi';
import { ConnectButton, useConnectModal } from '@rainbow-me/rainbowkit';
import { parseEther } from 'viem';

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
export default function InvoiceCheckOut() {
    const [isCheckingOut, setisCheckingOut] = useState(false)
    const [status, setStatus] = useState()
  const {isConnected, address}  = useAccount()
  const {openConnectModal} = useConnectModal()
  const  handleTransferFund = useSendTransaction()
    const {toast}  = useToast()
const params =  useParams()
    const  router =  useRouter()
    const invoiceId = params.sessionId
  const  PAY_BASE_URL = `${BACKEND_URL}/invoice/`
   const  LOCAL_BASE_URL  = "http://localhost:5000/invoice/"
   const  OFFICIAL__BASE_URL  = "http://localhost:5000"


  const { Canvas } = useQRCode();

    console.log("invoice id", invoiceId)
        // 1. Define your form.
        const form = useForm<z.infer<typeof formSchema>>({
            resolver: zodResolver(formSchema),
            defaultValues: {
            // payerEmail : "",
             payerName :  "",
             payerAddress : "hedera",
             country  :  "",
             addressLine1  : "",
             addressLine2  : "",
             zipCode  : "",
             
            },
          })
        

              // Initialize socket only once using useEffect
  const socket = io(BACKEND_URL, { autoConnect: false });


  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      console.log(`Connected to server with ID: ${socket.id}`);
    });

    socket.on('invoiceStatus', (newStatus) => {
      console.log("The payment status:", newStatus);
       if(newStatus.invoiceId  === invoiceId){
        setisCheckingOut(false)
       }
      
      //alert("changed")
      setStatus(newStatus);
    });

    return () => {
      socket.disconnect();
    };
  }, [])

  const handleFetchSession  =   async ()  =>  {
    const res  =  await  axios.get(`${PAY_BASE_URL}get-invoice/${invoiceId}`)
     return res.data
  }

    const {data, isPending, isError, isSuccess, isLoading, error}  = useQuery({
     queryKey : ['sessionData'],
     queryFn : handleFetchSession
    })
console.log("information", data)

const RECIEVER_2 = data?.invoice?.userId?.wallet
const  AMOUNT_2 = "0.001" //data?.invoice?.subtotal

                      const  handleInitiatePayment =  async ()  =>  {
                        try {
                            const  res  =  await axios.post(`${PAY_BASE_URL}initiate-payment/${invoiceId}`)
                              console.log(res.data)
                        } catch (error) {
                          console.log("something went wrong initiating payment", error)
                        }
                      }


                  const handleMutatePay =  async (valueData) =>  {
                    const  res  = await  axios.post(`${LOCAL_BASE_URL}check-out/${invoiceId}`,  valueData)
                    return res
                  }
                  const invoicePayMutation = useMutation({
                   mutationFn : handleMutatePay,
                   mutationKey : ['sessionData']
                  })
          // 2. Define a submit handler.
          const pay  =  async ()=>{
        
            try {
              
              const txHash =  await  handleTransferFund.sendTransactionAsync({
                to : RECIEVER_2,
                value  : parseEther(AMOUNT_2)
              })
              await handleInitiatePayment()
              const valueData =  {
                    txHash,
                    senderWallet : address
               }
               await  invoicePayMutation.mutateAsync(valueData)
          
                  //await   handleSendReciept()
                } catch (error) {
               console.log("error", error)
               toast({
              variant  : "destructive",
                title : "something went wrong",
                description  : "something went wrong check your network connection and  try again",
               })
              
            }
            }
  

        // Function to format the date
  const formatDate = (dateStr) => {
    const dateObj = new Date(dateStr);
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    return formatter.format(dateObj);
  }
        
  
   /* if(error){
      return(
        <div className='w-full h-screen flex items-center justify-center'>

          <p className='font-semibold text-center'>Something went wrong please check your connection and reload</p>
          <p className='text-muted-foreground text-center'>Or reach out to our customer suport</p>
        </div>
      )
    }*/

   /* if(isLoading){
      return(
        <div className='w-full h-screen flex items-center justify-center'>

         <Loader

className='w-24 h-24 text-indigo-500 animate-spin'
/>
        </div>
      )
    }*/
   const  getPaymentState =  ()  =>  {

                if(data?.invoice.status === "paid"   ){

                  return(
                   <PaidState  data={data}  status={status} />
                  )

                }else
                if( ! status  &&  data?.invoice.status !== "paid"     ){
                  return(
                <>
                    <div  className='flex  justify-between items-center  my-6 mb-6'>
                       <h1  className='font-semibold  text-sm lg:text-xl'>  Pay with</h1>
                         </div>
                    <div className='border p-3 rounded-xl'>
                  <div className='flex items-center space-x-2 my-4 mb-6 '>
                     <Wallet className='w-5 h-5'  />
                     <p className=''>Wallet</p>
                  </div>
                   {! isConnected  ?  (
                  <Button className='w-full' onClick={openConnectModal}>Connect wallet</Button>
                   ) : (
                    <Button  onClick={pay} className={`w-full capitalize `} disabled={invoicePayMutation.isPending || handleTransferFund.isPending}>{data?.reciever?.labelText ? `${data?.reciever?.labelText} Now` : invoicePayMutation.isPending ? "Proccessing payment" :  handleTransferFund.isPending ? "Sending..." : "Continue to pay"}</Button>  

                   )}
                   </div>
                  
                    <Accordion type="single" collapsible className="w-full my-4">
                 
                    <AccordionItem value="item-2" className='my-3 border px-2 rounded-xl'>
                      <AccordionTrigger>
                         <div  className='flex items-center space-x-2'><QrCode className='w-5 h-5'  />
                         <p>Scan QR  code</p>
                          </div>
                      </AccordionTrigger>
                      <AccordionContent className='flex  items-center justify-center  '>
                         <div  className='my-4  flex  items-center justify-center  flex-col'>
                             <div  className=' bg-slate-100 rounded-xl p-2'>
                      <Canvas
                       text={`${WEBSITE_BASE_URL}invoices/checkout-session/${invoiceId}`}
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
                          <h1  className='font-medium text-sm   mb-1'>{`Send ${data?.invoice?.paymentToken}  on Dev network network`}</h1>
                           <div className='flex items-center  space-x-1'>
                              <MessageCircleWarningIcon  className='w-3 h-3 text-muted-foreground'  />
                               <p  className='text-xs  text-muted-foreground'>Sending funds on the wrong network or token leads to fund loss.</p>
                           </div>
                       </div>
                       <Button disabled ={isCheckingOut || ! status}  className='w-full ' variant={"outline"}>
                       
                      { status &&  status.status  === "COMPLETED"  && status.invoiceId === invoiceId ?  (
                        <>
                        <CheckCheckIcon className="mr-2 h-4 w-4" />
                         Payment made succfully
                         </>
                         )  : status &&  status.status  === "FAILED"  && status.invoiceId === invoiceId? (
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
                   
                       </>
                
                  
                  )
                   
                }  else if(status &&  status.status  === "COMPLETED"  && status.invoiceId === invoiceId /*testTruth*/ ){
     return(
      <SuccessState data={data} status={status} />
     )
                }else if(status &&  status.status  === "FAILED"  && status.invoiceId === invoiceId  /*! testTruth*/ ){
                  return(
                    <FailedState  />
                   )

                }else if( status &&  status.status  === "PENDING"   /*! testTruth*/){
                  return(
                    <AnimatePresence>
                    < motion.div  
                    className='flex items-center justify-center  w-full p-5 rounded-xl border  '
                    initial={{ y : 3 }}
                    transition={{ease : "easeIn", duration : 1}}
                    animate={{ y: -3 }}
                    exit={{ opacity: 0 }}
                    key={"pending"}
                    >
                       <div  className='  w-full items-center justify-center  '>
                     
              
                <div className=' pb-6 pt-5 flex flex-col justify-center items-center '>
                <Loader2  className='w-16 h-16 mb-4  animate-spin' />
                    <h1  className='text-xl leading-snug font-semibold text-center'>Processing Your Payment </h1>
                     <h2 className='text-muted-foreground text-sm text-center'></h2>
                </div>
              
                       </div>
              
                    </motion.div>
                    </AnimatePresence>
                  )
                }
              }


             
            
  return (
    <div className=' max-w-5xl mx-auto    my-4 h-screen'>

    {isConnected  &&  (
      <div className='absolute right-2 mb-4'> 
  <ConnectButton chainStatus={"none"} />

      </div>
    )}
        <div  className='flex flex-col md:flex-row lg:space-x-1 '>
          <div  className='flex-1 w-full md:min-h-screen bg-zinc-50 items-center justify-center relative   p-6  '>
        
               <div  className='my-8'>
                <div className='flex space-x-8'>
                   <p className='text-sm text-muted-foreground'>Invoice</p>
                    <div className='border text-blue-500 text-sm'>{INVOICE_ABB}{data?.invoice?.invoiceNumber}</div>
                </div>
                <div className='flex space-x-2 my-3 py-3  border-y justify-between'>
                   <Image  src={GLOBAL_LOGO} width={100} height={100} alt='currency logo' className='w-8 h-8 rounded-full hidden' />
                   <p className='font-medium '>Subtotal</p>
                   <p className='font-medium '> {data?.invoice?.subtotal} {data?.invoice?.paymentToken}</p>
                </div>
                <div className='flex items-center space-x-4 justify-between'>
                   <p className='font-medium'>Due date</p>
               <p className='text-xs text text-muted-foreground'>     {data?.invoice?.dueDate}</p>
                    
                </div>
               </div>

                 <div  className='my-5  h-[1.5px]  bg-muted'></div>

                  <div  className=''>
                   <div className='flex items-center justify-between w-full pb-3 mb-3 '>
                     <p className='text-sm text-muted-foreground'>To</p>
                     <p className='text-sm text-muted-foreground'>{data?.invoice?.customer?.customerName}</p>
                   </div>
                   <div className='flex items-center justify-between w-full pb-3 mb-3 border-b'>
                     <p className='text-sm text-muted-foreground'>From</p>
                     <p className='text-sm text-muted-foreground'>{data?.invoice?.userId?.businessName  ||  data?.invoice?.userId?.firstName}</p>
                   </div>

                   
  
                  </div>
  <div  className='absolute bottom-14 w-full hidden lg:flex'>
                     <p className='text-sm text-muted-foreground'>Powered by Munapay</p>

                   </div>

         </div>
          <div  className='flex-1   md:h-screen    p-6  '>
            {getPaymentState()}
          </div>
         
          </div>

  

    </div>
  )
}
