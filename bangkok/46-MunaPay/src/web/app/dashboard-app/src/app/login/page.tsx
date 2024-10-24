

import LoginPage from '@/components/screens/login/LoginPage'
import React from 'react'
import withAuth from '../../components/middleware/auth-middleware'
import Image from 'next/image'
const  page = () => {
  return (
    <div  className='flex  w-full min-h-screen '>
      <div className='w-full min-h-screen  bg-zinc-200 flex space-x-2'>
        <div className='w-full h-screen hidden lg:flex bg-orange-200 p-5'>
          <Image  src={`/img/pay.svg`}  width={500} height={500} alt='nakamoto image'  className='w-full h-full' />
        </div>
        <div className='w-full h-full flex items-center justify-center'>
   <LoginPage  />
   </div>
   </div>
    </div>
  )
}

export default page
