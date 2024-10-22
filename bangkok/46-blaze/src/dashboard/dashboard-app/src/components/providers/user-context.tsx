

"use client"
import React, { createContext, useState, useContext, useEffect } from 'react';

import { jwtDecode } from "jwt-decode";
import axios from 'axios';

import { useRouter } from 'next/navigation';
import { END_POINT_URL } from '@/constants';
 type providerProps = {
  isSigningIn ? :never
  logout : never
     verifyOtp : never
     userProfile : never
 } 
// Create a context
const UserContext = createContext<providerProps | undefined>(undefined);

export const useUserContext = (): providerProps => {
    const context = useContext(UserContext)

    if(!context){
        throw new Error ("must be used in providers")
    }
    return context
}

  type ContextProps = {
    children : React.ReactNode
  }
export const UserContextProvider =({children} : ContextProps) => {

   const [userProfile, setuserProfile] = useState(null)

   const [isSigningIn, setisSigningIn] = useState(false)
const router = useRouter()

      


   


      useEffect(() => {
        const token = localStorage.getItem('kbg5_accessToken');
        if (token) {
            const decoded = jwtDecode(token);
            setuserProfile(decoded);
        }
    }, []);





  //const  LOCAL_BASE_URL  = "http://localhost:5000/api/auth/"


 

  const  verifyOtp =   async (userEmail, otpValue)  =>  {
    setisSigningIn(true)

try {
    const res = await axios.post(`${END_POINT_URL}/api/auth/verify-otp`, {
        "email" : userEmail,
        "enteredOtp" : otpValue
     })

     const token = await res.data;
     console.log("The jwt tokens:", token);
     localStorage.setItem('kbg5_accessToken', token?.token);
     const decoded = jwtDecode(token?.token);
      setisSigningIn(false)
      setuserProfile(decoded);
      router.push("/dashboard")

         
    
} catch (error) {
   console.log("something went rong", error)
    setisSigningIn(false)
    
}
     
  }



const logout = () => {
  localStorage.removeItem('kbg5_accessToken');
  setuserProfile(null);
  router.push("/")
};


   const value = {
    isSigningIn,
    logout,
      userProfile,
       verifyOtp,
   }

   return(
    <UserContext.Provider value={value}>
        {children}
    </UserContext.Provider>
   )

}