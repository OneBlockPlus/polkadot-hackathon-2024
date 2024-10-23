import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import React from 'react'
export default function FailedState() {
  return (
    <AnimatePresence>
    < motion.div  
    className='flex items-center justify-center  w-full p-5 rounded-xl border  '
    initial={{ y : 4 }}
    transition={{ease : "easeInOut", duration : 1}}
    animate={{ y: -4 }}
    exit={{ opacity: 0 }}
    key={"error"}
    >
       <div  className='  w-full items-center justify-center  '>
     

<div className='border-b pb-6 pt-3 flex flex-col justify-center items-center '>

    <h1  className='md:text-lg leading-snug font-light text-red-500 text-center mb-2'>Oops, Something Went Wrong!</h1>
     <h2 className='text-muted-foreground text-xs text-center '>An uknown error occured please make  sure you have  enough balance and sign transaction</h2>
</div>

 

   <div>
     
     <h1 className=' text-xs text-center mt-4 text-muted-foreground'>Need assistance  contact our customer support</h1>
   </div>
       </div>

    </motion.div>
    </AnimatePresence>
  )
}
