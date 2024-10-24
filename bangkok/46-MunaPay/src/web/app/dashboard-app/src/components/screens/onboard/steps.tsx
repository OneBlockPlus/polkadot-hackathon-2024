
"use client"
import { useState } from "react"
import { useUserContext } from "@/components/providers/user-context"
import { Progress } from "@/components/ui/progress"
import Step1 from "./step-1"

export default function Steps() {
    const [progress, setprogress] = useState(50)
    const {userProfile}  = useUserContext()

  return (
    <div  className='w-full max-h-screen  max-w-[1900px] mx-auto'>
        <div className='my-4'>
         <Progress  value={progress}   className="w-[100%] hidden md:block h-3 " />
         </div>
        <div className='w-full h-[94vh] flex md:space-x-10'>
     <div className='w-full h-full hidden bg-gradient-to-bl from-orange-500 via-orange-600 to-yellow-500 md:flex flex-col space-y-3 items-center justify-center text-white'>
        <h1 className="text-xl md:text-3xl font-bold text-center">Welcome to munaPay</h1>
        <p className="font-light text-xl text-center">Answer a few quick <br /> Questions to get started</p>
     </div>
       <div className='w-full h-[94vh]  p-6 flex flex-col'>
        <h1 className='font-medium text-xl'>Let&apos;s Get Started! Tell Us About You and Your Business.</h1>

         <div  className='mt-5 w-full max-w-2xl'>
          <Step1 setProgress={setprogress} progress={progress} />
         </div>
         
       </div>
       </div>
    </div>
  )
}
