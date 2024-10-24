
//@ts-nocheck
"use client"
import React, {useState, useEffect} from 'react'
import {
    useQuery,
  } from '@tanstack/react-query'
  import io from 'socket.io-client';

import { z } from "zod"
import axios from 'axios'
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from 'next/navigation'
import {  Loader, Loader2, MoveLeft, } from 'lucide-react'
import { AnimatePresence, motion } from "framer-motion"
import Image from 'next/image';
import SessionSuccess from './session-seccess';
import FailedState from '../screens/invoices/failedState';
import { useForm} from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  useConnectModal,
} from '@rainbow-me/rainbowkit';
import CheckouSessionPayState from './checkout-pay-state';
import { usePinToIpfs } from '../hooks/usePinToIpfs';
import { useAccount } from 'wagmi';
import { BACKEND_URL } from '@/constants';
import LoadingState from '../states/loading-state';
import ErrorsState from '../states/errors-state';


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


export default function CheckOut() {
  const { openConnectModal } = useConnectModal();
    const [status, setStatus] = useState();
    const [isCheckingOut, setisCheckingOut] = useState(false)

   
const params =  useParams()
    const sessionId = params.sessionId
  const  PAY_BASE_URL = `${BACKEND_URL}/pay/`
   const  LOCAL_BASE_URL  = "http://localhost:5000/pay/"
   const  OFFICIAL__BASE_URL  = "http://localhost:5000"
const {isConnected, address}  = useAccount()

 
              // Initialize socket only once using useEffect
  const socket = io(BACKEND_URL, { autoConnect: false });


  useEffect(() => {
    socket.connect();

    socket.on('connect', () => {
      console.log(`Connected to server with ID: ${socket.id}`);
    });

    socket.on('paymentStatus', (newStatus) => {
      console.log("The payment status:", newStatus);
       if(newStatus.sessionId  === sessionId){
        setisCheckingOut(false)
       }
      
      //alert("changed")
      setStatus(newStatus);
    });

    return () => {
      socket.disconnect();
    };
  }, [])

console.log("status", status)


  
 // 1. Define your form.
/* const form = useForm<z.infer<typeof formSchema>>({
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
   })*/

   const handleFetchSession  =   async ()  =>  {
    const res  =  await  axios.get(`${PAY_BASE_URL}checkout-session/${sessionId}`)
     return res.data
  }
 const {data, isPending, isError, isSuccess, isLoading, error}  = useQuery({
     queryKey : ['sessionData'],
     queryFn : handleFetchSession
    })

    if(isLoading){
      return(
         <LoadingState  />
      )
    }

    if(isError){
      return(
        <ErrorsState  />
      )
    }
     
    const  SESSION_EXP_TIME =  data?.session?.durationTime

    useEffect(() => {
      if (window !== undefined && data?.session?.successUrl && status?.status === "COMPLETED") {
        const successUrl = data?.session?.successUrl;
     try {
          // Validate if it's a valid URL and ensure it starts with https
          const url = new URL(successUrl);
          if (url  /*.protocol === 'https:'*/) {
            window.location.href = successUrl; // Redirect only if it's a valid HTTPS URL
          } else {
            console.error("Invalid redirect URL: Must be an HTTPS URL.");
          }
        } catch (error) {
          console.error("Invalid URL:", error?.message); // Handle invalid URL format
        }
      }
    }, [status]);
    
    const handleCancel = async ()  =>  {
       const  cancelUrl = data?.session?.cancelUrl
       window.location.href =  cancelUrl;
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

              const  getPaymentState =  ()  =>  {
                if(data?.session?.paymentStatus   === "completed"){
   return(
    <SessionSuccess data={data} status={status}  />
   )
                }
                if(!status    && data?.session?.paymentStatus  !== "completed" /* !testTruth  */  ){
                  return(
                 <CheckouSessionPayState     data={data} status={status} SESSION_EXP_TIME={SESSION_EXP_TIME}  isCheckingOut={isCheckingOut} setisCheckingOut={setisCheckingOut}  />
              
                  )
                   
                }  else if(status &&  status.status  === "COMPLETED"  && status.sessionId === sessionId /*testTruth */){
     return(
     <SessionSuccess   data={data} status={status}    />
     )
                }else if(status &&  status.status  === "FAILED"  && status.sessionId === sessionId ){
                  return(
                   <FailedState  />
                   )

                }else if( status &&  status.status  === "PENDING"  && status.sessionId === sessionId  /*! testTruth */){
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
                <Loader2  className='w-16 h-16 mb-3 animate-spin' />
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

    <div className=' max-w-5xl mx-auto    my-4 min-h-screen  '>
    {/*} <OnChainDtaNav walletAddress={userMetadata?.publicAddress} balance={formattedBalance1} />*/}

        <div  className='flex flex-col md:flex-row lg:space-x-1 '>
          <div  className='flex-1 w-full md:min-h-screen bg-zinc-50 items-center justify-center relative border-r border-zinc-100   p-6  '>
        
               <div  className='my-5'>
                <div className='flex items-center space-x-1'>
                   <Button size={"icon"}  variant={"ghost"} onClick={handleCancel}>
                    <MoveLeft className='w-4 h-4 text-muted-foreground' />
                   </Button>

                   <div className='w-7 h-7 flex items-center justify-center border border-yellow-300 bg-purple-500 rounded-full'>P</div>
                    <p className='text-sm'>{data?.session?.merchantBusinessName || data?.session.merchantFirstName }</p>
                </div>
               </div>

                 <div  className='my-5  h-[1.5px]  bg-muted'></div>

                  <div className='my-4'>
                    {data?.session?.items.map((item, i)  =>  (
                      <div key={i} className='flex justify-between items-center my-3'> 
                      <div className='flex items-center space-x-2'>
                      <div className='w-16 h-16 border rounded-md flex items-center justify-center p-1'>
                        <Image src={item?.image} width={100} height={100} alt='image' className='w-14 h-14 object-cover rounded-md'  />
                         </div>
                      <div>
                      <p className='text-sm'>{item?.name}</p>
                      </div>
                      </div>
                      <div>
                      <p className='text-sm'> <span className=''>$</span>{item?.price}</p>
                      </div>
                      </div>
                    ))}
                  </div>

                  <div className='my-t md:mt-7'>
                    <div className='flex items-center justify-between my-3'>
                       <p className=''>Subtotal</p>
                       <div>
                        <p>  <span className='text-xl font-serif'>$</span>{data?.session.totalPrice}</p>
                        </div>
                    </div>

                    <div className='flex items-center justify-between my-3'>
                       <p className=''>Shipping Fee</p>
                       <div>
                        <p> <span className='text-xl font-serif'>$</span>{data?.session.shippingFee || "0"}</p>
                        </div>
                    </div>

                    <div className='flex items-center justify-between my-3'>
                       <p className='font-semibold'>Total</p>
                       <div>
                        <p> <span className='text-xl font-serif'>$</span>{data?.session.totalPrice}</p>
                        </div>
                    </div>
                  </div>


  {/*REMOVED PRODUC IMAGE  
                  <div className='my-5  flex items-center justify-center lg:justify-start lg:items-start'>
                     <Image     src={`/img/messi.png`}  width={300} height={300} alt='product image' className='border w-56 h-52 md:w-72 md:h-80 object-cover'  />
                  </div>
*/}
                   <div  className='absolute bottom-14 w-full hidden lg:flex'>
                   <p className='text-sm text-muted-foreground'>Powered by Munapay</p>

                  
  </div>

         </div>
          <div  className='flex-1   md:h-screen    p-6  '>
          {getPaymentState()}
          </div>
             </div>    </div>           
        )}

  

  
