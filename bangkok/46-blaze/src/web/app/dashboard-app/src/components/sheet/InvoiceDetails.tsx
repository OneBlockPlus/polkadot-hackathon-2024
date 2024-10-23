

//@ts-nocheck
import axios from 'axios'
import { BadgeInfo, Calendar, DollarSign, Link, LocateIcon, Mail, MapIcon, Send, TimerIcon, User } from 'lucide-react'
import React from 'react'
import { Separator } from '../ui/separator'
import Image from 'next/image'
import { GLOBAL_LOGO } from '@/constants'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from '../ui/button'
import { truncateText } from '@/lib/truncateTxt'

 type Props = {
    payment  :  any
    time : any
    dueDate : any 
 }
export default function InvoiceDetails({payment,time, dueDate} :Props) {
  return (
    <div  className='my-3'>
         <div className='text-muted-foreground my-5'>
         <div  className='  flex items-center justify-between my-4'>
                <div className='flex items-center space-x-2 font-medium '>
                 <DollarSign className='w-4 h-4'   />
                 <p className='text-sm'>Amount</p>
                 </div>
                  <div className='flex items-center space-x-2'>
                    <Image src={GLOBAL_LOGO} width={100} height={100} alt='currency logo' className='w-4 h-4 rounded-full'  />
                    <p className='text-xs'>{payment?.totalAmount} {payment?.paymentToken}</p>
                  </div>
                  
             </div>
             <div  className='  flex items-center justify-between my-4'>
                <div className='flex items-center space-x-2 font-medium '>
                 <BadgeInfo className='w-4 h-4'   />
                 <p className='text-sm'>Status</p>
                 </div>
                  <div>
                    <p className='text-xs'>{payment?.status}</p>
                  </div>
                  
             </div>

             <div  className='  flex items-center justify-between my-4'>
                <div className='flex items-center space-x-2 font-medium '>
                 <TimerIcon className='w-4 h-4'   />
                 <p className='text-sm'>Timestamp</p>
                 </div>
                  <div>
                    <p className='text-xs'>{time}</p>
                  </div>
                  
             </div>
             <div  className='  flex items-center justify-between my-4'>
                <div className='flex items-center space-x-2 font-medium '>
                 <TimerIcon className='w-4 h-4'   />
                 <p className='text-sm'>Due date</p>
                 </div>
                  <div>
                    <p className='text-xs'>{dueDate}</p>
                  </div>
                  
             </div>

             <div  className='  flex items-center justify-between my-4'>
                <div className='flex items-center space-x-2 font-medium  '>
                 <Link className='w-3.5 h-3.5'   />
                 <p className='text-sm'>Invoice Id</p>
                 </div>
                  <div>
                    <p className='text-xs'>{payment?.invoiceNumber}</p>
                  </div>
                  
             </div>

             <div  className='  flex items-center justify-between my-4'>
                <div className='flex items-center space-x-2 font-medium  '>
                 <Link className='w-3.5 h-3.5'   />
                 <p className='text-sm'>Invoice type</p>
                 </div>
                  <div>
                    <p className='text-xs'>one time</p>
                  </div>
                  
             </div>
         </div>

<Separator  />

<div className='text-muted-foreground my-5'>
  <h1 className='font-medium my-3'>Billed to </h1>
         <div  className='  flex items-center justify-between my-4'>
                <div className='flex items-center space-x-2 font-medium '>
                 <Mail className='w-3.5 h-3.5'   />
                 <p className='text-sm'>Email</p>
                 </div>
                  <div className='flex items-center space-x-2'>
                  
                    <p className='text-xs'>{truncateText(payment?.customer?.customerEmail, 10, 10)}</p>
                  </div>
                  
             </div>
             <div  className='  flex items-center justify-between my-4'>
                <div className='flex items-center space-x-2 font-medium '>
                 <User className='w-4 h-4'   />
                 <p className='text-sm'>Name</p>
                 </div>
                  <div>
                    <p className='text-xs'>{payment?.customer?.customerName}</p>
                  </div>
                  
             </div>

             <div  className='  flex items-center justify-between my-4'>
                <div className='flex items-center space-x-2 font-medium '>
                 <LocateIcon className='w-4 h-4'   />
                 <p className='text-sm'>Country</p>
                 </div>
                  <div>
                    <p className='text-xs'>{payment?.customer?.customerCountry}</p>
                  </div>
                  
             </div>
          
         </div>

         <Separator  />
         
         <div className='text-muted-foreground my-5'>
  <h1 className='font-medium my-3'>Summary </h1>
         <div  className='  flex items-center justify-between my-4'>
                <div className='flex items-center space-x-2 font-medium '>
                 <Mail className='w-3.5 h-3.5'   />
                 <p className='text-sm'>Item</p>
                 </div>
                  <div className='flex items-center space-x-2'>
                  
                    <p className='text-xs'>{truncateText(payment?.items[0]?.description, 10, 10)}</p>
                  </div>
                  
             </div>
             <div  className='  flex items-center justify-between my-4'>
                <div className='flex items-center space-x-2 font-medium '>
                 <DollarSign className='w-4 h-4'   />
                 <p className='text-sm'>Price</p>
                 </div>
                  <div>
                    <p className='text-xs'>{payment?.items[0]?.price}</p>
                  </div>
                  
             </div>

             <div  className='  flex items-center justify-between my-4'>
                <div className='flex items-center space-x-2 font-medium '>
                 <DollarSign className='w-4 h-4'   />
                 <p className='text-sm'>Quantity</p>
                 </div>
                  <div>
                    <p className='text-xs'>{payment?.items[0]?.quantity}</p>
                  </div>
                  
             </div>

             <div  className='  flex items-center justify-between my-4'>
                <div className='flex items-center space-x-2 font-medium '>
                 <DollarSign className='w-4 h-4'   />
                 <p className='text-sm'>Subtotal</p>
                 </div>
                  <div>
                    <p className='text-xs'>{payment?.subtotal}</p>
                  </div>
                  
             </div>

           
          
         </div>

         <Separator   />

         <div className='text-muted-foreground my-5'>
  <h1 className='font-medium my-3'>Actions </h1>

  <div className='flex justify-between items-center'>
    <h1>Send reminder</h1>

  <Dialog>
  <DialogTrigger>
    <Button>
      <Calendar className='w-3.5 h-3.5 mr-2' />
      send 
    </Button>
  </DialogTrigger>
  <DialogContent className='w-[400px]'>
    <DialogHeader className='mb-4 pb-5 border-b'>
      <DialogTitle>Send invoice</DialogTitle>
     
    </DialogHeader>

     <div>
      <h1 className='my-3 font-medium text-muted-foreground'>{`send invoice for `}</h1>
       <p className='font-semibold'>{`${payment.subtotal} ${payment?.paymentToken}  to ${payment?.customer?.customerName}`}</p>
       <p className='my-4 text-sm text-muted-foreground'>{`Invoice can't be edited once they're sent. `}</p>
       <div className='flex items-end justify-end'>
        <Button>
          <Send  className='w-3.5 h-3.5 mr-2' />
          Send</Button>

       </div>
     </div>
  </DialogContent>
</Dialog>

  </div>


           
          
         </div>

    

  {/*  hide  checkout information  until we  implement the checkout logic*/}

           {/*

         <div className='text-muted-foreground my-6'>
            

           <h1 className='font-semibold text-card-foreground'>Transaction details</h1>
         <div  className='  flex items-center justify-between my-4'>
                <div className='flex items-center space-x-2 font-medium '>
               
                 <p className='text-sm'>Transaction Id</p>
                 </div>
                  <div className='flex items-center space-x-2'>
                    <p className='text-xs'>{truncateText(payment?.sessionId, 20)}</p>
                  </div>
                  
             </div>
             <div  className='  flex items-center justify-between my-4'>
                <div className='flex items-center space-x-2 font-medium '>
                 
                 <p className='text-sm'>Network</p>
                 </div>
                  <div>
                    <p className='text-xs'>Hedera</p>
                  </div>
                  
             </div>

             <div  className='  flex items-center justify-between my-4'>
                <div className='flex items-center space-x-2 font-medium '>
                
                 <p className='text-sm'>Transaction Hash</p>
                 </div>
                  <div>
                    <p className='text-xs'>{truncateText(payment.txHash, 20)}</p>
                  </div>
                  
             </div>

             <div  className='  flex items-center justify-between my-4'>
                <div className='flex items-center space-x-2 font-medium  '>
                 <p className='text-sm'>Fee </p>
                 </div>
                  <div>
                    <p className='text-xs'>0</p>
                  </div>
                  
             </div>
         </div>
         <Separator   />
         <div className='text-muted-foreground my-6'>

<h1 className='font-semibold text-card-foreground'>Checkout session details</h1>
<div  className='  flex items-center justify-between my-4'>
     <div className='flex items-center space-x-2 font-medium '>
    
      <p className='text-sm'>Type</p>
      </div>
       <div className='flex items-center space-x-2'>
         <p className='text-xs'>one time</p>
       </div>
       
  </div>
  <div  className='  flex items-center justify-between my-4'>
     <div className='flex items-center space-x-2 font-medium '>
      
      <p className='text-sm'>Title</p>
      </div>
       <div>
         <p className='text-xs'>{truncateText(payment.paymentLinkId.linkName, 20)}</p>
       </div>
       
  </div>

  <div  className='  flex items-center justify-between my-4'>
     <div className='flex items-center space-x-2 font-medium '>
     
      <p className='text-sm'>Description</p>
      </div>
       <div>
         <p className='text-xs'>{truncateText(payment.paymentLinkId.description, 20)}</p>
       </div>
       
  </div>

  <div  className='  flex items-center justify-between my-4'>
     <div className='flex items-center space-x-2 font-medium  '>
      <p className='text-sm'>Collect email</p>
      </div>
       <div>
         <p className='text-xs'>{payment.paymentLinkId.collectEmail  ?  "Yes" : "No"}</p>
       </div>
       
  </div>
  <div  className='  flex items-center justify-between my-4'>
     <div className='flex items-center space-x-2 font-medium  '>
      <p className='text-sm'>Collect name</p>
      </div>
       <div>
         <p className='text-xs'>{payment.paymentLinkId.collectName  ?  "Yes" : "No"}</p>
       </div>
       
  </div>
  <div  className='  flex items-center justify-between my-4'>
     <div className='flex items-center space-x-2 font-medium  '>
      <p className='text-sm'>Collect address</p>
      </div>
       <div>
         <p className='text-xs'>{payment.paymentLinkId.collectAddress  ?  "Yes" : "No"}</p>
       </div>
       
  </div>
</div>*/}


    
    </div>
  )
}
