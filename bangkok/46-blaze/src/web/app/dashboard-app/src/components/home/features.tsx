import { features } from '@/constants'
import { motion } from 'framer-motion'
import React from 'react'
export default function Features() {
    const words = [
        {
            text : "Generate payment links"
        },
        {
            text : "Generate payment links"
        },
        {
            text : "Generate payment links"
        },
    ]
  return (
    <motion.div
    initial={{ opacity: 0.0, y: 40 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{
      delay: 0.3,
      duration: 0.8,
      ease: "easeInOut",
    }}
    className="relative flex flex-col gap-4 w-full mx-auto  items-center px-4 my-3"
  >
    <div className='my-4 flex flex-col space-y-2'>
         <h1  className='text-2ssxl md:text-4xl font-bold text-center '>Tailored for Your Needs</h1>
         <p className='font-extralight text-center text-base md:text-2xl dark:text-neutral-200 py-3'>No complexity, no fuss—perfect for every use. <br />
         </p>
    </div>
    <div  className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7  p-4">

        {features.map((item, i) =>  (
            <div key={i} className='border w-full md:w-[370px] p-4 rounded-xl hover:bg-muted'> 
             <div className='p-3 rounded-full inline-flex items-center justify-center bg-yellow-500/25 mb-4'> 
                <item.icone className='w-7 h-7 text-yellow-600' />
                </div> 

                <div  className=''> 
                    <h1 className='font-bold  md:text-lg my-2'>{item.title}</h1>
                    <h2 className='text-muted-foreground'>{item.description}</h2>
                     </div>

                </div>
        ))}
 
    </div>
  </motion.div>
  )
}
