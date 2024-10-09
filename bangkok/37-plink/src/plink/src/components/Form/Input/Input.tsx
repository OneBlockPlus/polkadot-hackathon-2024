import React, {forwardRef} from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>{
    startIcon?: React.ReactNode
    endIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(({startIcon, endIcon, className,  ...props}, ref) => {
    return <div className={`rounded-xl bg-[#F8F9F8] flex flex-row items-center px-4 ${className}`}>
        {
            !!startIcon && <div className="mr-2 flex flex-row items-center">{startIcon}</div>
        }
        <input className={`rounded-xl !outline-0 flex-1 bg-inherit py-4 text-4 max-w-[100%] ${className}`} {...props } ref={ref}/>
        {
            !!endIcon && <div className="ml-2">{endIcon}</div>
        }
    </div>
})

export default Input
