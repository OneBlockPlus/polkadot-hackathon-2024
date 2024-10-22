//@ts-nocheck
"use client"

import React, {useEffect, useRef} from 'react'
import { AnimatePresence, motion } from 'framer-motion';
import { Checkmark } from 'react-checkmark'
import { truncateText } from '@/lib/truncateTxt';
import { Button } from '@/components/ui/button';
import {useSendTransaction, useAccount} from "wagmi"


type  Props  =  {
    data :  any
    status :  any
}
export default function SessionSuccess({data, status} : Props) {

  console.log("status from tx result success componennt", status)
const hash = status ? status?.txHash : data?.session?.txHash
  const  openTx  =  (txHash :  any)  =>  {
      window.open(`https://moonbase.moonscan.io/tx/${txHash}`)
  }


  return (
    <div className='flex items-center justify-center  w-full py-2 px-4 rounded-xl border '>
  
       <div  className='  w-full items-center justify-center  '>
     

<div className='border-b pb-6 pt-5 flex flex-col justify-center items-center '>
<AnimatePresence>
    < motion.div  
    className='  '
    initial={{ y : 2 }}
    transition={{ease : "easeIn", duration : 2}}
    animate={{ y: -2 }}
    exit={{ opacity: 0 }}
    key={"success"}
    >
{/*<Lottie   animationData={CheckIcon} loop={false}  
   autoplay={true}
   ref={successIcon}
/>*/}

<div  className='mb-3  border border-green-300 rounded-full  flex items-center justify-center animate-pulse'>
<Checkmark size='50px'  />

</div>

</motion.div>
</AnimatePresence>
    <h1  className='text-xl leading-snug font-semibold text-center mb-2'>Payment Confirmed!</h1>
     <h2 className='text-muted-foreground text-xs text-center'>Your transaction has been securely processed</h2>
</div>

 <div className=' mt-4  p-2 border-b'>
  <div className='flex justify-between w-full my-3 items-center'>
    <h3 className='font-light '>Amount</h3>
     <h4 className='text-muted-foreground  font-mono'>{  status ? status?.amount  : data?.session?.amount}</h4>
  </div>
  
  <div className='flex justify-between w-full my-3 items-center'>
    <h3 className='font-light '>Tx hash</h3>
     <h4 className='text-muted-foreground font-mono text-sm '>{  status ? truncateText(status?.txHash, 16,8,7) : data ?  truncateText(data?.session?.txHash, 16,8,7) : "--"}</h4>
  </div>
   
 </div>

   <div>
     
     <h1 className=' text-xs text-center mt-4 text-muted-foreground hidden'>Weve  emailed your receipt to <span className='text-blue-600'>kabuguabdul2@gmail.com</span></h1>

     <div  className='flex items-center justify-between space-x-4 mt-3'>
       <Button  variant={"outline"} className='w-full'  onClick={()  => openTx(hash)}>View transaction</Button>
       <Button className='w-full' >Download reciept</Button>
     </div>
   </div>
       </div>

 
    </div>
    
  )
}
