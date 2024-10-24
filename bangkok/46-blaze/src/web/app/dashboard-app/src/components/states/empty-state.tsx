import React from 'react'


 type Props = {
    title : string
    substitle : string
 }
export default function EmptyState({title, substitle} : Props) {
  return (
    <div className='flex items-center justify-center w-full h-screen'>
    <div  className='flex flex-col space-y-3' >
        <p className='font-semibold'>{title}</p>
        <p>{substitle}</p>
    </div>
    </div>
  )
}
