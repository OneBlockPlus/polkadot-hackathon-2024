
//@ts-nocheck

"use client"
import React from 'react'
import Home from './Home'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import withAuth from '@/components/middleware/auth-middleware'
import { useUserContext } from '../../providers/user-context'
import AuthAlert from '@/components/notes/AuthAlert'
import { CiWarning } from 'react-icons/ci'

const Dashboard = ()  =>  {
  const {userProfile}  = useUserContext()


    const AUTH_BASE_URL = "https://got-be.onrender.com/auth/"
   const LOCAL_AUTH_URL ="http://localhost:5000/auth/"
     const fetchUserProfile =  async ()  =>   {
       const res = axios.get(`${LOCAL_AUTH_URL}user/${userProfile?.id}`)
       return (await res).data
     }

      const {data, error}  = useQuery({
        queryKey : ['profile'],
        queryFn : fetchUserProfile,
        enabled : !!userProfile
      })
   console.log("the user", data)
   console.log("user error", error)
  return (
    <div  className='w-full   '>
         <div  className=' w-full max-w-[1600px]   min-h-screen  mx-auto relative '>
   
         {
          ! data?.user.businessName  &&(
            <div className='  text-red-500 py-2 px-2 flex items-center justify-center space-x-2 '>
              <CiWarning  className='w-4 h-4 text-red-500'  />
        <p className=' text-sm text-center'>You're almost there! Complete your profile to create invoices and payment links. Click Settings to finish setting up</p>
     </div>
          )
           
         }
      <Home  />
      </div>
    </div>
  )
}

export default  Dashboard
