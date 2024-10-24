import React from 'react'

export default function ErrorsState() {
  return (
    <div  className='w-full h-screen justify-center items-center'>
        <div className='flex items-center flex-col space-y-3'>
      <p className='font-semibold'>Something went wrong</p>
      <p>Check your connection and try again or contact our team</p>
      </div>
    </div>
  )
}
