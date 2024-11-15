'use Client';
import React from "react";

 interface ButtonProps{
 
  cta: string;
  purpose: "submit" | "reset" | "button" | undefined
  // onClick: DOMAttributes<HTMLButtonElement>.onClick?: React.MouseEventHandler<HTMLButtonElement>;
  Style?: string;
  // onSubmit?: FormEventHandler<HTMLButtonElement>;
  icon?: React.ReactNode;
  // onClick?: MouseEventHandler<HTMLButtonElement>

}
 

export default function Button ({ cta = "Submit", purpose, 
  // onClick, onSubmit, 
  Style, icon }: ButtonProps)  {
  return (
    <div className="flex justify-center items-center">
      <button
        className={`bg-[#D0DFE4] rounded-[16px] px-[20px] py-[8px] w-[128px] items-center text-center min-[2000px]:py-[16px] min-[2000px]:tracking-[1px] min-[2000px]:text-3xl min-[2000px]:w-[200px] flex-shrink-0 border border-[#D0DFE4] text-[#1C1A11] hover:bg-[#FACC15]  hover:text-[#1C1A11] hover:border-none ${Style}`}
        type={purpose}
        // onClick={onClick} 
        // onSubmit={onSubmit} 
      >
        <div className="w-full flex justify-center items-center ">
          {cta}
          {icon}
        </div>
      </button>
    </div>
  );
};





















