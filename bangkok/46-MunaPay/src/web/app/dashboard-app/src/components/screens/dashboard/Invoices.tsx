
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
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
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
import { Ellipsis, Plus } from 'lucide-react'
import Paymentdetails from '@/components/sheet/payment-details'
import InvoiceDetails from '@/components/sheet/InvoiceDetails'
import Link from 'next/link'
import { BACKEND_URL, GLOBAL_LOGO , INVOICE_ABB} from '@/constants'
import { useUserContext } from '@/components/providers/user-context'
import CreateInvoice from '../invoices/Create'
import ErrorsState from '@/components/states/errors-state'
import LoadingState from '@/components/states/loading-state'


export default function Invoices() {
  const [selectedValue, setselectedValue] = useState("")
  const {userProfile}  = useUserContext()
  const INVOICES_LOCAL_BASE_URL = "http://localhost:5000/invoice/"



   const getUserInvoices =  async ()  =>  {
  const  res =  axios.get(`${BACKEND_URL}/invoice/${userProfile?.id}/invoices`)
  return (await res).data
   }

    const {data, isError, isLoading}  = useQuery({
      queryKey : ['invoices'],
      queryFn : getUserInvoices
    })

  
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
         <h1 className='font-bold text-xl'>Invoices</h1>

         <Sheet>
  <SheetTrigger asChild >
 
      <Button>Create Invoice</Button>
 
  </SheetTrigger >
  <SheetContent  className=" sm:w-[640px] overflow-y-scroll">
    <SheetHeader  className=' border-b'>
      <SheetTitle>Create invoice</SheetTitle>
      <SheetDescription>
      Fill in the details to create and start accepting payments on your pay link
      </SheetDescription>
   </SheetHeader>
<CreateInvoice  />
  </SheetContent>
</Sheet>
       </div>

      <div>
      <Table>
      <TableCaption>A list of your invoices.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px] ">Date</TableHead>
          <TableHead  className='text-left '>Amount</TableHead>
          <TableHead>Invoice Number</TableHead>
          <TableHead className="text-left">Customer</TableHead>
          <TableHead className="w-[100px] text-left">Due</TableHead>
          <TableHead className="">Status</TableHead>
          <TableHead className="w-[100px] text-right">More</TableHead>


        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.map((item, i) => (
          <TableRow key={i}    className=''>
           
            <TableCell className="font-medium text-muted-foreground">{ formatDate( item.createdAt)  }</TableCell>
            <TableCell className="text-left  items-start"> <div className='flex space-x-2 items-center justify-start font-medium text-muted-foreground'>
              <Image  src={GLOBAL_LOGO} width={70} height={70} alt='hedera logo' className='rounded-full w-4 h-4' />
              <p>{item.subtotal} {item?.paymentToken}</p>
              </div></TableCell>
              <TableCell> {` ${INVOICE_ABB}${item.invoiceNumber}`}</TableCell>

              <TableCell> {` ${item?.customer?.customerEmail}`}</TableCell>
              <TableCell className="font-medium text-muted-foreground">{ formatDate( item.dueDate)  }</TableCell>

            <TableCell> <div className='bg-green-500/25 p-0.5 rounded-lg inline-flex capitalize text-green-700 text-xs'>{item.status}</div></TableCell>
           
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
   <InvoiceDetails payment={item} time={ formatDate( item.createdAt) }  dueDate={formatDate(item?.dueDate)}   />
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
