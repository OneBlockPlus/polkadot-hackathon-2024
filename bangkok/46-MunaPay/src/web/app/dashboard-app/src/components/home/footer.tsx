import { MUNA_PAY_INTRO_TEXT } from '@/constants'
import { XIcon } from 'lucide-react'
import React from 'react'

export default function Footer() {
  return (
    <div className='w-full flex justify-between items-stretch border-t pt-28 space-x-6 px-5 my-4 max-w-[1500px] mx-auto'>
         <div  className='max-w-2xl'>
            <div className='my-2'>
                <h1 className='font-bold text-orange-500 text-4xl'>MunaPay</h1>
            </div>
             <h3 className='text-sm text-muted-foreground'>{MUNA_PAY_INTRO_TEXT}</h3>
             <div className='hidden'>
                <XIcon />
             </div>
         </div>

         <div  className='max-w-3xl'>
            <div>
                <h1 className='font-semibold text-xl my-2 text-muted-foreground'>Docs</h1>
            </div>
              <div className='text-muted-foreground'>
                 <p>Developer docs</p>
                 <p>Platform</p>
              </div>
             <div className='hidden'>
                <XIcon />
             </div>
         </div>

         <div  className='max-w-3xl'>
            <div>
                <h1 className='font-semibold text-xl my-2 text-muted-foreground'>Resources</h1>
            </div>
              <div className='text-muted-foreground'>
                 <p>Branding</p>
                 <p>Hedera</p>
              </div>
             <div className='hidden'>
                <XIcon />
             </div>
         </div>

       

     


      
    </div>
  )
}
