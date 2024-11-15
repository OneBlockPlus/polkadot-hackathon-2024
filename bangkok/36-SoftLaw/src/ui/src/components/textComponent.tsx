'use client';
import React from "react";


interface ReusableHeadingProps {
    text: string;
    className?: string;  // Optional prop
    detail?: string;
  }
  
  const ReusableHeading: React.FC<ReusableHeadingProps> = ({ text, className, detail }) => {
    return (
        <>
        <div className="gap-[8px] font-Montesarrat">
          <h1 className={`min-[2000px]:text-4xl min-[2000px]:tracking-[1px] text-[28px] text-[#EFF4F6] font-[500] leading-[32px] tracking-[-0.56px] uppercase ${className}`}>
        {text}
      </h1>

      <p className={`text-[16px] pt-[8px] min-[2000px]:text-3xl font-normal leading-[145%] tracking-[0.32px] ${className}`}>{detail}</p> 
        </div>
       
        </>
      
    );
  };
  
  export default ReusableHeading;
  
  