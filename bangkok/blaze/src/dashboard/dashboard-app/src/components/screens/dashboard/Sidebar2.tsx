
"use client"

import { usePathname } from 'next/navigation'
import React from 'react'

export default function SideBar2() {

    const pathName =  usePathname()
  return (
    <div  className=' md:w-[170px]  lg:w-[220px]    h-screen    border-r border-border  hidden md:block    p-3  '>
<p>sidebar 2 comp</p>

  
    </div>
  )
}
