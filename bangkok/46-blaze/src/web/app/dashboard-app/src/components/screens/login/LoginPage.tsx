
//@ts-nocheck
"use client"

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Mail } from 'lucide-react'
import React, {useState, useEffect} from 'react'
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSeparator,
    InputOTPSlot,
  } from "@/components/ui/input-otp"
import axios from 'axios'
import { useToast } from '@/components/ui/use-toast'
import { useRouter } from 'next/navigation'
import { useUserContext } from '@/components/providers/user-context'
import { BACKEND_URL } from '@/constants'

        // Email validation RegEx
        const validateEmail = (email) => {
          const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          return re.test(email);
        };
        
export default function  LoginPage()  {
    const [userEmail, setuserEmail] = useState("")
    const [isRequesting, setisRequesting] = useState(false)
    const [otp, setotp] = useState()
    const [otpValue, setotpValue] = useState()
    const {toast}  = useToast()
const {verifyOtp, isSigningIn, userProfile}  = useUserContext()

const [isEmailValid, setIsEmailValid] = useState(false);

const handleEmailChange = (e) => {
  const email = e.target.value;
  setuserEmail(email);

  // Check if email is valid
  if (validateEmail(email)) {
    setIsEmailValid(true);
  } else {
    setIsEmailValid(false);
  }
};
const router = useRouter()

useEffect(() => {
  
    if (userProfile) {
      router.push('/dashboard')
    }
}, [userProfile])


    
   const  BASE_URL  = `${BACKEND_URL}/auth/`
      const  handleReQuestOtp =   async ()  =>  {
        setisRequesting(true)

    try {
        const res = await axios.post(`${BASE_URL}request-otp`, {
            "email" : userEmail
         })

          const OTP_TOKEN  =  res.data?.otp
          setotp(OTP_TOKEN)
          setisRequesting(false)
        
    } catch (error) {
        toast({
            title : "Something went wrong",
            description : "Please check your connection and try again",
            variant : "destructive"
        })
        setisRequesting(false)
        
    }
         
      }

      const  getAuthState =  ()  =>  {
        if(otp){
            return(
                <div className='w-full flex items-center justify-center flex-col'>
                    <div className='border rounded-full p-2 flex items-center justify-center bg-muted my-3 animate-bounce'>
        <Mail  />
       </div>
              <h1 className='text-xl font-semibold text-center my-2'>Email authentication</h1>
              <h2 className='text-sm text-muted-foreground text-center'>
              To continue, please enter the 6-digit verification code sent to your Email: {userEmail}
              </h2>

               <div className='my-4 w-full flex flex-col items-center justify-center'>
               <InputOTP
        maxLength={6}
        value={otpValue}
        onChange={(value) => setotpValue(value)}
        className='w-full'
      >
        <InputOTPGroup className=''>
          <InputOTPSlot index={0} className='w-12 h-12' />
          <InputOTPSlot index={1} className='w-12 h-12'/>
          <InputOTPSlot index={2} className='w-12 h-12'/>
          <InputOTPSlot index={3} className='w-12 h-12'/>
          <InputOTPSlot index={4} className='w-12 h-12'/>
          <InputOTPSlot index={5} className='w-12 h-12'/>
        </InputOTPGroup>
      </InputOTP>


  <div className='flex  items-center justify-center'>
     <p className='text-xs text-muted-foreground'>Didnt receive a code?</p>
     <Button variant={"link"} className='text-blue-500 text-sm' onClick={() => handleReQuestOtp()}>Resend</Button>
  </div>
               </div >
               <Button className='w-full'  disabled={otpValue?.length < 6} onClick={() => verifyOtp(userEmail, otpValue)} >
                {isSigningIn ?  (
                    <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin'  />
                     Submitting OTP..
                    </>
                )  : (
                    <>
                     <Mail  className='w-4 h-4 mr-2' />
                     Continue 
                    </>
                )}
               
             </Button>
                   
                </div>
            )
        }else if(! otp){
            return(
<>
<div className='border rounded-full p-2 flex items-center justify-center bg-muted my-4'>
        <Mail className='w-8 h-8' />
       </div>

 <h1 className='text-2xl font-semibold text-center my-4'>Sign in with your Email</h1>
        <div className='w-full'>
            <Input   placeholder="example.gmail.com"
              value={userEmail}
              onChange={handleEmailChange}
              className='my-4 h-12'
            />

             <Button className='w-full' size={"lg"}  disabled={isSigningIn || ! isEmailValid}  onClick={()  => handleReQuestOtp()} >
                {isRequesting ?  (
                    <>
                    <Loader2 className='w-4 h-4 mr-2 animate-spin'  />
                     Requesting OTP..
                    </>
                )  : (
                    <>
                     <Mail  className='w-4 h-4 mr-2' />
                     Continue with email
                    </>
                )}
               
             </Button>
        </div></>
            )
        }

      }
  return (
    <div  className=' w-[95%] mx-auto md:w-[400px]  p-4 rounded-xl bg-popover border flex flex-col items-center justify-center'>
   {getAuthState()}
    </div>
  )
}





