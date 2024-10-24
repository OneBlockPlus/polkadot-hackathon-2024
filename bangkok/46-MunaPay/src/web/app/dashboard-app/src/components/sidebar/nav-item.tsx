/* eslint-disable @typescript-eslint/ban-ts-comment */
//@ts-nocheck

"use client"

import React from 'react'
import Link from 'next/link'

type Props = {
    route : unknown
    item : unknown
}
export default function NavItem({route, item} : Props) {
  const isActive = route === item.link;
   const isHome  = route === "/dashboard"
  return (
    <Link  href={item.link}
    className={` hover:bg-orange-300 ${isActive && "   bg-orange-500 text-white"} ${isHome && item.link === "/play" ? "bg-gray-300 text-blue-500" : ""} flex  space-x-2  items-center my-4   py-2 px-2 rounded-md`}
    >
 
      <item.icon className={`w-6 h-6 `} />
        <p className={` text-sm   font-medium`}>{item.title}</p>
   
     </Link>
  )
}