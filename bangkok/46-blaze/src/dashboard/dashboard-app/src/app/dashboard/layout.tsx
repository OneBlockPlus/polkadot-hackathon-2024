import DashboardNav from '@/components/dashbord-nav';
import Sidebar from '@/components/sidebar/side-bar';
import React from 'react'
import { CiWarning } from 'react-icons/ci';

export default function layout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <div>
        <div className='h-8 max-w-xl my-3 mx-auto  w-full flex space-x-2 text-red-500 items-center justify-center md:hidden'> 
            <CiWarning  />
             <h1 className='text-sm font-mono'>Dasboard is not optimised for mobile/small devices yet use your pc for better experience</h1>
          </div>
            <div className='border-b h-[60px] bg-background z-30  sticky top-0 md:ml-[205px] px-3 flex items-center '>
   <DashboardNav  />
      </div>
           
      <div className='min-h-screen'>
        <div className=' hidden  md:flex md:w-[200px] border-r-2 h-screen fixed top-0 bg-gradient-to-tr from-[#d4e157] to-[#388e3c]'><Sidebar  /></div>
        <div  className='md:ml-[205px]'>
         {children}
         </div>
      </div>
        </div>
  )
}

