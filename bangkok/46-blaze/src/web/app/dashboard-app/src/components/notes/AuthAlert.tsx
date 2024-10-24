"use client"

import React, {useState} from 'react'

export default function AuthAlert() {
    const [isShow, setisShow] = useState(true)
  return (
    <div className='absolute top-0 py-2 px-2 flex items-center justify-center bg-orange-500 z-50'>
        <p className='font-semibold text-center'>You're almost there! Complete your profile to create invoices and payment links. Click below to finish setting up</p>
     </div>
  )
}
