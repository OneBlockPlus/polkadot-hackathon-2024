
//@ts-nocheck

"use client"
import React, {useState} from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Ellipsis } from 'lucide-react'
import { BACKEND_URL, GLOBAL_LOGO } from '@/constants'
import { useUserContext } from '../../providers/user-context'
import Paymentdetails from '../../sheet/payment-details'
import LoadingState from '@/components/states/loading-state'
import ErrorsState from '@/components/states/errors-state'



export default function LatestPayments() {
  const [selectedValue, setselectedValue] = useState("")
  const {userProfile}  = useUserContext()

  const PAYMENT_BASE_URL = `${BACKEND_URL}/pay/`


   const getUserPayments =  async ()  =>  {
  const  res =  axios.get(`${PAYMENT_BASE_URL}payments/${userProfile?.id}`)
  return (await res).data
   }

    const {data, isError, isLoading}  = useQuery({
      queryKey : ['payments'],
      queryFn : getUserPayments
    })

     console.log("user payments", data)

    
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
       <div className='w-full flex  items-center justify-between my-4'>
         <h1 className='font-bold text-xl'>Recent payments</h1>

         <Select onValueChange={(e)  => setselectedValue(e)}  >
  <SelectTrigger className="w-[180px]">
    <SelectValue placeholder="All type" />
  </SelectTrigger>
  <SelectContent className='border-accent'>
    <SelectItem value="one-time">One time</SelectItem>
    <SelectItem value="subscriptions">Subscptions</SelectItem>
  
  </SelectContent>
</Select>
       </div>

      <div>
      <Table>
      <TableCaption>A list of your recent payments.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px] ">Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Title</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="w-[100px] text-right">More</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.payments?.map((item, i) => (
          <TableRow key={i}    className=''>
           
            <TableCell className="font-medium text-muted-foreground">{ formatDate( item.createdAt)  }</TableCell>
           
            <TableCell> <div className='bg-green-500/25 p-0.5 rounded-lg inline-flex capitalize text-green-700 text-xs'>{item.paymentStatus}</div></TableCell>
            <TableCell>
              <p className='font-medium text-muted-foreground'>
              {item.paymentLinkId.linkName}
                </p></TableCell>
            <TableCell className="text-right"> <div className='flex space-x-1 items-center justify-end font-medium text-muted-foreground'>
              <Image  src={GLOBAL_LOGO} width={70} height={70} alt='hedera logo' className='rounded-full w-4 h-4' />
              <p>{item.amount} {item?.coin}</p>
              </div></TableCell>
            <TableCell className="text-right">
            <Sheet>
  <SheetTrigger asChild>
    <Button variant={"outline"} size={"icon"} >
       <Ellipsis   />
    </Button>
  </SheetTrigger>
  <SheetContent  className="w-[900px] sm:w-[540px]">
    <SheetHeader  className=' border-b'>
      <SheetTitle>Payments</SheetTitle>
   </SheetHeader>
   <Paymentdetails payment={item} time={ formatDate( item.createdAt) }   />
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
