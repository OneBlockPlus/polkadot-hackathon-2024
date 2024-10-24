
//@ts-nocheck

"use client"


import { BadgeAlert, MailWarning, TimerIcon } from 'lucide-react';
import { ExtensionWarning } from 'magic-sdk';
import { useEffect, useState } from 'react';


type Props =  {
    expTime  : any
}
function CountdownTimer({ expTime }: Props) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = new Date(expTime).getTime() - now;

      if (difference > 0) {
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);
        setTimeLeft(`${minutes}m ${seconds}s`);
      } else {
        setTimeLeft('Expired');
      }
    };

    // Update every second
    const timer = setInterval(calculateTimeLeft, 1000);

    // Cleanup the timer when the component is unmounted
    return () => clearInterval(timer);
  }, [expTime]);

  return (
    <div  className=''>

        {
            timeLeft  ===  "Expired"  ?  (
              <div className='inline-flex  py-1 md:py-1.5 px-2 md:px-3 rounded-xl items-center justify-center  space-x-1  bg-muted'>
               <BadgeAlert className='w-3 h-3 lg:w-4 lg:h-4'   />
               <p className='text-muted-foreground text-sm'>session expired</p>
               </div>

             
            ) : (
<div className='inline-flex  py-1 md:py-1.5 px-2 md:px-3 rounded-xl items-center justify-center  space-x-1  bg-muted'>
    <TimerIcon  className='w-3 h-3 lg:w-4 lg:h-4' />  
     <p  className='text-muted-foreground text-sm'>Pay within  {timeLeft}</p></div>
            )
        }
              

              </div>
  )
}

export default CountdownTimer;
