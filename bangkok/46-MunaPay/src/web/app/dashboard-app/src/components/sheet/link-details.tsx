//@ts-nocheck

import axios from 'axios'
import { BadgeInfo, DollarSign, Link, TimerIcon } from 'lucide-react'
import React from 'react'
import { Separator } from '../ui/separator'
import Image from 'next/image'
import { HEDERA_LOGO_URL } from '@/utils/constants'
import { truncateText } from '@/lib/truncateTxt'


 type Props = {
    payment  :  any
    time : any
 }
export default function Linkdetails({payment,time} :Props) {
  return (
    <div  className='my-3'>
        <h1>{payment?.linkName}</h1>

    
    </div>
  )
}
