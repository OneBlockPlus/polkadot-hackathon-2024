
//@ts-nocheck


"use client"
import React, {useState} from 'react'

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
} from "@/components/ui/table"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import axios from 'axios'
import { useQuery } from '@tanstack/react-query'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Copy, Ellipsis } from 'lucide-react'
import { truncateText } from '@/lib/truncateTxt'
import Linkdetails from '@/components/sheet/link-details'
import { BACKEND_URL, GLOBAL_LOGO , WEBSITE_BASE_URL} from '@/constants'
import { useUserContext } from '@/components/providers/user-context'
import withAuth from '@/components/middleware/auth-middleware'
import CreatePayLink from '@/components/sheet/create-pay-link'
import LoadingState from '@/components/states/loading-state'
import ErrorsState from '@/components/states/errors-state'



const PaymentLinks = () => {
  const [copied, setcopied] = useState()
  const {userProfile}  = useUserContext()

  const PAYMENT_BASE_URL = `${BACKEND_URL}/auth/`


    const copyLink = (link, item)  => {
      navigator.clipboard.writeText(link)
      setcopied(item)
    }
   const getUserPayLinks =  async ()  =>  {
  const  res =  axios.get(`${PAYMENT_BASE_URL}user/${userProfile?.id}/payment-links`)
  return (await res).data
   }

    const {data, isError, isLoading, error}  = useQuery({
      queryKey : ['pay-link'],
      queryFn : getUserPayLinks,
    })

     console.log("user payments", data)
     console.log("user payments error", error)


         // Assuming the date is in the format "2024-08-17T05:46:24.374Z" and stored in data.date
 
     // Function to format the date
  const formatDate = (dateStr) => {
    const dateObj = new Date(dateStr);
    const formatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
    return formatter.format(dateObj);
  }

  if(isLoading){
    return(
      <LoadingState  />
    )
  }

  if(isError) {
    return(
      <ErrorsState  />
    )
  }

  return (
    <div  className='w-full px-1'>
  

<div className='flex justify-between w-full px-4 my-4'>
  <div>
   <h1 className='font-semibold text-lg'>Payment links</h1>
   <p className='text-muted-foreground font-semibold'>Create and manage your paylinks here</p>
   </div>
   <Sheet>
  <SheetTrigger asChild >
 
      <Button>Create  Paylink</Button>
 
  </SheetTrigger>
  <SheetContent  className=" sm:w-[540px] overflow-y-scroll">
    <SheetHeader  className=' border-b'>
      <SheetTitle>Payments</SheetTitle>
      <SheetDescription>
      Fill in the details to create and start accepting payments on your pay link
      </SheetDescription>
   </SheetHeader>
<CreatePayLink  />
  </SheetContent>
</Sheet>
</div>


      <div>
      <Table className='min-w-[700px]'>
      
      <TableHeader>
        <TableRow>
          <TableHead className="w-[170px] ">Created on</TableHead>
          <TableHead>Url</TableHead>
          <TableHead>Title</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-[100px] text-right">More</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.paymentLinks?.map((item, i) => (
          <TableRow key={i}    className=''>
           
            <TableCell className="font-medium text-muted-foreground">{ formatDate( item.createdAt)  }</TableCell>
           
            <TableCell className='text-sm text-muted-foreground'>
            <TooltipProvider>
  <Tooltip>
    <TooltipTrigger>
    <div className='flex items-center space-x-3' onClick={() => copyLink(`${WEBSITE_BASE_URL}payment/payment-link/${item._id}`, i)}>
              <p className={` ${copied === i && "text-blue-300"} text-sm`}> {  truncateText( `${WEBSITE_BASE_URL}payment/payment-link/${item._id}`, 10,26, 10)} </p>
              <Copy   className='text-muted-foreground w-4 h-4 cursor-pointer' onClick={() => copyLink(`${WEBSITE_BASE_URL}payment/payment-link/${item._id}`, i)} />
               </div>
    </TooltipTrigger>
    <TooltipContent>
      <div className='flex items-center space-x-2 cursor-pointer'  onClick={() => copyLink(`${WEBSITE_BASE_URL}payment/payment-link/${item._id}`, i)}>
        <Copy   className='text-muted-foreground w-4 h-4 cursor-pointer' />
        <p>{copied === i ? "Copied" : "Click to copy"}</p>
      </div>
    </TooltipContent>
  </Tooltip>
</TooltipProvider>
              
               </TableCell>
            <TableCell>
              <p className='font-medium text-muted-foreground'>
              {item.linkName}
                </p></TableCell>
            <TableCell className="text-right flex items-end justify-end"> <div className='flex text-right space-x-1 items-center font-medium text-muted-foreground'>
              <Image  src={GLOBAL_LOGO} width={70} height={70} alt='hedera logo' className='rounded-full w-4 h-4' />
              <p>{item.amount ?  `${item.amount} Tokens`  :  "Any amount"} </p>
              </div></TableCell>
            <TableCell className="text-right">
            <Sheet>
  <SheetTrigger>
    <Button variant={"outline"} size={"icon"} >
       <Ellipsis   />
    </Button>
  </SheetTrigger>
  <SheetContent  className="w-[900px] sm:w-[540px]">
    <SheetHeader  className=' border-b'>
      <SheetTitle>Payments</SheetTitle>
   </SheetHeader>
   <Linkdetails payment={item} time={ formatDate( item.createdAt) }   />
  </SheetContent>
</Sheet>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
   
    </Table>
          
        </div>   
 </div>
  )
}

export default PaymentLinks
