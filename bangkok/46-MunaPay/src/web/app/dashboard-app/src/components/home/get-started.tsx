"use client"

import React, {useState} from 'react'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Input } from '@/components/ui/input'
export default function GetStarted() {
  const [email, setemail] = useState("")
  return (
    
         <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="w-full border  max-w-4xl mx-auto p-6 rounded-xl flex flex-col my-9 items-center space-y-2 justify-center "
        id='waitlist'
      >
         <h1 className='font-bold text-xl md:text-2xl text-center ' >No Pain, Only Gain</h1>
          <h2 className='font-extralight text-center text-base md:text-xl dark:text-neutral-200 py-3'>Say goodbye to complex addresses and manual income tracking. <br /> Simplify your finances effortlessly.</h2>
          <div className='w-full  my-4'>
            <h1 className='font-semibold text-xl text-center mb-3'>Join our waitlist</h1>
           <div className='w-full my-8 flex space-x-4 px-3 items-center justify-between'>
             <Input  value={email}  onChange={(e)  => setemail(e.target.value)} placeholder='example@gmail.com' />
             <Button className='bg-orange-600 text-black hover:bg-yellow-600'>Join Now</Button>
           </div>
          
          </div>

</motion.div>
  )
}
