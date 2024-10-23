
import { cn } from "@/lib/utils"
import { ReactNode } from 'react'

const MaxWidthWrapper = ({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) => {
  return (
    <div
      className={cn(
        'h-full mx-auto w-full min-[2000px]:max-w-screen-2xl   max-w-screen-xl min-[2000px]:px-[10px] px-10 md:px-20',
        className
        //  px-[50px] md:px-[120px] mx-auto aligns object to middle
      )}>
      {children}
    </div>
  )
}

export default MaxWidthWrapper
