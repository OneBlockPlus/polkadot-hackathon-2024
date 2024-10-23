import Invoices from '@/components/screens/dashboard/Invoices'
import LatestPayments from '@/components/screens/dashboard/LatestPayments'
import Navbar from '@/components/screens/dashboard/Navbar'
import SideBar2 from '@/components/screens/dashboard/Sidebar2'
import React from 'react'

export default function page() {
  return (
    <div  className='w-full'>

    <Navbar  />

    <div  className=' w-full max-w-[1600px]   min-h-screen  flex space-x-3    mx-auto'>
 <SideBar2  />
 <div  className='w-full'>


    
<Invoices />

        
 </div>

 </div>

  
     
</div>
  )
}
