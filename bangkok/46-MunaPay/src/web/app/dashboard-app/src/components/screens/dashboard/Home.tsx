"use client"

import { Button } from '@/components/ui/button'
import { Link as LinkIcon , Plus } from 'lucide-react'
import Link from 'next/link'
import React from 'react'

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"
import { TopCrads } from './TopCards'
import LatestPayments from './LatestPayments'
import { useUserContext } from '@/components/providers/user-context'



 
export default function Home() {
  const {logout}  = useUserContext()
  return (
    <div  className='w-full'>
    <div>
             <TopCrads   />
           </div>

            <LatestPayments  />
    </div>
  )
}
